import { useId, useLayoutEffect, useRef, useState } from 'react'

const GAP = 16
const DURATION = 360

export default function SoundscapeCarousel({ items, renderItem }) {
  const [first, setFirst] = useState(0)
  const [direction, setDirection] = useState(0)
  const [size, setSize] = useState({ card: 332, viewport: 680, pageSize: 2 })
  const root = useRef(null)
  const motion = useRef(0)
  const timer = useRef(null)
  const unlockFrame = useRef(null)
  const locked = useRef(false)
  const pointer = useRef(null)
  const measuredWidth = useRef(null)
  const trackId = useId()
  const count = items.length
  const wrap = index => (index + count) % count

  useLayoutEffect(() => {
    function measure() {
      const rect = root.current.getBoundingClientRect()
      if (rect.width === measuredWidth.current) return
      measuredWidth.current = rect.width
      const pageSize = rect.width >= 600 ? 2 : 1
      clearTimeout(timer.current)
      cancelAnimationFrame(unlockFrame.current)
      motion.current = 0
      locked.current = false
      setDirection(0)
      setFirst(current => Math.floor(current / pageSize) * pageSize)
      setSize({ card: (rect.width - GAP * (pageSize - 1)) / pageSize, viewport: rect.width, pageSize })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(root.current)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
      clearTimeout(timer.current)
      cancelAnimationFrame(unlockFrame.current)
    }
  }, [])

  function finishMove() {
    if (!motion.current) return
    const step = motion.current
    motion.current = 0
    clearTimeout(timer.current)
    setFirst(current => wrap(current + step))
    setDirection(0)
    // Reorder offscreen cards without animating the reset at the loop seam.
    unlockFrame.current = requestAnimationFrame(() => { locked.current = false })
  }

  function move(sign) {
    if (locked.current) return
    const step = sign * size.pageSize
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFirst(current => wrap(current + step))
      return
    }
    locked.current = true
    motion.current = step
    setDirection(step)
    timer.current = setTimeout(finishMove, DURATION + 80)
  }

  const ordered = Array.from({ length: count }, (_, offset) => wrap(first + offset))
  // The outer copies are visual only; the six original cards keep their state.
  const slides = [
    ...Array.from({ length: size.pageSize }, (_, offset) => ({ index: wrap(first - size.pageSize + offset), key: `before-${offset}`, copy: true })),
    ...ordered.map((index, offset) => ({ index, key: items[index].id, offset })),
    ...ordered.map((index, offset) => ({ index, key: `after-${offset}`, copy: true })),
  ]
  const pageNames = ordered.slice(0, size.pageSize).map(index => items[index].name).join(' and ')

  return <div className="soundscape-carousel" ref={root} role="region" aria-roledescription="carousel" aria-label="Soundscape examples" style={{ '--soundscape-card-width': `${size.card}px`, '--soundscape-viewport-width': `${size.viewport}px` }}>
    <div className="soundscape-carousel__viewport" role="group" aria-roledescription="slide" aria-label={pageNames} onPointerDown={event => {
      if (event.target.closest('button, input, label, a')) return
      pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
      event.currentTarget.setPointerCapture(event.pointerId)
    }} onPointerUp={event => {
      const start = pointer.current
      pointer.current = null
      if (!start || start.id !== event.pointerId) return
      const dx = event.clientX - start.x
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(event.clientY - start.y)) move(dx < 0 ? 1 : -1)
    }} onPointerCancel={() => { pointer.current = null }}>
      <div id={trackId} className={`soundscape-carousel__track${direction ? ' is-moving' : ''}`} style={{ transform: `translate3d(${-(size.card + GAP) * (size.pageSize + direction)}px,0,0)` }} onTransitionEnd={event => {
        if (event.target === event.currentTarget && event.propertyName === 'transform') finishMove()
      }}>
        {slides.map(slide => {
          const hidden = slide.copy || slide.offset >= size.pageSize
          return <div className="soundscape-carousel__slide" key={slide.key} aria-hidden={hidden || undefined} inert={hidden || undefined}>
            {renderItem(items[slide.index], slide.index)}
          </div>
        })}
      </div>
    </div>
    <div className="soundscape-carousel__navigation">
      <span className="echo-sr-only" aria-live="polite" aria-atomic="true">Showing {pageNames}</span>
      <button type="button" aria-label="Previous slide" aria-controls={trackId} onClick={() => move(-1)}><svg width="34" height="20" viewBox="0 0 34 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M32 10H2m8-8-8 8 8 8" /></svg></button>
      <span className="soundscape-carousel__total">{count} soundscapes</span>
      <button type="button" aria-label="Next slide" aria-controls={trackId} onClick={() => move(1)}><svg width="34" height="20" viewBox="0 0 34 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 10h30m-8-8 8 8-8 8" /></svg></button>
    </div>
  </div>
}
