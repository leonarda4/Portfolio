import { anchorAt, boxForAnchor } from '../stickers/placement.js'
import { melodramaPath } from './brush.js'

export function captureStroke(points, seed) {
  const xs = points.map(point => point.x)
  const ys = points.map(point => point.y)
  const x = (Math.min(...xs) + Math.max(...xs)) / 2
  const y = (Math.min(...ys) + Math.max(...ys)) / 2
  const match = anchorAt(x - window.scrollX, y - window.scrollY)
  const fallbackX = Math.min(1, Math.max(0, x / window.innerWidth))
  const fallbackY = Math.max(0, y)
  const placement = match ? {
    anchor: match.anchor,
    x: (x - window.scrollX - match.box.left) / match.box.width,
    y: (y - window.scrollY - match.box.top) / match.box.height,
    width: match.box.width,
    fallbackX, fallbackY,
  } : { anchor: 'page', x: fallbackX, y: fallbackY, width: window.innerWidth, fallbackX, fallbackY }
  return { path: melodramaPath(points.map(point => ({ ...point, x: point.x - x, y: point.y - y })), seed), placement }
}

export function strokeTransform(placement) {
  const box = boxForAnchor(placement.anchor)
  // A single scale preserves the shape instead of stretching it when text reflows.
  const scale = (box?.width || window.innerWidth) / placement.width
  const x = box ? box.left + window.scrollX + box.width * placement.x : window.innerWidth * placement.fallbackX
  const y = box ? box.top + window.scrollY + box.height * placement.y : placement.fallbackY
  return `translate(${x} ${y}) scale(${scale})`
}
