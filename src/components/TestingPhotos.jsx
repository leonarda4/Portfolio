import { useEffect, useRef, useState } from 'react'
import './TestingPhotos.css'

const angles = [-5, 3, -1, 6, -3, 1, -7]

export default function TestingPhotos({ block }) {
  const board = useRef(null)
  const drag = useRef(null)
  const order = useRef(10)
  const [positions, setPositions] = useState({})
  const [active, setActive] = useState(null)

  function move(index, x, y, element) {
    const bounds = board.current.getBoundingClientRect()
    const left = bounds.left + window.scrollX
    const top = bounds.top + window.scrollY
    const margin = 20
    const next = {
      x: Math.max(margin - left, Math.min(document.documentElement.clientWidth - left - element.offsetWidth - margin, x)),
      y: Math.max(margin - top, Math.min(document.documentElement.scrollHeight - top - element.offsetHeight - margin, y)),
      z: ++order.current,
    }
    setPositions(previous => ({ ...previous, [index]: next }))
  }

  function start(event, index) {
    if (!event.isPrimary || event.button !== 0 || drag.current) return
    const element = event.currentTarget
    drag.current = { index, pointer: event.pointerId, element, clientX: event.clientX, clientY: event.clientY, x: event.pageX, y: event.pageY, left: element.offsetLeft, top: element.offsetTop }
    element.setPointerCapture(event.pointerId)
    setActive(index)
    setPositions(previous => ({ ...previous, [index]: { x: element.offsetLeft, y: element.offsetTop, z: ++order.current } }))
  }

  useEffect(() => {
    if (active === null) return
    let frame
    const tick = () => {
      const current = drag.current
      if (!current) return
      const edge = 64
      const speed = current.clientY < edge ? -12 : current.clientY > window.innerHeight - edge ? 12 : 0
      if (speed) {
        window.scrollBy(0, speed)
        move(current.index, current.left + current.clientX + window.scrollX - current.x, current.top + current.clientY + window.scrollY - current.y, current.element)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active])

  function stop(event) {
    if (drag.current?.pointer !== event.pointerId) return
    drag.current = null
    setActive(null)
  }

  return <figure className="testing-photos">
    <div className="testing-photos-board" ref={board}>
      {block.items.map((photo, index) => {
        const position = positions[index]
        return <button
          type="button"
          key={index}
          className={`testing-photo${active === index ? ' is-dragging' : ''}`}
          style={{ '--angle': `${angles[index % angles.length]}deg`, '--column': index % 3, '--row': Math.floor(index / 3), ...(position ? { left: `${position.x / (board.current?.clientWidth || 1) * 100}%`, top: `${position.y / (board.current?.clientHeight || 1) * 100}%`, zIndex: position.z } : {}) }}
          aria-label={`${photo.alt || `Testing photo ${index + 1}`}. Move photo with arrow keys.`}
          onPointerDown={event => start(event, index)}
          onPointerMove={event => {
            const current = drag.current
            if (!current || current.pointer !== event.pointerId) return
            current.clientX = event.clientX
            current.clientY = event.clientY
            move(index, current.left + event.pageX - current.x, current.top + event.pageY - current.y, event.currentTarget)
          }}
          onPointerUp={stop}
          onPointerCancel={stop}
          onLostPointerCapture={stop}
          onKeyDown={event => {
            const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key]
            if (!direction) return
            event.preventDefault()
            const step = event.shiftKey ? 30 : 10
            move(index, event.currentTarget.offsetLeft + direction[0] * step, event.currentTarget.offsetTop + direction[1] * step, event.currentTarget)
          }}
        >
          {photo.src ? <img src={photo.src} alt={photo.alt} draggable="false" loading="lazy" /> : <span className="testing-photo-placeholder"><span aria-hidden="true">＋</span>Testing photo {String(index + 1).padStart(2, '0')}</span>}
        </button>
      })}
    </div>
    {block.caption && <figcaption>{block.caption}</figcaption>}
  </figure>
}
