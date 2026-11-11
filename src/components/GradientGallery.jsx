import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import groups from './noise-lab/recipes.json'
import { createNoiseRenderer } from './noise-lab/renderer'
import './GradientGallery.css'

const recipes = groups.flatMap(group => group.recipes)

// All recipe viewports share one WebGL context. The images underneath are only
// loading / unsupported-WebGL fallbacks, exported from the original presets.
function GradientSurface({ items, paused, children, className = '' }) {
  const surfaceRef = useRef(null)
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const elapsedRef = useRef(0)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const surface = surfaceRef.current
    const canvas = canvasRef.current
    let renderer
    let frame = 0
    let lastTime = null
    let inView = false
    let playing = !paused
    let disposed = false
    let tiles = []

    function stop() {
      cancelAnimationFrame(frame)
      frame = 0
      lastTime = null
    }

    function draw() {
      if (!renderer || !inView || document.hidden) return
      try {
        renderer.render(tiles, elapsedRef.current)
        setStatus('ready')
      } catch {
        stop()
        renderer.destroy()
        renderer = null
        setStatus('unavailable')
      }
    }

    function tick(now) {
      frame = 0
      if (!playing || !inView || document.hidden || !renderer) return
      // Cap the whole gallery at 24 fps and one device pixel per CSS pixel.
      if (lastTime === null || now - lastTime >= 1000 / 24) {
        if (lastTime !== null) elapsedRef.current += Math.min((now - lastTime) / 1000, 0.1)
        lastTime = now
        draw()
      }
      if (renderer) frame = requestAnimationFrame(tick)
    }

    function resume() {
      stop()
      draw()
      if (playing && inView && !document.hidden && renderer) frame = requestAnimationFrame(tick)
    }

    function measure() {
      const bounds = surface.getBoundingClientRect()
      canvas.width = Math.max(1, Math.round(bounds.width))
      canvas.height = Math.max(1, Math.round(bounds.height))
      tiles = Array.from(surface.querySelectorAll('[data-gradient-id]')).map(element => {
        const rect = element.getBoundingClientRect()
        return {
          recipe: items.find(item => item.id === element.dataset.gradientId),
          x: Math.round(rect.left - bounds.left),
          y: Math.round(rect.top - bounds.top),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        }
      })
      draw()
    }

    function initialize() {
      if (disposed) return
      try {
        renderer = createNoiseRenderer(canvas)
        measure()
        resume()
      } catch {
        setStatus('unavailable')
      }
    }

    function onContextLost(event) {
      event.preventDefault()
      stop()
      renderer = null
      setStatus('unavailable')
    }

    canvas.addEventListener('webglcontextlost', onContextLost)
    canvas.addEventListener('webglcontextrestored', initialize)
    const visibility = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      // Shader compilation waits until the gallery is near the viewport.
      if (inView && !renderer && !canvas.dataset.initialized) {
        canvas.dataset.initialized = 'true'
        initialize()
      } else resume()
    }, { rootMargin: '100px' })
    const resize = new ResizeObserver(measure)
    visibility.observe(surface)
    resize.observe(surface)
    document.addEventListener('visibilitychange', resume)
    engineRef.current = { setPlaying(value) { playing = value; resume() } }

    return () => {
      disposed = true
      stop()
      visibility.disconnect()
      resize.disconnect()
      document.removeEventListener('visibilitychange', resume)
      canvas.removeEventListener('webglcontextlost', onContextLost)
      canvas.removeEventListener('webglcontextrestored', initialize)
      renderer?.destroy()
      delete canvas.dataset.initialized
      engineRef.current = null
    }
  }, [items])

  useEffect(() => { engineRef.current?.setPlaying(!paused) }, [paused])

  return <div className={`gradient-surface ${className}`} ref={surfaceRef} data-render-status={status}>
    {children}
    <canvas ref={canvasRef} className="gradient-canvas" aria-hidden="true" />
    {status === 'unavailable' && <p className="gradient-fallback" role="status">Live animation is unavailable in this browser. Showing the saved recipe previews.</p>}
  </div>
}

