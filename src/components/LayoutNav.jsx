import { useEffect, useRef } from 'react'
import './LayoutNav.css'

export default function LayoutNav({ label, items, active }) {
  const navigation = useRef(null)
  useEffect(() => {
    const nav = navigation.current
    const current = nav?.querySelector('[aria-current]')
    if (!current || nav.scrollWidth <= nav.clientWidth) return
    const bounds = nav.getBoundingClientRect()
    const item = current.getBoundingClientRect()
    if (item.left < bounds.left || item.right > bounds.right) nav.scrollTo({ left: nav.scrollLeft + item.left - bounds.left - (bounds.width - item.width) / 2, behavior: 'instant' })
  }, [active])
  return <nav ref={navigation} className="layout-nav" aria-label={label}>{items.map(item => {
    const props = { className: `layout-nav-item${active === item.id ? ' active' : ''}`, 'aria-current': active === item.id ? (item.href ? 'page' : 'location') : undefined }
    if (item.disabled) return <span key={item.id} className="layout-nav-item" aria-disabled="true" title="Coming soon">{item.label}</span>
    return item.href ? <a key={item.id} {...props} href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noreferrer' : undefined}>{item.label}</a> : <button key={item.id} type="button" {...props} onClick={item.onClick}>{item.label}</button>
  })}</nav>
}
