import { useEffect, useRef, useState } from 'react'
import './TomsoftCover.css'

const apps = [
  { name: 'paperclip', hand: 'DMS hand.png' },
  { name: 'harmony', hand: 'HR hand.png' },
  { name: 'interconnect', hand: 'IC hand.png' },
]

export default function TomsoftCover({ label }) {
  const coverRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let mounted = true
    const images = [...coverRef.current.querySelectorAll('img')]

    // Wait for the actual rendered images, including cached files, to decode.
    // Failed or pending images must never reveal a shadow or start the loop.
    Promise.all(images.map(async image => {
      await image.decode()
      if (!image.complete || !image.naturalWidth) throw new Error('Cover image unavailable')
    })).then(() => {
      if (mounted) setReady(true)
    }).catch(() => {
      if (mounted) setReady(false)
    })

    return () => { mounted = false }
  }, [])

  return <div ref={coverRef} className={`tomsoft-cover${ready ? ' tomsoft-cover--ready' : ''}`} role="img" aria-label={label}>
    {apps.map((app, index) => <div className={`tomsoft-cover__panel tomsoft-cover__panel--${app.name}`} key={app.name} style={{ '--entry-delay': `${index * 0.2}s` }}>
      <div className="tomsoft-cover__screen">
        <img src={`/assets/tomsoft/screens/${app.name}.png`} alt="" width="3840" height="2400" />
      </div>
      <img className="tomsoft-cover__hand" src={`/assets/tomsoft/${app.hand}`} alt="" width="6000" height="4500" />
    </div>)}
  </div>
}
