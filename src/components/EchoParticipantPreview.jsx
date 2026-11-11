import { useEffect, useRef, useState } from 'react'
import groups from './noise-lab/recipes.json'
import { createNoiseRenderer } from './noise-lab/renderer'
import './EchoParticipantPreview.css'

// Frame 158 and frame 606 of the 60 fps testing recording change the readout.
export const PARTICIPANT_CUES = [
  { start: 0, sound: 'determined', recipe: groups.find(group => group.id === 'determination').recipes[0] },
  { start: 158 / 60, sound: 'angry', recipe: groups.find(group => group.id === 'anger').recipes[1] },
  { start: 606 / 60, sound: 'joyful', recipe: groups.find(group => group.id === 'happiness').recipes[4] },
]
export const participantCueAt = time => PARTICIPANT_CUES.findLast(cue => time >= cue.start) || PARTICIPANT_CUES[0]

export default function EchoParticipantPreview({ block }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fallbackRef = useRef(null)
  const runtime = useRef(null)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    const state = { disposed: false, audio: null, context: null, loading: null, muted: true, sound: null, inView: false, waiting: false }
    runtime.current = state
    let renderer
    let frame
    let lastDraw = -Infinity
    let previousTime = 0
    let currentRecipe
    try { renderer = createNoiseRenderer(canvas) } catch { /* Saved recipe remains visible without WebGL. */ }

    function syncAudio(cue) {
      if (!state.audio) return
      const audible = !state.muted && !video.paused && !video.seeking && !state.waiting && state.inView && !document.hidden
      if (state.audible !== audible) {
        state.audible = audible
        state.audio.setVolume(audible ? 0.55 : 0)
      }
      if (!audible) {
        if (state.sound) state.audio.stopAll()
        state.sound = null
      } else if (state.sound !== cue.sound) {
        state.sound = cue.sound
        state.audio.start(cue.sound).catch(() => {
          if (state.disposed) return
          state.muted = true
          state.sound = null
          state.audio.setVolume(0)
          setMuted(true)
        })
      }
    }
    state.sync = () => syncAudio(participantCueAt(video.currentTime))

    function draw(now) {
      if (state.disposed) return
      const time = video.currentTime
      const cue = participantCueAt(time)
      if (time < previousTime) {
        state.audio?.stopAll()
        state.sound = null
      }
      previousTime = time
      if (currentRecipe !== cue.recipe.id) {
        currentRecipe = cue.recipe.id
        fallbackRef.current.src = cue.recipe.preview
        canvas.dataset.recipe = currentRecipe
      }
      if (state.inView && !document.hidden && now - lastDraw >= 1000 / 30) {
        lastDraw = now
        const width = Math.max(1, Math.round(canvas.clientWidth))
        const height = Math.max(1, Math.round(canvas.clientHeight))
        if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height }
        if (renderer) {
          try {
            renderer.render([{ recipe: cue.recipe, x: 0, y: 0, width, height }], time)
            canvas.style.opacity = '1'
          } catch {
            renderer.destroy()
            renderer = null
            canvas.style.opacity = '0'
          }
        }
      }
      // Changes only start a new atmosphere when the video's cue changes.
      syncAudio(cue)
      frame = requestAnimationFrame(draw)
    }
    function onPlaying() { state.waiting = false; setPlaying(!video.paused); state.sync() }
    function onPause() { setPlaying(false); state.sync() }
    function onWaiting() { state.waiting = true; state.sync() }
    function visibility() {
      if (document.hidden) video.pause()
      state.sync()
    }
    video.addEventListener('playing', onPlaying)
    video.addEventListener('pause', onPause)
    video.addEventListener('waiting', onWaiting)
    video.addEventListener('seeking', onWaiting)
    video.addEventListener('seeked', onPlaying)
    document.addEventListener('visibilitychange', visibility)
    const observer = new IntersectionObserver(([entry]) => {
      state.inView = entry.isIntersecting
      if (!state.inView) video.pause()
      state.sync()
    })
    observer.observe(video.parentElement)
    frame = requestAnimationFrame(draw)
    return () => {
      state.disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      video.removeEventListener('playing', onPlaying)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('waiting', onWaiting)
      video.removeEventListener('seeking', onWaiting)
      video.removeEventListener('seeked', onPlaying)
      document.removeEventListener('visibilitychange', visibility)
      renderer?.destroy()
      if (state.audio) state.audio.dispose()
      else state.context?.close().catch(() => {})
      runtime.current = null
    }
  }, [])

  async function toggleSound() {
    const state = runtime.current
    if (!state || loading) return
    if (!state.muted) {
      state.muted = true
      setMuted(true)
      state.sync()
      return
    }
    setLoading(true)
    try {
      if (!state.audio) {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        state.context = new AudioContext()
        const resumed = state.context.resume()
        const [{ createSoundscapeEngine }] = await Promise.all([import('./soundscapes/engine'), resumed])
        if (state.disposed) return
        state.audio = createSoundscapeEngine(state.context)
      }
      state.muted = false
      setMuted(false)
      await videoRef.current.play()
      state.sync()
    } catch {
      state.muted = true
      if (!state.audio) { state.context?.close().catch(() => {}); state.context = null }
      if (!state.disposed) setMuted(true)
    } finally { if (!state.disposed) setLoading(false) }
  }

  return <div className="echo-participant-preview">
    <video ref={videoRef} src={block.src} poster={block.poster} muted loop playsInline preload="metadata" aria-label="Echo movement detection recording" />
    <figure>
      <div className="echo-participant-output">
        <img ref={fallbackRef} src={PARTICIPANT_CUES[0].recipe.preview} alt="" />
        <canvas ref={canvasRef} aria-label="Audiovisual atmosphere synchronized with the participant’s detected movement" role="img" />
        <div className="echo-participant-controls">
          <button type="button" onClick={() => { const video = videoRef.current; if (video.paused) { if (!runtime.current?.audio) toggleSound(); else video.play().catch(() => {}) } else video.pause() }} aria-label={playing ? 'Pause video and participant preview' : 'Play video and participant preview'}>{playing ? 'Pause' : 'Play'}</button>
          <button type="button" onClick={toggleSound} disabled={loading} aria-label={muted ? 'Unmute participant sound' : 'Mute participant sound'} aria-pressed={!muted}>{loading ? 'Loading sound…' : muted ? 'Unmute' : 'Mute'}</button>
        </div>
      </div>
      <figcaption>What the participant currently sees.</figcaption>
    </figure>
  </div>
}
