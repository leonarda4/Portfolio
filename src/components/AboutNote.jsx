import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { freeDrop } from './stickers/placement'
import { createDragScroller } from './stickers/drag-scroll'

// Keep the authored slot in the layout, but render the paper outside the scaled
// collage so it can travel across the whole page without clipping or stacking traps.
export default function AboutNote({ children }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [frame, setFrame] = useState(null)
  const [dragging, setDragging] = useState(false)
  const slot = useRef(null)
  const button = useRef(null)
  const gesture = useRef(null)

  useLayoutEffect(() => {
    function measure() {
      const box = slot.current.getBoundingClientRect()
      const style = getComputedStyle(slot.current)
      const next = { left: box.left + window.scrollX, top: box.top + window.scrollY,
        width: slot.current.offsetWidth, height: slot.current.offsetHeight,
        scale: box.width / slot.current.offsetWidth, color: style.backgroundColor }
      setFrame(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(slot.current)
    observer.observe(document.getElementById('main-content'))
    // The collage switches layouts without necessarily resizing each paper.
    const layoutObserver = new MutationObserver(measure)
    layoutObserver.observe(slot.current.closest('.home-personal'), { attributes: true })
    window.addEventListener('resize', measure)
    measure()
    return () => {
      observer.disconnect()
      layoutObserver.disconnect()
      window.removeEventListener('resize', measure)
      gesture.current?.scroller?.stop()
    }
  }, [])

  function cancel() {
    const current = gesture.current
    if (!current) return
    current.scroller?.stop()
    gesture.current = null
    setOffset(current.offset)
    setDragging(false)
    if (button.current?.hasPointerCapture(current.pointerId)) button.current.releasePointerCapture(current.pointerId)
  }

  function start(event) {
    if (event.button !== 0 || !event.isPrimary || gesture.current) return
    const text = event.currentTarget.firstElementChild
    if (text?.contains(event.target) && text.scrollHeight > text.clientHeight) return
    event.preventDefault()
    event.currentTarget.focus({ preventScroll: true })
    const box = event.currentTarget.getBoundingClientRect()
    gesture.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY,
      grabX: event.clientX - box.left, grabY: event.clientY - box.top, box, offset,
      originX: box.left + window.scrollX - offset.x, originY: box.top + window.scrollY - offset.y }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function move(event) {
    const current = gesture.current
    if (!current || event.pointerId !== current.pointerId) return
    if (!current.moved && Math.hypot(event.clientX - current.startX, event.clientY - current.startY) < 4) return
    current.moved = true
    current.clientX = event.clientX
    current.clientY = event.clientY
    const point = freeDrop(event.clientX - current.grabX, event.clientY - current.grabY, current.box)
    setOffset({ x: point.left + window.scrollX - current.originX, y: point.top + window.scrollY - current.originY })
    setDragging(true)
    if (!current.scroller) current.scroller = createDragScroller(() => move({ pointerId: current.pointerId, clientX: current.clientX, clientY: current.clientY }))
    current.scroller.update(event.clientX, event.clientY)
  }

  function finish(event) {
    if (event.pointerId !== gesture.current?.pointerId) return
    move(event)
    gesture.current.scroller?.stop()
    gesture.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  function key(event) {
    if (event.metaKey || event.ctrlKey || event.altKey) return
    const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key]
    if (!direction && !['Home', 'Escape', 'Delete', 'Backspace'].includes(event.key)) return
    event.preventDefault()
    event.stopPropagation()
    if (event.key === 'Delete' || event.key === 'Backspace') return
    if (event.key === 'Escape' && gesture.current) { cancel(); return }
    if (!direction) { setOffset({ x: 0, y: 0 }); return }
    if (gesture.current) return
    const box = event.currentTarget.getBoundingClientRect()
    const step = event.shiftKey ? 30 : 10
    const point = freeDrop(box.left + direction[0] * step, box.top + direction[1] * step, box)
    setOffset(previous => ({ x: previous.x + point.left - box.left, y: previous.y + point.top - box.top }))
  }

  return <>
    <div ref={slot} className="about-note-paper about-note-slot" aria-hidden="true"><span>{children}</span></div>
    {frame && createPortal(<button ref={button} type="button" className={`about-note-paper about-note-floating${dragging ? ' is-dragging' : ''}`}
      style={{ left: frame.left + offset.x, top: frame.top + offset.y, width: frame.width, height: frame.height,
        '--note-color': frame.color, transform: `scale(${frame.scale})` }}
      aria-describedby="about-note-move-help" title="Drag to move. Arrow keys move; Home resets."
      onPointerDown={start} onPointerMove={move} onPointerUp={finish}
      onPointerCancel={cancel} onLostPointerCapture={cancel} onKeyDown={key}>
      <span>{children}</span>
    </button>, document.body)}
  </>
}
