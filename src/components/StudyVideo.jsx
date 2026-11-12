import { useEffect, useRef, useState } from 'react'
import { imageSource, videoSource } from '../media'
import calibratedStream from '../content/calibrated-stream.json'
import './StudyVideo.css'

export default function StudyVideo({ item, block, reducedMotion }) {
  const video = useRef(null)
  const retry = useRef(null)
  const [failed, setFailed] = useState(false)
  const [needsGesture, setNeedsGesture] = useState(false)
  const autoPlay = block.autoPlay !== false && !reducedMotion
  const audible = block.muted === false
  const priority = autoPlay && audible
  const stream = item.src === '/assets/calibrated/calibrated-experience.mp4' ? calibratedStream.src : null

  useEffect(() => {
    const player = video.current
    let disposed = false
    let loaded = false
    let started = false
    let visible = false
    let hls = null
    let retries = 0
    let timer
    player.defaultMuted = !audible
    player.muted = !audible

    const attempt = () => {
      if (disposed || !autoPlay || started || !loaded || (!priority && !visible)) return
      player.play().catch(error => {
        if (!disposed && error.name === 'NotAllowedError') setNeedsGesture(true)
      })
    }
    const fallback = () => {
      hls?.destroy()
      hls = null
      player.src = videoSource(item.src)
      player.load()
      attempt()
    }
    const load = async () => {
      if (loaded || disposed) return
      loaded = true
      player.preload = priority || autoPlay ? 'auto' : 'metadata'
      if (!stream) {
        fallback()
      } else if (player.canPlayType('application/vnd.apple.mpegurl')) {
        player.src = stream
        attempt()
      } else {
        try {
          const { default: Hls } = await import('hls.js/light')
          if (disposed) return
          if (!Hls.isSupported()) { fallback(); return }
          hls = new Hls({
            startLevel: 0,
            capLevelToPlayerSize: true,
            maxBufferLength: 16,
            maxMaxBufferLength: 24,
            maxBufferSize: 12 * 1000 * 1000,
            backBufferLength: 8,
          })
          hls.on(Hls.Events.MANIFEST_PARSED, attempt)
          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal && !disposed) fallback()
          })
          hls.loadSource(stream)
          hls.attachMedia(player)
          attempt()
        } catch {
          if (!disposed) fallback()
        }
      }
    }
    const playing = () => { started = true; setNeedsGesture(false); setFailed(false) }
    const ready = () => {
      if (stream) window.dispatchEvent(new Event('portfolio:film-ready'))
      attempt()
    }
    const gesture = () => { if (priority || visible) attempt() }
    const recover = () => {
      if (disposed) return
      if (retries++ === 0) timer = setTimeout(fallback, 600)
      else setFailed(true)
    }
    retry.current = () => { retries = 0; setFailed(false); started = false; fallback(); player.play().catch(() => setNeedsGesture(true)) }
    player.addEventListener('canplay', ready)
    player.addEventListener('playing', playing)
    player.addEventListener('error', recover)
    document.addEventListener('pointerdown', gesture)
    document.addEventListener('keydown', gesture)
    const nearby = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { load(); nearby.disconnect() }
    }, { rootMargin: '300px' })
    const viewport = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) attempt()
      // The main film keeps its soundtrack playing while visitors read.
      else if (autoPlay && !audible) { player.pause(); started = false }
    })
    nearby.observe(player)
    viewport.observe(player)
    // The main film is the priority, even before the visitor scrolls to it.
    if (priority) load()
    return () => {
      disposed = true
      clearTimeout(timer)
      nearby.disconnect()
      viewport.disconnect()
      document.removeEventListener('pointerdown', gesture)
      document.removeEventListener('keydown', gesture)
      player.removeEventListener('canplay', ready)
      player.removeEventListener('playing', playing)
      player.removeEventListener('error', recover)
      hls?.destroy()
      player.pause()
      player.removeAttribute('src')
      player.load()
    }
  }, [item.src, stream, autoPlay, audible, priority])

  return <div className="study-video-player">
    <video ref={video} width={item.width} height={item.height} poster={imageSource(item.poster)}
      autoPlay={autoPlay} muted={!audible} loop={block.loop !== false}
      controls={block.controls || false} disablePictureInPicture disableRemotePlayback playsInline
      preload="none" aria-label={item.title}>
      {item.captions && <track kind="captions" src={item.captions} srcLang="en" label="English" />}
      <a href={videoSource(item.src)}>Watch {item.title}</a>
    </video>
    {needsGesture && !failed && <button type="button" className="study-video-start" onClick={() => {
      video.current.muted = !audible
      video.current.play().catch(() => setNeedsGesture(true))
    }}>{audible ? 'Play with sound' : 'Play video'}</button>}
    {failed && <div className="study-video-recovery">
      {item.poster && <img src={imageSource(item.poster)} alt="" />}
      <div className="study-video-recovery__actions" role="status">
        <span>Video couldn’t load.</span>
        <button type="button" onClick={() => retry.current?.()}>Retry video</button>
        <a href={videoSource(item.src)}>Open video</a>
      </div>
    </div>}
  </div>
}
