import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import LayoutNav from './LayoutNav'
import './MobileNavigation.css'

export default function MobileNavigation({ label, items, active, backLink }) {
  const [open, setOpen] = useState(false)
  const dialog = useRef(null)
  const trigger = useRef(null)
  const id = useId()

  function close() {
    dialog.current?.close()
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const menu = dialog.current
    const previousOverflow = document.body.style.overflow
    menu.showModal()
    document.body.style.overflow = 'hidden'
    const breakpoint = window.matchMedia('(max-width: 760px)')
    const resize = () => { if (!breakpoint.matches) close() }
    breakpoint.addEventListener('change', resize)
    window.addEventListener('hashchange', close)
    return () => {
      menu.close()
      document.body.style.overflow = previousOverflow
      breakpoint.removeEventListener('change', resize)
      window.removeEventListener('hashchange', close)
      if (breakpoint.matches) trigger.current?.focus({ preventScroll: true })
    }
  }, [open])

  return <>
    <button ref={trigger} type="button" className="mobile-menu-trigger tool-surface" data-sticker-obstacle aria-label="Open navigation menu"
      aria-expanded={open} aria-controls={id} aria-haspopup="dialog" onClick={() => setOpen(true)}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
    </button>
    {open && createPortal(<dialog ref={dialog} id={id} className="mobile-menu" aria-label={label}
      onCancel={event => { event.preventDefault(); close() }} onClick={event => {
        if (event.target !== event.currentTarget) return
        const box = event.currentTarget.getBoundingClientRect()
        if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) close()
      }}>
      <button type="button" className="mobile-menu-close" aria-label="Close navigation menu" onClick={close} autoFocus>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg>
      </button>
      {backLink && <a className="mobile-menu-back" href="#/" onClick={close}><span className="sidebar-back-arrow" aria-hidden="true">←</span>Back to Home</a>}
      <LayoutNav label={label} items={items} active={active} onNavigate={close} />
    </dialog>, document.body)}
  </>
}
