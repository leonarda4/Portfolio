import { SUPPORTING_PALETTE } from '../../../design-system/playful-palette.js'

export const DRAWING_COLORS = SUPPORTING_PALETTE.map(color => color.crayon)

export function nextDrawingColor(previous) {
  const choices = DRAWING_COLORS.filter(color => color !== previous)
  return choices[Math.floor(Math.random() * choices.length)]
}

const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y)
const round = value => Math.round(value * 100) / 100
const point = value => `${round(value.x)} ${round(value.y)}`

function smoothPoints(points) {
  if (points.length < 3) return points
  return points.map((value, index) => {
    if (!index || index === points.length - 1) return value
    const before = points[index - 1]
    const after = points[index + 1]
    return { ...value, x: (before.x + value.x * 2 + after.x) / 4, y: (before.y + value.y * 2 + after.y) / 4 }
  })
}

function resample(points, spacing = 2) {
  const sampled = [{ ...points[0], length: 0 }]
  let length = 0
  let next = spacing
  for (let index = 1; index < points.length; index += 1) {
    const a = points[index - 1]
    const b = points[index]
    const segment = distance(a, b)
    if (!segment) continue
    while (next <= length + segment) {
      const t = (next - length) / segment
      sampled.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, pressure: a.pressure + (b.pressure - a.pressure) * t, length: next })
      next += spacing
    }
    length += segment
  }
  const last = points[points.length - 1]
  if (distance(sampled[sampled.length - 1], last) > .1) sampled.push({ ...last, length })
  return sampled
}

// A filled ribbon keeps the mark opaque at crossings. Its small, stable edge
// variations follow distance along the stroke, rather than changing each frame.
export function melodramaPath(rawPoints, seed = 0, size = 12) {
  if (!rawPoints.length) return ''
  const points = resample(smoothPoints(rawPoints))
  const first = points[0]
  if (points.length < 2) {
    const radius = size / 2
    return `M ${round(first.x - radius)} ${round(first.y)} a ${radius} ${radius} 0 1 0 ${size} 0 a ${radius} ${radius} 0 1 0 ${-size} 0 Z`
  }

  const left = []
  const right = []
  const angles = []
  const radii = []
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index]
    const before = points[Math.max(0, index - 2)]
    const after = points[Math.min(points.length - 1, index + 2)]
    const angle = Math.atan2(after.y - before.y, after.x - before.x)
    const normalX = -Math.sin(angle)
    const normalY = Math.cos(angle)
    const pressure = .82 + Math.min(1, Math.max(0, current.pressure ?? .5)) * .36
    const body = Math.sin(current.length * .055 + seed) * .85 + Math.sin(current.length * .14 + seed * 1.7) * .4
    const grain = Math.sin(current.length * .67 + seed * 2.3) * .22 + Math.sin(current.length * 1.1 + seed) * .12
    const radius = size / 2 * pressure + body
    left.push({ x: current.x + normalX * (radius + grain), y: current.y + normalY * (radius + grain) })
    right.push({ x: current.x - normalX * (radius - grain), y: current.y - normalY * (radius - grain) })
    angles.push(angle)
    radii.push(radius)
  }

  const last = points[points.length - 1]
  const endAngle = angles[angles.length - 1]
  const endRadius = radii[radii.length - 1]
  const outline = [...left]
  for (let step = 1; step < 8; step += 1) {
    const angle = endAngle + Math.PI / 2 - Math.PI * step / 8
    outline.push({ x: last.x + Math.cos(angle) * endRadius, y: last.y + Math.sin(angle) * endRadius })
  }
  outline.push(...right.reverse())
  for (let step = 1; step < 8; step += 1) {
    const angle = angles[0] - Math.PI / 2 - Math.PI * step / 8
    outline.push({ x: first.x + Math.cos(angle) * radii[0], y: first.y + Math.sin(angle) * radii[0] })
  }

  // Midpoint quadratics soften sampled edges without losing their hand-drawn feel.
  const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })
  let path = `M ${point(midpoint(outline[outline.length - 1], outline[0]))}`
  outline.forEach((value, index) => { path += ` Q ${point(value)} ${point(midpoint(value, outline[(index + 1) % outline.length]))}` })
  return `${path} Z`
}
