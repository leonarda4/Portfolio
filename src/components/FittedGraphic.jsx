import { useLayoutEffect, useRef } from 'react'
import { ContentGraphic } from './echo-graphics/graphics'
import './FittedGraphic.css'

const DRAWING = 'path, line, polyline, polygon, circle, ellipse, rect, text'
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

/** Fit the original SVG as one drawing, including its authored text hierarchy.
 * AGENTS.md requires proportional artwork: never impose fixed screen-pixel
 * label sizes or rewrite the original labels to make enlarged type fit.
 */
export default function FittedGraphic({ id, time, loop = true, fit = 'width', className = '' }) {
  const ref = useRef(null)

  useLayoutEffect(() => {
    const host = ref.current, svg = host.querySelector(':scope > svg')
    if (!svg) return
    const system = SYSTEM_IDS.has(id)
    const authoredFrame = { x: 0, y: 0, width: system ? 1200 : 1920, height: system ? 675 : 1080 }
    let frame = null, disposed = false

    function fitGraphic() {
      if (disposed || host.clientWidth < 1) return
      // Nested system drawings retain their authored coordinates when the
      // outer viewport is cropped. Text scales with the rest of the artwork.
      for (const nested of svg.querySelectorAll('svg[viewBox="0 0 1200 675"]')) {
        nested.setAttribute('width', '1200')
        nested.setAttribute('height', '675')
        nested.style.setProperty('width', '1200px', 'important')
        nested.style.setProperty('height', '675px', 'important')
        nested.style.overflow = 'visible'
      }
      let drawing = null
      for (const element of svg.querySelectorAll(DRAWING)) {
        if (!isCanvas(element)) drawing = union(drawing, transformedBounds(element, svg))
      }
      // The fixed plates, orbit, and room enclose the three system animations.
      // Other studies retain their full authored motion envelope. Padding also
      // protects strokes and small pulses at the edge of the cropped drawing.
      if (!system) drawing = union(drawing, authoredFrame)
      drawing ||= authoredFrame
      const padding = 12
      frame = union(frame, {
        x: drawing.x - padding,
        y: drawing.y - padding,
        width: drawing.width + padding * 2,
        height: drawing.height + padding * 2,
      })
      svg.setAttribute('viewBox', `${frame.x} ${frame.y} ${frame.width} ${frame.height}`)
      svg.setAttribute('width', frame.width)
      svg.setAttribute('height', frame.height)
      svg.style.height = fit === 'contain' ? '100%' : 'auto'
      svg.style.aspectRatio = `${frame.width} / ${frame.height}`
    }

    fitGraphic()
    // Only new crossfade scene groups need remeasuring. Responsive sizing is
    // handled by SVG scaling, without a resize observer or text reflow loop.
    const mutations = new MutationObserver(fitGraphic)
    mutations.observe(svg, { childList: true, subtree: true })
    document.fonts?.ready.then(fitGraphic)
    return () => {
      disposed = true
      mutations.disconnect()
    }
  }, [id, fit])

  return <div ref={ref} className={`echo-fitted-graphic echo-fitted-graphic--${fit} ${className}`.trim()}>
    <ContentGraphic id={id} time={time} loop={loop} />
  </div>
}
