import { useEffect, useId, useRef, useState } from 'react'
import { SOUNDSCAPES, formatControlValue } from './soundscapes/data'
import SoundscapeCarousel from './SoundscapeCarousel'
import './SoundscapeCards.css'

function initialPreferences() {
  return Object.fromEntries(SOUNDSCAPES.map(sound => [sound.id, {
    enabled: Object.fromEntries(sound.parts.map(part => [part.id, true])),
    controls: Object.fromEntries(sound.parts.map(part => [part.id,
      Object.fromEntries(part.controls.map(control => [control.id, control.default]))])),
  }]))
}

function PlaybackIcon({ playing }) {
  return <svg viewBox="0 0 20 20" width="18" height="18" fill="currentColor" aria-hidden="true">
    {playing ? <path d="M4 4h12v12H4Z" /> : <path d="m6 3 11 7-11 7Z" />}
  </svg>
}

function SoundscapeCard({ sound, index, playing, pending, preferences, selectedPart, onSelectPart, onToggle, onPartToggle, onControl }) {
  const id = useId()
  const tabs = useRef([])
  const part = sound.parts.find(item => item.id === selectedPart)
  const enabled = preferences.enabled[part.id]

  function moveTab(event, current) {
    let next
    if (event.key === 'ArrowRight') next = (current + 1) % sound.parts.length
    if (event.key === 'ArrowLeft') next = (current - 1 + sound.parts.length) % sound.parts.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = sound.parts.length - 1
    if (next === undefined) return
    event.preventDefault()
    onSelectPart(sound.id, sound.parts[next].id)
    tabs.current[next]?.focus()
  }

  return <article className={`soundscape-card${playing ? ' is-playing' : ''}`} aria-labelledby={`${id}-title`}>
    <div className="soundscape-card__topline">
      <span className="soundscape-card__number">0{index + 1}</span>
      <span className="soundscape-card__state">{pending ? 'Starting…' : playing ? 'Playing' : 'Ready to play'}</span>
    </div>
    <header className="soundscape-card__header">
      <h3 id={`${id}-title`}>{sound.name}</h3>
      <button type="button" className="soundscape-play" onClick={() => onToggle(sound.id)} aria-label={`${playing || pending ? 'Stop' : 'Play'} ${sound.name}`} data-playing={playing}>
        <PlaybackIcon playing={playing || pending} />
      </button>
    </header>
    <p className="soundscape-card__description">{sound.description}.</p>
    <div className="soundscape-wave" aria-hidden="true">
      {Array.from({ length: 36 }, (_, i) => <span key={i} style={{ '--bar-height': `${8 + Math.abs(Math.sin(i * .67 + index) * Math.cos(i * .23)) * 28}px`, '--bar-delay': `${-(i % 9) * .13}s` }} />)}
    </div>
    <div className="soundscape-tabs" role="tablist" aria-label={`${sound.name} sound layers`}>
      {sound.parts.map((item, i) => <button key={item.id} ref={element => { tabs.current[i] = element }} type="button" role="tab" id={`${id}-tab-${item.id}`} aria-controls={`${id}-panel-${item.id}`} aria-selected={selectedPart === item.id} tabIndex={selectedPart === item.id ? 0 : -1} onClick={() => onSelectPart(sound.id, item.id)} onKeyDown={event => moveTab(event, i)}>
        <span className={`soundscape-layer-dot${preferences.enabled[item.id] ? '' : ' is-muted'}`} aria-hidden="true" />{item.label}
        {!preferences.enabled[item.id] && <span className="echo-sr-only"> (muted)</span>}
      </button>)}
    </div>
    {sound.parts.map(item => <div key={item.id} id={`${id}-panel-${item.id}`} role="tabpanel" aria-labelledby={`${id}-tab-${item.id}`} hidden={item.id !== selectedPart}>
      {item.id === selectedPart && <>
        <div className="soundscape-controls-heading">
          <span>{part.label} controls</span>
          <button type="button" className="soundscape-layer-toggle" aria-label={`${sound.name} ${part.label} layer`} aria-pressed={enabled} onClick={() => onPartToggle(sound.id, part.id)}>
            <span className="soundscape-toggle-track" aria-hidden="true"><span /></span>{enabled ? 'On' : 'Muted'}
          </button>
        </div>
        <div className="soundscape-sliders">
          {part.controls.map(control => {
            const value = preferences.controls[part.id][control.id]
            const inputId = `${id}-${part.id}-${control.id}`
            return <div className="soundscape-slider" key={control.id}>
              <div className="soundscape-slider__label"><label htmlFor={inputId}>{control.label}</label><output htmlFor={inputId}>{formatControlValue(control, value)}</output></div>
              <input id={inputId} type="range" min={control.min} max={control.max} step={control.step} value={value} aria-label={`${sound.name} ${part.label} ${control.label}`} aria-valuetext={formatControlValue(control, value)} style={{ '--range-progress': `${(value - control.min) / (control.max - control.min) * 100}%` }} onChange={event => onControl(sound.id, part.id, control.id, Number(event.target.value))} />
            </div>
          })}
        </div>
      </>}
    </div>)}
  </article>
}

