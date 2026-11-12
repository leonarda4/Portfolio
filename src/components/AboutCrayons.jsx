import { useSyncExternalStore } from 'react'
import { aboutCrayons } from '../content/about-artwork'
import { SUPPORTING_PALETTE } from '../../design-system/playful-palette'
import { getDrawingTool, subscribeDrawingTool, selectCrayon } from './playful/drawing-tool'

export default function AboutCrayons({ group }) {
  const tool = useSyncExternalStore(subscribeDrawingTool, getDrawingTool)
  return <div className={`about-crayons about-crayons--${group}`} role="group" aria-label="Choose a crayon color">
    {aboutCrayons.filter(crayon => crayon.group === group).map(crayon => {
      const color = SUPPORTING_PALETTE.find(item => item.name === crayon.name).crayon
      return <div key={crayon.name} className="about-crayon-position" style={{ '--crayon-x': crayon.x, '--crayon-y': crayon.y, '--crayon-angle': `${crayon.angle}deg`, '--crayon-tilt': `${crayon.tilt}deg` }}>
        <button type="button" className="about-crayon" aria-label={`Draw with ${crayon.name.toLowerCase()} crayon`} aria-pressed={tool.active && tool.color === color} onClick={() => selectCrayon(color)}>
          <img src={`/assets/about/figma/${crayon.asset}.svg`} alt="" draggable="false" />
        </button>
      </div>
    })}
  </div>
}
