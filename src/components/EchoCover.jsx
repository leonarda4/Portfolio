import { useEffect, useRef, useState } from 'react'
import ResponsiveEchoGraphic from './ResponsiveEchoGraphic'
import './EchoCover.css'

const STILL_TIME = 3.25

// One clock drives the whole cover, and pauses outside the viewport.
function useCoverClock(ref) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let visible = false
    let frame = 0
    let previous = null
    let accumulated = 0

    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
      previous = null
    }
    const tick = now => {
      if (previous === null) previous = now
      const delta = now - previous
      if (delta >= 1000 / 30) {
        accumulated += delta / 1000
        previous = now
        setElapsed(accumulated)
      }
      frame = requestAnimationFrame(tick)
    }
    const sync = () => {
      stop()
      if (motion.matches) setElapsed(0)
      else if (visible && !document.hidden) frame = requestAnimationFrame(tick)
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      sync()
    })
    observer.observe(ref.current)
    motion.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)

    return () => {
      stop()
      observer.disconnect()
      motion.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [ref])

  return elapsed
}

export default function EchoCover({ hero = false }) {
  const ref = useRef(null)
  const elapsed = useCoverClock(ref)
  useEffect(() => {
    if (hero) return
    const cover = ref.current
    const tags = cover?.parentElement.querySelector('.cover-tags')
    if (!cover || !tags) return
    const reserveTags = () => {
      const headerSpace = tags.getBoundingClientRect().bottom - cover.getBoundingClientRect().top + 12
      cover.style.setProperty('--echo-card-header-space', `${Math.max(12, headerSpace)}px`)
    }
    reserveTags()
    const observer = new ResizeObserver(reserveTags)
    observer.observe(tags)
    return () => observer.disconnect()
  }, [hero])
  return (
    <div
      ref={ref}
      className={`echo-cover${hero ? ' echo-cover--hero' : ' echo-cover--card'}`}
      role="img"
      aria-label="Echo: movement feedback loop. Black animated diagram."
    >
      <div className="echo-cover__scenes" aria-hidden="true">
        <div className="echo-cover__scene">
          <div className="echo-cover__graphic">
            <ResponsiveEchoGraphic id="feedback-loop" time={elapsed + STILL_TIME} loop fit="contain" />
          </div>
        </div>
      </div>
    </div>
  )
}
