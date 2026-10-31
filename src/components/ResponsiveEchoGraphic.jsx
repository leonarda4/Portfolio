import { useLayoutEffect, useRef } from 'react'
import { ContentGraphic } from './echo-graphics/graphics'
import './ResponsiveEchoGraphic.css'

const SVG_NS = 'http://www.w3.org/2000/svg'
const GEOMETRY = 'path, line, polyline, polygon, circle, ellipse, rect'
const SYSTEM_IDS = new Set(['system-architecture', 'feedback-loop', 'installation-space'])

function union(a, b) {
  if (!b) return a
  if (!a) return b
  const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y)
  return { x, y, width: Math.max(a.x + a.width, b.x + b.width) - x, height: Math.max(a.y + a.height, b.y + b.height) - y }
}

function transformedBounds(element, root) {
  const screen = element.getScreenCTM(), rootScreen = root.getScreenCTM()
  if (!screen || !rootScreen) return null
  const matrix = rootScreen.inverse().multiply(screen)
  const { x, y, width, height } = element.getBBox()
  const points = [[x, y], [x + width, y], [x, y + height], [x + width, y + height]]
    .map(([px, py]) => new DOMPoint(px, py).matrixTransform(matrix))
  const xs = points.map(point => point.x), ys = points.map(point => point.y)
  return { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) }
}

function isCanvas(element) {
  return element.tagName.toLowerCase() === 'rect' && (
    element.getAttribute('width') === '100%' && element.getAttribute('height') === '100%' ||
    element.getAttribute('width') === '1200' && element.getAttribute('height') === '675'
  )
}

function setFrame(svg, bounds, fit) {
  svg.setAttribute('viewBox', `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`)
  svg.setAttribute('width', bounds.width)
  svg.setAttribute('height', bounds.height)
  svg.style.height = fit === 'contain' ? '100%' : 'auto'
  svg.style.aspectRatio = `${bounds.width} / ${bounds.height}`
}

function containedFrame(content, width, height, inset = 2) {
  const scale = Math.min((width - inset * 2) / content.width, (height - inset * 2) / content.height)
  const gap = inset / Math.max(scale, .0001)
  return { x: content.x - gap, y: content.y - gap, width: content.width + gap * 2, height: content.height + gap * 2 }
}

function labelWidth(id, title, scale, width) {
  if (id === 'system-architecture') {
    if (/^M[1-4] \/ /.test(title)) return (title.startsWith('M4') ? 178 : 148) * scale
    if (title === 'Camera') return 142 * scale
    if (title === 'Python processing') return 390 * scale
    if (title === 'Browser') return 200 * scale
    if (title === 'CSV / JSON') return 220 * scale
    return 360 * scale
  }
  if (id === 'installation-space') return Math.min(140, width * .21)
  if (id === 'feedback-loop') return (title === 'Tracking' || title === 'Response' ? 205 : 410) * scale
  return width * .85
}

// Responsive fitting never splits the original diagram terminology into fragments.
function wrapLine(line, maxWidth, measure) {
  const lines = []
  let current = ''
  for (const word of line.split(/\s+/)) {
    if (current && measure(`${current} ${word}`) > maxWidth) {
      lines.push(current)
      current = ''
    }
    current = current ? `${current} ${word}` : word
  }
  if (current) lines.push(current)
  return lines
}

function separateLabels(labels, gap) {
  const ordered = [...labels].sort((a, b) => a.bounds.y - b.bounds.y || a.bounds.x - b.bounds.x)
  const placed = []
  for (const label of ordered) {
    for (let pass = 0; pass < labels.length; pass++) {
      const collision = placed.find(other => (
        label.bounds.x < other.bounds.x + other.bounds.width + gap &&
        label.bounds.x + label.bounds.width + gap > other.bounds.x &&
        label.bounds.y < other.bounds.y + other.bounds.height + gap &&
        label.bounds.y + label.bounds.height + gap > other.bounds.y
      ))
      if (!collision) break
      const shift = collision.bounds.y + collision.bounds.height + gap - label.bounds.y
      label.shift += shift
      label.bounds.y += shift
    }
    placed.push(label)
  }
}