export default function SoundscapeCards() {
  const [preferences, setPreferences] = useState(initialPreferences)
  const preferencesRef = useRef(preferences)
  const [selectedParts, setSelectedParts] = useState(() => Object.fromEntries(SOUNDSCAPES.map(sound => [sound.id, sound.parts[0].id])))
  const [playing, setPlaying] = useState([])
  const [pending, setPending] = useState([])
  const [volume, setVolume] = useState(55)
  const volumeRef = useRef(volume)
  const [error, setError] = useState('')
  const engine = useRef(null)
  const nativeContext = useRef(null)
  const loading = useRef(null)
  const requests = useRef(new Map())
  const mounted = useRef(false)
  const generation = useRef(0)
  const volumeId = useId()

  useEffect(() => {
    mounted.current = true
    generation.current += 1
    return () => {
      mounted.current = false
      generation.current += 1
      requests.current.clear()
      if (engine.current) engine.current.dispose()
      else nativeContext.current?.close().catch(() => {})
      engine.current = null
      nativeContext.current = null
      loading.current = null
    }
  }, [])

  async function getEngine() {
    if (engine.current) return engine.current
    if (!loading.current) {
      const version = generation.current
      // Unlock synchronously in the play gesture, before downloading Tone.js.
      const AudioContextClass = window.AudioContext || window.webkitAudioContext
      const audioContext = new AudioContextClass()
      nativeContext.current = audioContext
      const resumed = audioContext.resume()
      loading.current = Promise.all([import('./soundscapes/engine'), resumed]).then(([{ createSoundscapeEngine }]) => {
        if (!mounted.current || version !== generation.current) return null
        engine.current = createSoundscapeEngine(audioContext)
        engine.current.setVolume(volumeRef.current / 100)
        return engine.current
      }).catch(error => {
        if (nativeContext.current === audioContext) {
          audioContext.close().catch(() => {})
          nativeContext.current = null
          loading.current = null
        }
        throw error
      })
    }
    return loading.current
  }

  async function toggleSound(id) {
    if (requests.current.has(id)) {
      requests.current.delete(id)
      engine.current?.stop(id)
      setPlaying(current => current.filter(item => item !== id))
      setPending(current => current.filter(item => item !== id))
      return
    }
    const request = Symbol(id)
    requests.current.clear()
    requests.current.set(id, request)
    setPlaying([])
    setPending([id])
    setError('')
    try {
      const audio = await getEngine()
      if (!audio || requests.current.get(id) !== request) return
      const started = await audio.start(id, preferencesRef.current[id])
      if (!mounted.current || requests.current.get(id) !== request) return
      if (started) {
        // Settings can change while the browser unlocks its audio context.
        const latest = preferencesRef.current[id]
        for (const [partId, enabled] of Object.entries(latest.enabled)) audio.setPartEnabled(id, partId, enabled)
        for (const [partId, controls] of Object.entries(latest.controls)) {
          for (const [controlId, value] of Object.entries(controls)) audio.setControl(id, partId, controlId, value)
        }
        setPlaying([id])
      } else requests.current.delete(id)
    } catch {
      if (mounted.current && requests.current.get(id) === request) {
        requests.current.delete(id)
        setError('Audio could not start. Try playing the atmosphere again.')
      }
    } finally {
      if (mounted.current && (!requests.current.has(id) || requests.current.get(id) === request)) setPending(current => current.filter(item => item !== id))
    }
  }

  function stopAll() {
    requests.current.clear()
    engine.current?.stopAll()
    setPlaying([])
    setPending([])
  }

  function togglePart(soundId, partId) {
    const sound = preferencesRef.current[soundId]
    const enabled = !sound.enabled[partId]
    const next = { ...preferencesRef.current, [soundId]: { ...sound, enabled: { ...sound.enabled, [partId]: enabled } } }
    preferencesRef.current = next
    setPreferences(next)
    engine.current?.setPartEnabled(soundId, partId, enabled)
  }

  function changeControl(soundId, partId, controlId, value) {
    const sound = preferencesRef.current[soundId]
    const next = { ...preferencesRef.current, [soundId]: { ...sound, controls: { ...sound.controls, [partId]: { ...sound.controls[partId], [controlId]: value } } } }
    preferencesRef.current = next
    setPreferences(next)
    engine.current?.setControl(soundId, partId, controlId, value)
  }

  return <div className="soundscapes">
    <div className="soundscapes-toolbar">
      <div className="soundscapes-volume soundscape-slider">
        <label htmlFor={volumeId}>Volume</label>
        <input id={volumeId} type="range" min="0" max="100" value={volume} aria-valuetext={`${volume}%`} style={{ '--range-progress': `${volume}%` }} onChange={event => {
          const value = Number(event.target.value)
          volumeRef.current = value
          setVolume(value)
          engine.current?.setVolume(value / 100)
        }} />
        <output htmlFor={volumeId}>{volume}%</output>
      </div>
      <button type="button" className="soundscapes-stop" onClick={stopAll} disabled={!playing.length && !pending.length}><span aria-hidden="true">■</span> Stop</button>
    </div>
    {error && <p className="soundscapes-error" role="alert">{error}</p>}
    <SoundscapeCarousel items={SOUNDSCAPES} renderItem={(sound, index) => <SoundscapeCard sound={sound} index={index} playing={playing.includes(sound.id)} pending={pending.includes(sound.id)} preferences={preferences[sound.id]} selectedPart={selectedParts[sound.id]} onSelectPart={(soundId, partId) => setSelectedParts(current => ({ ...current, [soundId]: partId }))} onToggle={toggleSound} onPartToggle={togglePart} onControl={changeControl} />} />
  </div>
}
