import { useEffect, useId, useRef, useState } from 'react'
import './BeforeAfterChart.css'

export default function BeforeAfterChart({ block }) {
  const figure = useRef(null)
  const titleId = useId()
  const [entered, setEntered] = useState(false)
  const position = value => `${((value - 1) / 4) * 100}%`

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motion.matches || !('IntersectionObserver' in window)) {
      setEntered(true)
      return
    }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setEntered(true)
        observer.disconnect()
      }
    }, { threshold: 0.25 })
    observer.observe(figure.current)
    return () => observer.disconnect()
  }, [])

  return (
    <figure ref={figure} className={`before-after-chart${entered ? ' has-entered' : ''}`} aria-labelledby={titleId}>
      <header className="comparison-header">
        <h3 id={titleId}>{block.title}</h3>
        <div className="comparison-legend" aria-hidden="true">
          <span><i className="legend-before" />Before</span>
          <span><i className="legend-after" />After</span>
        </div>
      </header>
      <div className="comparison-column-labels" aria-hidden="true">
        <span /><span /><span>Before</span><span>After</span>
      </div>
      <div className="comparison-rows">
        {block.items.map((item, index) => (
          <div className="comparison-row" key={item.label} style={{
            '--before': position(item.before),
            '--after': position(item.after),
            '--distance': `${((item.after - item.before) / 4) * 100}%`,
            '--delay': `${index * 160}ms`,
          }}>
            <span className="comparison-name">{item.label}</span>
            <div className="comparison-track" aria-hidden="true">
              <div className="comparison-grid">{[1, 2, 3, 4, 5].map(tick => <i key={tick} style={{ left: position(tick) }} />)}</div>
              <div className="comparison-connector" />
              <span className="comparison-dot comparison-dot-before" />
              <span className="comparison-dot comparison-dot-after" />
            </div>
            <span className="comparison-before"><span className="comparison-sr">Before: </span>{item.before.toFixed(1)}</span>
            <span className="comparison-after"><span className="comparison-sr">After: </span>{item.after.toFixed(1)}</span>
          </div>
        ))}
      </div>
      <div className="comparison-axis" aria-hidden="true">
        <span /><div>{[1, 2, 3, 4, 5].map(tick => <span key={tick} style={{ left: position(tick) }}>{tick}</span>)}</div><span /><span />
      </div>
      <figcaption>{block.caption}</figcaption>
    </figure>
  )
}
