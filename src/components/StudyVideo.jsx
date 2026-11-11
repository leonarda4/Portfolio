import { useEffect, useRef, useState } from 'react'
import './StudyVideo.css'

export default function StudyVideo({ item, block, reducedMotion }) {
  const video = useRef(null)
  const retryTimer = useRef(null)
  const attempts = useRef(0)
  const [failed, setFailed] = useState(false)
  const autoPlay = block.autoPlay !== false && !reducedMotion

  useEffect(() => () => clearTimeout(retryTimer.current), [])

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
