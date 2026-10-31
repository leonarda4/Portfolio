import MotionCanvas from './brainy/MotionCanvas'
import { WorkingAgent } from './brainy/WorkingAgent'
import { roster } from './brainy/assets'
import './BrainyCover.css'

const TAU = Math.PI * 2

// Adapted from brainy-hq's RevisedMotion / Ensemble. The periodic clock
// closes the orbit, body expressions and eyes together at eight seconds.
export function BrainyScene({ time = 0, width = 1920, height = 1080 }) {
  const tall = height > width
  const phase = TAU * time / 8
  const characterTime = 2 - 2 * Math.cos(phase)
  return <div className="brainy-scene" style={{ width, height }} aria-hidden="true">
    <div className="brainy-scene__statement">
      {tall ? ['Just', 'talk,', 'let', 'ideas', 'take', 'shape.'].map((word, index) =>
        <div key={word} className={index === 5 ? 'brainy-scene__accent' : undefined}>{word}</div>
      ) : <>Just talk,<br />let ideas take <span className="brainy-scene__accent">shape.</span></>}
    </div>
    {roster.map((agent, index) => {
      const angle = index * TAU / 8 + phase
      return <WorkingAgent key={agent.name} index={index}
        x={width * .5 + Math.cos(angle) * width * .32}
        y={height * .5 + Math.sin(angle) * height * .34}
        size={130} time={characterTime + index * .3} energy={.8}
        lookAt={{ x: width / 2, y: height / 2 }} />
    })}
  </div>
}

// The film's passPose flight: alternating entrances/exits along the upper and
// lower lanes. Each agent resets only after its body and tag have left the frame.
const flightDuration = 1.95
// Match the entry interval to time spent inside the viewport, excluding the
// offscreen lead-in/out. Three agent centers stay in view at any canvas width.
const entryInterval = flightDuration * (1440 / 1900) / 3
export const LOGO_LOOP = roster.length * entryInterval
export function logoPass(time, index, width, height) {
  const elapsed = ((time - index * entryInterval + 1.2) % LOGO_LOOP + LOGO_LOOP) % LOGO_LOOP
  const u = elapsed / flightDuration
  return {
    visible: u <= 1,
    x: (index % 2 === 0 ? -230 + 1900 * u : 1670 - 1900 * u) * width / 1440,
    y: ((index % 3 !== 1 ? 145 : 680) + Math.sin(u * TAU + index) * 65 + Math.sin(u * Math.PI) * (index % 2 ? 45 : -45)) * height / 810,
    elapsed,
  }
}
export function BrainyLogoScene({ time = 0, width = 1920, height = 1080 }) {
  return <div className="brainy-scene" style={{ width, height }} aria-hidden="true">
    <img className="brainy-scene__logo brainy-scene__logo--light" src="/assets/brainy-storm/code/wordmark-white.svg" alt="" draggable="false" />
    <img className="brainy-scene__logo brainy-scene__logo--dark" src="/assets/brainy-storm/code/wordmark.svg" alt="" draggable="false" />
    {roster.map((agent, index) => {
      const pose = logoPass(time, index, width, height)
      return pose.visible && <WorkingAgent key={agent.name} index={index}
        x={pose.x} y={pose.y} size={130} time={pose.elapsed + index * .3} energy={.8}
        lookAt={{ x: pose.x + (index % 2 ? -180 : 180), y: pose.y }} />
    })}
  </div>
}

export default function BrainyCover({ hero = false, inline = false }) {
  const Scene = inline ? BrainyScene : BrainyLogoScene
  return <MotionCanvas responsive={!inline} fill={!inline} duration={inline ? 8 : LOGO_LOOP}
    className={`${inline ? 'brainy-cover--inline' : 'brainy-cover--logo'}${hero ? ' brainy-cover--hero' : ''}`}
    label={inline ? 'Just talk, let ideas take shape. Eight named brainy storm characters move around the message.' : 'brainy storm. Named agents rush in and out of view around the centered logo.'}>
    {props => <Scene {...props} />}
  </MotionCanvas>
}
