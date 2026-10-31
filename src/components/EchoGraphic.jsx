import { useEffect, useRef, useState } from 'react'
import ResponsiveEchoGraphic from './ResponsiveEchoGraphic'

// Loop while visible, retaining the animation position when offscreen.
export default function EchoGraphic({ id }) {
  const ref = useRef(null)
  const [time, setTime] = useState(3.25)
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0, visible = false, previous = null, elapsed = 0
    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
      previous = null
    }
    const tick = now => {
      if (previous !== null) elapsed += (now - previous) / 1000
      previous = now
      setTime(elapsed)
      frame = requestAnimationFrame(tick)
    }
    const sync = () => {
      stop()
      if (motion.matches) setTime(3.25)
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
  }, [id])
  return <div ref={ref} className="echo-graphic__canvas"><ResponsiveEchoGraphic id={id} time={time} loop /></div>
}
