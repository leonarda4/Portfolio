import { useEffect, useRef } from 'react'
import './CoverVideo.css'

export default function CoverVideo({ src, poster, label }) {
  const ref = useRef(null)

  useEffect(() => {
    const video = ref.current
    // Set both the property and the HTML attribute before requesting playback.
    // Safari uses the muted/inline state when deciding whether to autoplay.
    video.defaultMuted = true
    video.muted = true
    video.playsInline = true
    video.setAttribute('webkit-playsinline', '')

    const bounds = video.getBoundingClientRect()
    let visible = bounds.bottom > 0 && bounds.top < window.innerHeight && bounds.right > 0 && bounds.left < window.innerWidth
    let disposed = false

    const play = () => {
      if (disposed || !visible || document.hidden || !video.paused) return
      video.muted = true
      // A browser can refuse autoplay. Retry on the next visibility or user
      // interaction event, without an unhandled rejection or a polling loop.
      video.play()?.catch(() => {})
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) play()
    })
    observer.observe(video)
    video.addEventListener('loadedmetadata', play)
    video.addEventListener('canplay', play)
    document.addEventListener('visibilitychange', play)
    window.addEventListener('pageshow', play)
    const gestures = ['touchend', 'click', 'keydown']
    gestures.forEach(event => document.addEventListener(event, play, { capture: true, passive: true }))
    play()

    return () => {
      disposed = true
      observer.disconnect()
      video.removeEventListener('loadedmetadata', play)
      video.removeEventListener('canplay', play)
      document.removeEventListener('visibilitychange', play)
      window.removeEventListener('pageshow', play)
      gestures.forEach(event => document.removeEventListener(event, play, true))
    }
  }, [src])

  return <video ref={ref} className="cover-video" src={src} poster={poster}
    autoPlay muted loop playsInline controls={false} preload="auto"
    disablePictureInPicture disableRemotePlayback tabIndex={-1} aria-label={label} />
}
