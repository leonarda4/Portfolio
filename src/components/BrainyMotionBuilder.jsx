import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { roster } from './brainy/assets'
import { bodies, eyes, personalities } from './brainy/motions'
import { getMotionStore } from './brainy/motion-store'
import BuilderAgent from './brainy/BuilderAgent'
import './BrainyMotionBuilder.css'

function useMotionPreview() {
  const ref = useRef(null)
  const [frame, setFrame] = useState({ time: 0, reduced: false })
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    let visible = false, raf = 0, last = 0
    function tick(now) {
      if (now - last >= 1000 / 30) { setFrame({ time: now / 1000, reduced: false }); last = now }
      raf = requestAnimationFrame(tick)
    }
    function sync() {
      cancelAnimationFrame(raf)
      setFrame({ time: performance.now() / 1000, reduced: media.matches })
      if (visible && !document.hidden && !media.matches) raf = requestAnimationFrame(tick)
    }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() })
    observer.observe(ref.current)
    media.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)
    sync()
    return () => { observer.disconnect(); cancelAnimationFrame(raf); media.removeEventListener('change', sync); document.removeEventListener('visibilitychange', sync) }
  }, [])
  return { ref, ...frame }
}
function Range({ title, field, recipe, update, min, max, step, format }) {
  return <label className="motion-builder__field"><span>{title}<output>{format(recipe[field])}</output></span><input type="range" min={min} max={max} step={step} value={recipe[field]} style={{ '--range-progress': `${(recipe[field] - min) / (max - min) * 100}%` }} onChange={event => update({ [field]: Number(event.target.value) })} aria-label={title} aria-valuetext={format(recipe[field])} /></label>
}
export default function BrainyMotionBuilder({ family = false }) {
  const store = getMotionStore()
  const recipes = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const [selected, setSelected] = useState('Memo')
  const { ref, time, reduced } = useMotionPreview()
  const index = roster.findIndex(agent => agent.name === selected)
  const recipe = recipes[selected]
  const update = patch => store.update(selected, patch)
  if (family) return <div className="motion-family" ref={ref}>{roster.map((agent, i) => <div className="motion-family__card" key={agent.name}>
    <div className="motion-family__stage"><BuilderAgent index={i} recipe={recipes[agent.name]} time={time} reduced={reduced} /></div>
    <p>{personalities[agent.name].trait}</p>
  </div>)}</div>
  return <div className="motion-builder" ref={ref}>
    <div className="motion-builder__agents" role="group" aria-label="Choose an agent to edit">
      {roster.map((agent, i) => <button key={agent.name} type="button" aria-label={agent.name} title={agent.name} aria-pressed={selected === agent.name} onClick={() => setSelected(agent.name)}><span aria-hidden="true"><BuilderAgent index={i} recipe={recipes[agent.name]} time={time} reduced={reduced} icon /></span></button>)}
    </div>
    <div className="motion-builder__editor">
      <div className="motion-builder__preview"><div className="motion-builder__stage"><BuilderAgent index={index} recipe={recipe} time={time} reduced={reduced} /></div><p>{personalities[selected].trait}</p></div>
      <div className="motion-builder__controls" role="group" aria-label={`${selected} movement settings`}>
        <label className="motion-builder__field"><span>Body movement</span><select value={recipe.body} onChange={event => update({ body: event.target.value })}>{[['shared', 'Shared movements'], ['signature', 'Agent personalities']].map(([group, title]) => <optgroup label={title} key={group}>{bodies.filter(([, , kind]) => kind === group).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</optgroup>)}</select></label>
        <label className="motion-builder__field"><span>Eye expression</span><select value={recipe.eyes} onChange={event => update({ eyes: event.target.value })}>{eyes.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <Range title="Tempo" field="speed" recipe={recipe} update={update} min={.5} max={2} step={.1} format={n => `${n.toFixed(1)}×`} />
        <Range title="Body energy" field="energy" recipe={recipe} update={update} min={.25} max={1.5} step={.05} format={n => `${Math.round(n * 100)}%`} />
        <Range title="Eye intensity" field="expression" recipe={recipe} update={update} min={.4} max={1.35} step={.05} format={n => `${Math.round(n * 100)}%`} />
      </div>
    </div>
  </div>
}
