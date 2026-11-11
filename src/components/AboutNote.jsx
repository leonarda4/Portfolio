import { useEffect, useRef, useState } from 'react'
import { clampDrop, safeDrop } from './stickers/placement'

// Only the local offset changes. The authored text, color, and original position
// never enter the visitor board's edit, delete, or persistence APIs.
export default function AboutNote({ children }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const button = useRef(null)
  const gesture = useRef(null)

  function cancel() {
    const current = gesture.current
    if (!current) return
    gesture.current = null
    setOffset(current.offset)
    setDragging(false)
    if (button.current?.hasPointerCapture(current.pointerId)) button.current.releasePointerCapture(current.pointerId)
  }

  useEffect(() => {
    let width = window.innerWidth
    const resize = () => {
      if (width === window.innerWidth) return
      width = window.innerWidth
      cancel()
      setOffset({ x: 0, y: 0 })
    }
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  function start(event) {
    if (event.button !== 0 || !event.isPrimary || gesture.current) return
    // Long notes scroll inside the same fixed paper size as visitor notes.
    const text = event.currentTarget.firstElementChild
    if (text?.contains(event.target) && text.scrollHeight > text.clientHeight) return
    event.preventDefault()
    event.currentTarget.focus({ preventScroll: true })
    const box = event.currentTarget.getBoundingClientRect()
    gesture.current = {
      pointerId: event.pointerId,
      clientX: event.clientX, clientY: event.clientY,
      scrollX: window.scrollX, scrollY: window.scrollY,
      box, offset,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
  }

  function move(event, drop = false) {
    const current = gesture.current
    if (!current || event.pointerId !== current.pointerId) return
    if (!current.moved && Math.hypot(event.clientX - current.clientX, event.clientY - current.clientY) < 4) return
    current.moved = true
    const rawLeft = current.box.left + event.clientX - current.clientX
    const rawTop = current.box.top + event.clientY - current.clientY
    const point = (drop ? safeDrop : clampDrop)(rawLeft, rawTop, current.box)
    setOffset({
      x: current.offset.x + point.left - current.box.left + window.scrollX - current.scrollX,
      y: current.offset.y + point.top - current.box.top + window.scrollY - current.scrollY,
    })
  }

  function finish(event) {
    if (event.pointerId !== gesture.current?.pointerId) return
    move(event, true)
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
    const point = safeDrop(box.left + direction[0] * step, box.top + direction[1] * step, box)
    setOffset(previous => ({ x: previous.x + point.left - box.left, y: previous.y + point.top - box.top }))
  }

  return <button ref={button} type="button" className={`about-note-paper${dragging ? ' is-dragging' : ''}`}
    style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
    aria-describedby="about-note-move-help" title="Drag to move. Arrow keys move; Home resets."
    onPointerDown={start} onPointerMove={move} onPointerUp={finish}
    onPointerCancel={cancel} onLostPointerCapture={cancel} onKeyDown={key}>
    <span>{children}</span>
  </button>
}
