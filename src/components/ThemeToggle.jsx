import { useEffect, useRef, useState } from 'react'
import { applyTheme, getThemePreference, saveThemePreference, THEME_STORAGE_KEY, watchSystemTheme } from '../theme'
import { themeArtwork } from '../content/theme-art'

export default function ThemeToggle() {
  const [preference, setPreference] = useState(getThemePreference)
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
  const [motion, setMotion] = useState(null)
  const transition = useRef(null)
  const trigger = useRef(null)

  function chooseTheme(value) {
    setTheme(applyTheme(value))
    saveThemePreference(value)
    setPreference(value)
  }

  useEffect(() => {
    const sync = () => setTheme(applyTheme(preference))
    sync()
    if (preference === 'system') return watchSystemTheme(sync)
  }, [preference])

  useEffect(() => {
    const syncStorage = event => {
      if (event.key !== THEME_STORAGE_KEY && event.key !== null) return
      const next = getThemePreference()
      transition.current = null
      setMotion(null)
      setPreference(next)
      setTheme(applyTheme(next))
    }
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotion = () => {
      if (!reducedMotion.matches || !transition.current) return
      chooseTheme(transition.current.to)
      transition.current = null
      setMotion(null)
    }
    window.addEventListener('storage', syncStorage)
    reducedMotion.addEventListener('change', syncMotion)
    return () => {
      window.removeEventListener('storage', syncStorage)
      reducedMotion.removeEventListener('change', syncMotion)
    }
  }, [])

  function toggle() {
    if (transition.current) return
    const to = theme === 'light' ? 'dark' : 'light'
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { chooseTheme(to); return }
    const next = { phase: 'exit', from: theme, to, distance: Math.ceil(trigger.current.getBoundingClientRect().right + 24) }
    transition.current = next
    setMotion(next)
  }

  function finishPhase(event) {
    if (event.target !== event.currentTarget) return
    const current = transition.current
    if (!current) return
    if (current.phase === 'exit') {
      chooseTheme(current.to)
      const next = { ...current, phase: 'enter' }
      transition.current = next
      setMotion(next)
    } else {
      transition.current = null
      setMotion(null)
    }
  }

  const icon = motion?.phase === 'exit' ? motion.from : theme
  const label = `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`
  return <div className="theme-control">
    <button className="theme-toggle" type="button" ref={trigger} onClick={toggle}
      aria-label={label} title={label} aria-disabled={motion ? true : undefined}>
      <span key={`${icon}-${motion?.phase || 'idle'}`} className={`theme-art${motion ? ` theme-art--${motion.phase}` : ''}`}
        style={{ '--theme-slide-x': `${-(motion?.distance || 0)}px` }} onAnimationEnd={finishPhase} aria-hidden="true">
        <img src={themeArtwork[icon]} alt="" width="233" height="257" draggable="false" />
      </span>
    </button>
  </div>
}
