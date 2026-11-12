import { useEffect, useRef, useState } from 'react'
import './StudyVideo.css'

export default function StudyVideo({ item, block, reducedMotion }) {
  const video = useRef(null)
  const retryTimer = useRef(null)
  const attempts = useRef(0)
  const [failed, setFailed] = useState(false)
  const autoPlay = block.autoPlay !== false && !reducedMotion

  useEffect(() => () => clearTimeout(retryTimer.current), [])

  useEffect(() => {
    if (!autoPlay || block.muted !== false) return
    const player = video.current
    player.defaultMuted = false
    player.muted = false
    let started = false
    const attempt = () => {
      if (!started) player.play().catch(() => {})
    }
    const removeRetries = () => {
      player.removeEventListener('canplay', attempt)
      document.removeEventListener('pointerdown', attempt)
      document.removeEventListener('keydown', attempt)
    }
    const playing = () => {
      started = true
      removeRetries()
    }
    // If audible autoplay is blocked, retry on the first user interaction.
    // Stop retrying once playback starts so a deliberate pause stays paused.
    player.addEventListener('playing', playing)
    player.addEventListener('canplay', attempt)
    document.addEventListener('pointerdown', attempt)
    document.addEventListener('keydown', attempt)
    attempt()
    return () => {
      removeRetries()
      player.removeEventListener('playing', playing)
    }
  }, [autoPlay, block.muted, item.src])

  function reload() {
    setFailed(false)
    video.current?.load()
    if (autoPlay) video.current?.play().catch(() => {})
  }

  function recover() {
    // A direct media src emits an error on the video itself. Retry transient
    // requests once, then leave an explicit recovery action instead of 00:00.
    if (attempts.current++ === 0) retryTimer.current = setTimeout(reload, 600)
    else setFailed(true)
  }

  return <div className="study-video-player">
    <video ref={video} src={item.src} width={item.width} height={item.height} poster={item.poster}
      autoPlay={autoPlay} muted={block.muted !== false} loop={block.loop !== false}
      controls={block.controls || false} disablePictureInPicture disableRemotePlayback playsInline
      preload={block.preload || 'metadata'} aria-label={item.title} onError={recover}>
      {item.captions && <track kind="captions" src={item.captions} srcLang="en" label="English" />}
      <a href={item.src}>Watch {item.title}</a>
    </video>
    {failed && <div className="study-video-recovery">
      {item.poster && <img src={item.poster} alt="" />}
      <div className="study-video-recovery__actions" role="status">
        <span>Video couldn’t load.</span>
        <button type="button" onClick={() => { attempts.current = 0; reload() }}>Retry video</button>
        <a href={item.src}>Open video</a>
      </div>
    </div>}
  </div>
}