/** Native animated SVG with a stable crop and equally sized readable labels. */
export default function ResponsiveEchoGraphic({ id, time, loop = true, fit = 'width', className = '' }) {
  const ref = useRef(null), labelsRef = useRef(null), leadersRef = useRef(null)

  useLayoutEffect(() => {
    const host = ref.current, svg = host.querySelector(':scope > svg')
    if (!svg) return
    const overlay = labelsRef.current.ownerSVGElement
    const system = SYSTEM_IDS.has(id)
    const authoredFrame = { x: 0, y: 0, width: system ? 1200 : 1920, height: system ? 675 : 1080 }
    const context = document.createElement('canvas').getContext('2d')
    const narrow = window.matchMedia('(max-width: 600px)')
    let geometry = null, raf = 0, disposed = false, lastWidth = -1, lastHeight = -1

    function fitGraphic() {
      if (disposed || host.clientWidth < 1 || fit === 'contain' && host.clientHeight < 1) return
      mutations.disconnect()
      for (const nested of svg.querySelectorAll('svg[viewBox="0 0 1200 675"]')) {
        nested.setAttribute('width', '1200')
        nested.setAttribute('height', '675')
        nested.style.setProperty('width', '1200px', 'important')
        nested.style.setProperty('height', '675px', 'important')
        nested.style.overflow = 'visible'
      }
      const applyFrame = bounds => {
        setFrame(svg, bounds, fit)
        setFrame(overlay, bounds, 'contain')
      }
      applyFrame(authoredFrame)
      if (!geometry) {
        for (const element of svg.querySelectorAll(GEOMETRY)) {
          if (!isCanvas(element)) geometry = union(geometry, transformedBounds(element, svg))
        }
        geometry ||= authoredFrame
        if (!system) geometry = union(geometry, authoredFrame)
        // Verified across 129 samples of each full system animation: fixed
        // plates, orbit and room enclose every moving geometry element.
        const motionGuard = id === 'installation-space' ? 20 : 5
        geometry = { x: geometry.x - motionGuard, y: geometry.y - motionGuard, width: geometry.width + motionGuard * 2, height: geometry.height + motionGuard * 2 }
      }
      const labels = [], seen = new Set()
      const inverse = svg.getScreenCTM().inverse()
      for (const original of svg.querySelectorAll('text')) {
        const matrix = inverse.multiply(original.getScreenCTM())
        const transform = `matrix(${[matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f].join(' ')})`
        const spans = [...original.querySelectorAll(':scope > tspan')]
        const lines = spans.length ? spans.map(span => span.textContent) : [original.textContent]
        const x = original.getAttribute('x') || '0'
        const key = `${lines.join('\n')}|${x}|${original.getAttribute('y')}|${transform}`
        // React's original text subtree stays intact. A separate owned layer
        // handles wrapping and shares labels between animation crossfade groups.
        original.style.visibility = 'hidden'
        if (seen.has(key)) continue
        seen.add(key)
        const text = original.cloneNode(true), style = getComputedStyle(original)
        text.style.visibility = 'visible'
        text.style.fontFamily = style.fontFamily
        text.style.fontWeight = style.fontWeight
        text.setAttribute('text-anchor', style.textAnchor)
        if (!text.hasAttribute('fill')) text.setAttribute('fill', 'currentColor')
        text.setAttribute('transform', transform)
        const anchor = new DOMPoint(Number(x), Number(original.getAttribute('y') || 0)).matrixTransform(matrix)
        const authoredSize = parseFloat(original.getAttribute('font-size') || style.fontSize)
        const hierarchy = authoredSize * Math.hypot(matrix.a, matrix.b) / (system ? 17.5 : 28)
        labels.push({ text, lines, x, transform, anchor, hierarchy, title: lines.join(' ') })
      }
      labelsRef.current.replaceChildren(...labels.map(label => label.text))
      const labelSize = narrow.matches ? 12 : 13
      let frame = geometry
      applyFrame(frame)

      function layoutLabels() {
        const rootMatrix = svg.getScreenCTM()
        if (!rootMatrix) return null
        const rootScale = Math.hypot(rootMatrix.a, rootMatrix.b)
        const gap = 6 / rootScale
        let content = geometry
        for (const label of labels) {
          const { text, lines: originalLines, x, transform, title } = label
          text.setAttribute('transform', transform)
          label.shift = 0
          const matrix = text.getScreenCTM()
          const scale = matrix && Math.hypot(matrix.a, matrix.b)
          if (!scale) continue
          const labelPixels = labelSize * label.hierarchy
          const fontSize = labelPixels / scale
          text.style.fontSize = `${fontSize}px`
          const style = getComputedStyle(text)
          context.font = `${style.fontWeight} ${labelPixels}px ${style.fontFamily}`
          const measure = value => context.measureText(value).width
          const longestWord = Math.max(...originalLines.flatMap(line => line.split(/\s+/)).map(measure))
          const maxWidth = Math.max(110 * label.hierarchy, longestWord + 2, labelWidth(id, title, rootScale, host.clientWidth))
          const lines = originalLines.flatMap(line => wrapLine(line, maxWidth, measure))
          text.replaceChildren(...lines.map((line, index) => {
            const span = document.createElementNS(SVG_NS, 'tspan')
            span.setAttribute('x', x)
            span.setAttribute('dy', index ? String(fontSize * 1.25) : '0')
            span.textContent = line
            return span
          }))
          label.bounds = transformedBounds(text, svg)
        }
        const move = (label, amount) => {
          if (!label) return
          label.shift += amount
          label.bounds.y += amount
        }
        const find = title => labels.find(label => label.title === title)
        if (id === 'system-architecture') {
          const processing = find('Python processing'), browser = find('Browser'), webgl = find('WebGL + GLSL / Tone.js')
          // Put complete labels above the processing/browser bracket (y=162),
          // then put the technology annotation above Browser with a visible gap.
          for (const label of [processing, browser]) {
            if (label) move(label, Math.min(0, 162 - gap - label.bounds.y - label.bounds.height))
          }
          if (webgl && browser) move(webgl, Math.min(0, browser.bounds.y - gap - webgl.bounds.y - webgl.bounds.height))
          const nodes = [[-380, 0], [-210, -10], [-30, -25], [155, -30], [355, -45]]
          for (const label of labels) {
            const index = label.title === 'Camera' ? 0 : /^M[1-4] \/ /.test(label.title) ? Number(label.title[1]) : -1
            if (index < 0) continue
            const [x, y] = nodes[index]
            const plateBottom = 420 + (x + y + 105) * .43 - (20 + index * 3.5) + 5
            move(label, Math.max(0, plateBottom + gap - label.bounds.y))
          }
        }
        if (id === 'feedback-loop') {
          for (const [title, bottom] of [['Tracking', 390.76], ['Response', 412.04], ['Perception and adaptation', 557.64]]) {
            const label = find(title)
            if (label) move(label, Math.max(0, bottom + gap - label.bounds.y))
          }
        }
        separateLabels(labels, gap)
        const leaders = []
        for (const label of labels) {
          label.text.setAttribute('transform', `translate(0 ${label.shift}) ${label.transform}`)
          content = union(content, label.bounds)
          if (label.shift * rootScale < 9 || ['Python processing', 'Browser', 'WebGL + GLSL / Tone.js'].includes(label.title)) continue
          const line = document.createElementNS(SVG_NS, 'line')
          for (const [key, value] of Object.entries({ x1: label.anchor.x, x2: label.anchor.x, y1: label.anchor.y, y2: label.bounds.y - 3 / rootScale, stroke: 'currentColor', 'stroke-width': '.65', 'vector-effect': 'non-scaling-stroke', opacity: '.45' })) line.setAttribute(key, value)
          leaders.push(line)
        }
        leadersRef.current.replaceChildren(...leaders)
        return { content, rootScale }
      }

      // Keep the shared label size where it fits. A short, fixed cover must
      // never grow or enter a runaway text/crop loop to accommodate typography.
      let converged = false
      for (let pass = 0; pass < 32; pass++) {
        const layout = layoutLabels()
        if (!layout) break
        const { content, rootScale } = layout, gap = 2 / rootScale
        const next = union(frame, { x: content.x - gap, y: content.y - gap, width: content.width + gap * 2, height: content.height + gap * 2 })
        if (fit === 'contain' && (next.width > authoredFrame.width * 3 || next.height > authoredFrame.height * 3)) break
        const delta = Math.max(Math.abs(next.x - frame.x), Math.abs(next.y - frame.y), Math.abs(next.width - frame.width), Math.abs(next.height - frame.height))
        frame = next
        applyFrame(frame)
        if (delta * rootScale < .01) {
          converged = true
          break
        }
      }
      const finalLayout = layoutLabels()
      const remaining = finalLayout && Math.max(
        frame.x - finalLayout.content.x,
        frame.y - finalLayout.content.y,
        finalLayout.content.x + finalLayout.content.width - frame.x - frame.width,
        finalLayout.content.y + finalLayout.content.height - frame.y - frame.height,
      ) * finalLayout.rootScale
      if (fit === 'contain' && (!converged || remaining > .5)) {
        // Lay out once at the available drawing scale, then fit the complete
        // drawing and labels proportionally into the existing slot. Keeping
        // that final font scale avoids oversized labels, clipping or overlap.
        applyFrame(geometry)
        const layout = layoutLabels()
        if (layout) {
          frame = containedFrame(layout.content, host.clientWidth, host.clientHeight)
          applyFrame(frame)
        }
        host.dataset.labelFit = 'scaled-with-artwork'
      } else host.dataset.labelFit = 'shared'
      mutations.observe(svg, { childList: true, subtree: true })
    }

    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(fitGraphic)
    }
    const mutations = new MutationObserver(schedule)
    const resize = new ResizeObserver(() => {
      const width = host.clientWidth, height = fit === 'contain' ? host.clientHeight : 0
      if (width !== lastWidth || height !== lastHeight) {
        lastWidth = width
        lastHeight = height
        schedule()
      }
    })
    fitGraphic()
    resize.observe(host)
    narrow.addEventListener('change', schedule)
    document.fonts?.ready.then(() => { if (!disposed) schedule() })
    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      resize.disconnect()
      mutations.disconnect()
      narrow.removeEventListener('change', schedule)
    }
  }, [id, fit])

  return <div ref={ref} className={`echo-fitted-graphic responsive-echo-graphic echo-fitted-graphic--${fit} ${className}`.trim()}>
    <ContentGraphic id={id} time={time} loop={loop} />
    <svg className="echo-fitted-graphic__labels" aria-hidden="true" focusable="false"><g ref={leadersRef} /><g ref={labelsRef} /></svg>
  </div>
}
