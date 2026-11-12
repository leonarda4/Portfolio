import { useEffect, useRef, useState } from 'react'
import { videoSource } from '../media'
import ResponsiveImage from './ResponsiveImage'
import './CoverVideo.css'

export default function CoverVideo({ src, poster, label, hero = false }) {
  const ref = useRef(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const video = ref.current
    setPlaying(false)
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    video.defaultMuted = true
    video.muted = true
    video.playsInline = true
    video.setAttribute('webkit-playsinline', '')
    let visible = false
    let disposed = false
    let filmReady = !(hero && src === '/assets/calibrated/calibrated-cover-loop.mp4')

    const play = () => {
      if (disposed || !visible || !filmReady || document.hidden || motion.matches) return
      if (!video.getAttribute('src')) {
        video.src = videoSource(src)
        video.preload = 'auto'
      }
      video.muted = true
      if (video.paused) video.play()?.catch(() => {})
    }
    const sync = () => {
      if (!visible || document.hidden || motion.matches) video.pause()
      else play()
    }
    const releasePreview = () => { filmReady = true; sync() }
    window.addEventListener('portfolio:film-ready', releasePreview)
    // No source is assigned to offscreen videos. The lightweight poster is
    // immediately available, without background previews competing for bandwidth.
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      sync()
    })
    observer.observe(video)
    video.addEventListener('canplay', play)
    document.addEventListener('visibilitychange', sync)
    window.addEventListener('pageshow', sync)
    motion.addEventListener('change', sync)
    const gestures = ['touchend', 'click', 'keydown']
    gestures.forEach(event => document.addEventListener(event, play, { capture: true, passive: true }))
    return () => {
      disposed = true
      observer.disconnect()
      video.pause()
      video.removeAttribute('src')
      video.load()
      video.removeEventListener('canplay', play)
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('pageshow', sync)
      window.removeEventListener('portfolio:film-ready', releasePreview)
      motion.removeEventListener('change', sync)
      gestures.forEach(event => document.removeEventListener(event, play, true))
    }
  }, [src, hero])

  return <>
    <ResponsiveImage className="cover-video-poster" src={poster} alt="" sizes={hero ? "100vw" : "(max-width: 760px) 100vw, 40vw"} fetchPriority={hero ? "high" : "auto"} />
    <video ref={ref} className="cover-video" data-playing={playing} onPlaying={() => setPlaying(true)}
      muted loop playsInline controls={false} preload="none"
      disablePictureInPicture disableRemotePlayback tabIndex={-1} aria-label={label} />
  </>
}
