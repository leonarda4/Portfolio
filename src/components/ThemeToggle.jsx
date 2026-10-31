import { useEffect, useId, useRef, useState } from 'react'
import { applyTheme, getThemePreference, normalizeTheme, saveThemePreference, THEME_STORAGE_KEY, watchSystemTheme } from '../theme'

const options = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

function ThemeIcon({ theme }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {theme === 'light' ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.4 1.4m11.2 11.2L19 19M5 19l1.4-1.4M17.6 6.4 19 5" /></> : theme === 'dark' ? <path d="M20.5 13a8.5 8.5 0 0 1-9.5-9.5A8.5 8.5 0 1 0 20.5 13Z" /> : <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M9 21h6m-3-4v4" /></>}
  </svg>
}

export default function ThemeToggle() {
  const [preference, setPreference] = useState(getThemePreference)
  const [open, setOpen] = useState(false)
  const container = useRef(null)
  const trigger = useRef(null)
  const optionButtons = useRef([])
  const initialFocus = useRef(0)
  const menuId = useId()
  const labelId = useId()
  const selected = options.find(option => option.value === preference)

  useEffect(() => {
    applyTheme(preference)
    if (preference === 'system') return watchSystemTheme(() => applyTheme('system'))
  }, [preference])

  useEffect(() => {
    const syncStorage = event => {
      if (event.key === THEME_STORAGE_KEY || event.key === null) {
        setPreference(normalizeTheme(event.newValue))
      }
    }
    window.addEventListener('storage', syncStorage)
    return () => window.removeEventListener('storage', syncStorage)
  }, [])

  useEffect(() => {
    if (!open) return
    optionButtons.current[initialFocus.current]?.focus({ preventScroll: true })
    const onPointerDown = event => {
      if (!container.current?.contains(event.target)) {
        // Keep focus useful if the outside target itself cannot receive focus.
        // A clicked link or button still receives its normal pointer focus.
        if (container.current?.contains(document.activeElement)) trigger.current?.focus({ preventScroll: true })
        setOpen(false)
      }
    }
    const onEscape = event => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        trigger.current?.focus({ preventScroll: true })
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onEscape)
    }
  }, [open])

  function openMenu(index = options.findIndex(option => option.value === preference)) {
    initialFocus.current = index
    if (open) optionButtons.current[index]?.focus({ preventScroll: true })
    setOpen(true)
  }

  function chooseTheme(value) {
    applyTheme(value)
    saveThemePreference(value)
    setPreference(value)
    setOpen(false)
    trigger.current?.focus({ preventScroll: true })
  }

  function navigateMenu(event) {
    const index = optionButtons.current.indexOf(document.activeElement)
    let next
    if (event.key === 'ArrowDown') next = (index + 1) % options.length
    else if (event.key === 'ArrowUp') next = (index - 1 + options.length) % options.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = options.length - 1
    else if (event.key === 'Tab') {
      // Let the browser continue to the next control from the trigger.
      trigger.current?.focus({ preventScroll: true })
      setOpen(false)
      return
    }
    if (next !== undefined) {
      event.preventDefault()
      optionButtons.current[next]?.focus({ preventScroll: true })
    }
  }

  return <div className="theme-control" ref={container} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
  }}>
    <button
      className="theme-toggle"
      type="button"
      ref={trigger}
      aria-label={`Appearance: ${selected.label}. Change theme`}
      title={`Appearance: ${selected.label}`}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={open ? menuId : undefined}
      onClick={() => open ? setOpen(false) : openMenu()}
      onKeyDown={event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault()
          openMenu(event.key === 'ArrowDown' ? 0 : options.length - 1)
        }
      }}
    ><ThemeIcon theme={preference} /></button>
    {open && <div className="theme-menu" id={menuId} role="menu" aria-labelledby={labelId} onKeyDown={navigateMenu}>
      <span className="theme-menu-heading" id={labelId}>Appearance</span>
      {options.map((option, index) => <button
        key={option.value}
        className={`theme-option${preference === option.value ? ' is-selected' : ''}`}
        ref={element => { optionButtons.current[index] = element }}
        type="button"
        role="menuitemradio"
        aria-checked={preference === option.value}
        tabIndex={-1}
        onClick={() => chooseTheme(option.value)}
      ><span className="theme-option-icon"><ThemeIcon theme={option.value} /></span><span>{option.label}</span><span className="theme-option-check" aria-hidden="true">{preference === option.value && '✓'}</span></button>)}
    </div>}
  </div>
}
