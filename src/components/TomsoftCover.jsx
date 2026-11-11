import { useEffect, useRef, useState } from 'react'
import previews from '../content/tomsoft-cover-previews.json'
import './TomsoftCover.css'

const apps = ['paperclip', 'harmony', 'interconnect']

export default function TomsoftCover({ label }) {
  const coverRef = useRef(null)
  const [screensReady, setScreensReady] = useState(false)
  const [phonesReady, setPhonesReady] = useState(false)
  const [visible, setVisible] = useState(false)
  const [motion, setMotion] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [loadPhones, setLoadPhones] = useState(false)

  useEffect(() => {
    let mounted = true
    const images = [...coverRef.current.querySelectorAll('.tomsoft-cover__screen-detail')]
    Promise.all(images.map(image => image.decode())).then(() => {
      if (mounted) setScreensReady(true)
    }).catch(() => { /* Embedded screens remain visible if a detailed image fails. */ })
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotion = () => setMotion(!preference.matches)
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(coverRef.current)
    preference.addEventListener('change', updateMotion)
    return () => { observer.disconnect(); preference.removeEventListener('change', updateMotion) }
  }, [])

  useEffect(() => {
    if (screensReady && visible && motion) setLoadPhones(true)
  }, [screensReady, visible, motion])

  useEffect(() => {
    if (!loadPhones) return
    let mounted = true
    const images = [...coverRef.current.querySelectorAll('.tomsoft-cover__hand')]
    Promise.all(images.map(image => image.decode())).then(() => {
      if (mounted) setPhonesReady(true)
    }).catch(() => { /* Keep the desktop screens in place when a phone cannot load. */ })
    return () => { mounted = false }
  }, [loadPhones])

  return <div ref={coverRef} className={`tomsoft-cover${screensReady ? ' tomsoft-cover--detailed' : ''}${phonesReady && motion ? ' tomsoft-cover--animated' : ''}`} style={{ '--cover-play-state': visible ? 'running' : 'paused' }} role="img" aria-label={label}>
    {apps.map((name, index) => <div className={`tomsoft-cover__panel tomsoft-cover__panel--${name}`} key={name} style={{ '--entry-delay': `${index * 0.2}s` }}>
      <div className="tomsoft-cover__screen">
        <img src={previews[name]} className="tomsoft-cover__screen-preview" alt="" width="480" height="300" />
        <img src={`/assets/tomsoft/cover/${name}-screen.webp`} className="tomsoft-cover__screen-detail" alt="" width="1920" height="1200" loading="eager" fetchPriority="high" decoding="async" />
      </div>
      {loadPhones && <img className="tomsoft-cover__hand" src={`/assets/tomsoft/cover/${name}-phone.webp`} alt="" width="2400" height="1800" fetchPriority="low" decoding="async" />}
    </div>)}
  </div>
}
