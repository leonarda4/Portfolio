import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// A single, visibility-aware clock per scene. Reduced motion holds a useful pose.
export default function MotionCanvas({ children, className = '', label, duration = 8, stillTime = 0, width = 1920, height = 1080, responsive = false, fill = false }) {
  const host = useRef(null)
  const frame = useRef(null)
  const [time, setTime] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? stillTime : 0)
  const [layout, setLayout] = useState({ width, height, scale: 0 })
  useLayoutEffect(() => {
    const fit = () => {
      const { width: w, height: h } = frame.current.getBoundingClientRect()
      const tall = responsive && h > w
      const sceneWidth = tall ? 1080 : width
      const sceneHeight = tall ? (h / w > 1.5 ? 1920 : 1350) : height
      const scale = Math.min(w / sceneWidth, h / sceneHeight)
      setLayout({ width: fill && scale ? w / scale : sceneWidth, height: fill && scale ? h / scale : sceneHeight, scale })
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(frame.current)
    return () => observer.disconnect()
  }, [width, height, responsive, fill])
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let visible = false, raf = 0, previous = null, elapsed = 0
    const stop = () => { cancelAnimationFrame(raf); previous = null }
    const tick = now => {
      if (previous === null) previous = now
      const delta = now - previous
      if (delta >= 1000 / 30) {
        elapsed = (elapsed + delta / 1000) % duration
        previous = now
        setTime(elapsed)
      }
      raf = requestAnimationFrame(tick)
    }
    const sync = () => {
      stop()
      if (motion.matches) setTime(stillTime)
      else if (visible && !document.hidden) raf = requestAnimationFrame(tick)
    }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() })
    observer.observe(host.current)
    motion.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)
    return () => {
      stop(); observer.disconnect()
      motion.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [duration, stillTime])
  return <div ref={host} className={`brainy-cover ${className}`} role="img" aria-label={label}>
    <div ref={frame} className="brainy-cover__frame">
      <div className="brainy-cover__fit" style={{ width: layout.width, height: layout.height, transform: `translate(-50%, -50%) scale(${layout.scale})` }}>
        {children({ time, width: layout.width, height: layout.height })}
      </div>
    </div>
  </div>
}
