import { useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function MediaPreview({ label, aspect = 16 / 9, className = '', onClose, children }) {
  const dialog = useRef(null)
  const content = useRef(null)

  useLayoutEffect(() => {
    const element = dialog.current
    const previousFocus = document.activeElement
    const overflow = document.body.style.overflow
    const playing = [...document.querySelectorAll('#root video')].filter(video => !video.paused)
    playing.forEach(video => video.pause())
    // Start on the media, so opening a preview does not highlight Close.
    // Buttons still show their normal focus indicator during keyboard navigation.
    content.current.setAttribute('autofocus', '')
    element.showModal()
    content.current.focus({ preventScroll: true })
    document.body.style.overflow = 'hidden'
    return () => {
      element.close()
      document.body.style.overflow = overflow
      playing.forEach(video => { if (video.isConnected) video.play().catch(() => {}) })
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [])

  return createPortal(<dialog ref={dialog} className={`lightbox media-preview ${className}`} style={{ '--media-aspect': aspect }} aria-label={label}
    onCancel={event => { event.preventDefault(); onClose() }}
    onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <button type="button" className="lightbox-close" onClick={onClose}><span className="sidebar-back-arrow" aria-hidden="true">×</span>Close</button>
    <div ref={content} className="media-preview-content" tabIndex={-1}>{children}</div>
  </dialog>, document.body)
}