function MotionButton({ paused, onToggle }) {
  return <button className="gradient-motion" type="button" onClick={onToggle}>
    <span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span>{paused ? 'Play motion' : 'Pause motion'}
  </button>
}

function GradientDetail({ selection, paused, onToggle, onClose }) {
  const dialogRef = useRef(null)
  const [items] = useState(() => [selection.recipe])
  useEffect(() => {
    const dialog = dialogRef.current
    const previousFocus = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.querySelector('button')?.focus({ preventScroll: true })
    function handleKey(event) {
      if (event.defaultPrevented || (event.key === 'Escape' && document.activeElement.closest('[role="menu"]'))) return
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
      if (event.key !== 'Tab') return
      // Keep the navigation available without tabbing into the obscured page.
      const controls = [...document.querySelectorAll('.layout-sidebar a[href], .layout-sidebar button:not([disabled]), .gradient-dialog button:not([disabled])')].filter(node => node.tabIndex >= 0 && node.getClientRects().length)
      if (!controls.length) return
      const current = controls.indexOf(document.activeElement)
      const next = current < 0 ? (event.shiftKey ? controls.length - 1 : 0) : (current + (event.shiftKey ? -1 : 1) + controls.length) % controls.length
      event.preventDefault()
      controls[next].focus()
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = overflow
      if (previousFocus?.isConnected && (dialog.contains(document.activeElement) || document.activeElement === document.body)) previousFocus.focus({ preventScroll: true })
    }
  }, [onClose])

  return createPortal(<div className="gradient-overlay" onClick={event => { if (event.target === event.currentTarget) onClose() }}><dialog open ref={dialogRef} className="gradient-dialog" aria-modal="false" aria-labelledby="gradient-detail-title">
    <div className="gradient-detail">
      <header><h3 id="gradient-detail-title">{selection.group.label} <span> / {String(selection.index + 1).padStart(2, '0')}</span></h3><button type="button" className="gradient-close" onClick={onClose}>Close ×</button></header>
      <GradientSurface items={items} paused={paused}>
        <div className="gradient-detail-image" data-gradient-id={selection.recipe.id}><img src={selection.recipe.preview} alt={`${selection.group.label} gradient recipe ${selection.index + 1}`} /></div>
      </GradientSurface>
      <footer><p>{selection.index + 1} of {selection.group.recipes.length}</p><MotionButton paused={paused} onToggle={onToggle} /></footer>
    </div>
  </dialog></div>, document.body)
}

export default function GradientGallery() {
  const [paused, setPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [selection, setSelection] = useState(null)
  const closeDetail = useCallback(() => setSelection(null), [])
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => setPaused(preference.matches)
    preference.addEventListener('change', change)
    return () => preference.removeEventListener('change', change)
  }, [])
  const toggle = () => setPaused(value => !value)

  return <div className="gradient-gallery">
    <div className="gradient-toolbar"><p>{recipes.length} studies · {groups.length} emotions</p><MotionButton paused={paused} onToggle={toggle} /></div>
    <GradientSurface items={recipes} paused={paused || Boolean(selection)} className="gradient-grid">
      {groups.map(group => <section className="gradient-group" key={group.id} aria-labelledby={`gradient-${group.id}`}>
        <h3 id={`gradient-${group.id}`}>{group.label}</h3>
        <div className="gradient-recipes">{group.recipes.map((recipe, index) => <button className="gradient-tile" key={recipe.id} type="button" data-gradient-id={recipe.id} onClick={() => setSelection({ group, recipe, index })} aria-label={`Enlarge ${group.label} recipe ${index + 1}`} aria-haspopup="dialog">
          <img src={recipe.preview} alt="" loading="lazy" />
          <span className="gradient-expand" aria-hidden="true">↗</span>
        </button>)}</div>
      </section>)}
    </GradientSurface>
    <p className="gradient-caption">Select a study to explore it in motion. Made with <a href="https://github.com/leonarda4/The-noise-lab" target="_blank" rel="noreferrer">The Noise Lab ↗</a>.</p>
    {selection && <GradientDetail selection={selection} paused={paused} onToggle={toggle} onClose={closeDetail} />}
  </div>
}
