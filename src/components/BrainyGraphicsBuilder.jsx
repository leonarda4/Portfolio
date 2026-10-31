import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { recipes, palettes, drawRecipe } from './brainy/graphics-engine'
import { initialGraphic, updateGraphic } from './brainy/graphics-state'
import './BrainyGraphicsBuilder.css'
import './BrainySlider.css'

const collection = recipes()
const svgSource = svg => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
const thumbnails = collection.map(recipe => svgSource(drawRecipe(recipe, initialGraphic(recipe).settings)))
const roles = [['background', 'Background'], ['ink', 'Shape'], ['accent', 'Accent']]
// Play the original internal entrances once, then keep the composition visible.
export function GraphicPreview({ recipe, current }) {
  const ref = useRef(null)
  const clock = useRef(0)
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const source = useMemo(() => drawRecipe(recipe, current.settings, current.colors, true)
    .replaceAll('reveal-', `${id}-reveal-`), [recipe, current, id])
  useEffect(() => { clock.current = 0 }, [recipe.id])
  useEffect(() => {
    const node = ref.current
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    let animations = [], duration = 0
    let visible = false, raf = 0, previous = null
    function render() {
      const time = Math.min(clock.current, duration)
      animations.forEach(animation => { animation.currentTime = media.matches ? duration : time })
    }
    function tick(now) {
      if (previous !== null) clock.current += now - previous
      previous = now
      render()
      if (clock.current < duration) raf = requestAnimationFrame(tick)
    }
    function sync() {
      cancelAnimationFrame(raf)
      previous = null
      animations = node.getAnimations({ subtree: true })
      duration = Math.max(0, ...animations.map(animation => animation.effect.getComputedTiming().endTime))
      animations.forEach(animation => animation.pause())
      render()
      if (visible && !document.hidden && !media.matches && clock.current < duration) raf = requestAnimationFrame(tick)
    }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync() })
    observer.observe(node)
    media.addEventListener('change', sync)
    document.addEventListener('visibilitychange', sync)
    sync()
    return () => {
      observer.disconnect(); cancelAnimationFrame(raf)
      media.removeEventListener('change', sync)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [source])
  return <div ref={ref} className="graphics-builder__art" role="img" aria-label={`${recipe.label}: ${recipe.concept}`} dangerouslySetInnerHTML={{ __html: source }} />
}

const sameColors = (a, b) => roles.every(([key]) => a[key].toLowerCase() === b[key].toLowerCase())

export default function BrainyGraphicsBuilder() {
  const id = useId()
  const [selected, setSelected] = useState('original-3')
  const [edits, setEdits] = useState({})
  const recipe = collection.find(item => item.id === selected)
  const current = edits[selected] || initialGraphic(recipe)
  function update(change) { setEdits(previous => updateGraphic(previous, recipe, change)) }
  const combinations = [{ ...recipe.palette, name: 'Original' }, ...palettes]
  // Prefer the Original swatch when the same palette is also in the library.
  const chosenPalette = combinations.findIndex(palette => sameColors(palette, current.colors))
  return <div className="graphics-builder">
    <fieldset className="graphics-builder__recipes"><legend>Graphic recipe</legend><div className="graphics-builder__strip">
      {collection.map((item, index) => <label className="graphics-builder__recipe" key={item.id}>
        <input type="radio" name={`${id}-recipe`} value={item.id} checked={selected === item.id} onChange={() => setSelected(item.id)} />
        <span><img src={thumbnails[index]} alt="" loading="lazy" /><span>{item.label}</span></span>
      </label>)}
    </div></fieldset>
    <figure className="graphics-builder__figure"><GraphicPreview recipe={recipe} current={current} /><figcaption>{recipe.concept}</figcaption></figure>
    <fieldset className="graphics-builder__palettes"><legend>Color combinations</legend><div className="graphics-builder__swatches">
      {combinations.map((palette, index) => <label className="graphics-builder__palette" key={`${selected}-${index}`} title={palette.name}>
        <input type="radio" name={`${id}-palette`} checked={chosenPalette === index} onChange={() => update({ colors: palette })} aria-label={palette.name} />
        <span>{roles.map(([key]) => <i key={key} style={{ background: palette[key] }} />)}</span>
      </label>)}
    </div></fieldset>
    <div className="graphics-builder__sliders">{[['scale', 'Scale'], ['spacing', 'Spacing']].map(([key, label]) => <label key={key}>
      <span>{label}<output>{current.settings[key].toFixed(2)}×</output></span>
      <input type="range" min="0.9" max="1.2" step="0.01" value={current.settings[key]} style={{ '--range-progress': `${(current.settings[key] - 0.9) / 0.3 * 100}%` }} onChange={event => update({ settings: { [key]: Number(event.target.value) } })} aria-label={`${label} of graphic`} aria-valuetext={`${Math.round(current.settings[key] * 100)} percent`} />
    </label>)}</div>
  </div>
}
