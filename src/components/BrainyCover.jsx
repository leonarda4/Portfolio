import MotionCanvas from './brainy/MotionCanvas'
import { LaptopFrame } from './brainy/LaptopFrame'
import { BrainyWorkspacePreview } from './BrainyWorkspace'
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
        // Offset the orbit to include the right-hand name tags in its visual center.
        x={width * .5 - 45 + Math.cos(angle) * width * .32}
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
const COVER_LOOP = LOGO_LOOP * 6
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
function CoverLaptop({ width, height, time }) {
  // Fit the actual 980 × 579 device bounds, keeping its 1440 × 900 display.
  const screenWidth = Math.min(width * .90 * 840 / 980, height * .72 * 840 / 579)
  const deviceScale = screenWidth / 840
  const x = (width - screenWidth) / 2
  // The physical base ends 563 units below the display's top edge.
  const y = height - 563 * deviceScale
  return <>
    <div className="brainy-cover__laptop-display" style={{ left: x, top: y, width: screenWidth, height: screenWidth * 900 / 1440, borderRadius: 8 * deviceScale }}>
      <div style={{ width: 1440, height: 900, transform: `scale(${screenWidth / 1440})`, transformOrigin: 'top left' }}><BrainyWorkspacePreview time={time} cycleDuration={COVER_LOOP} /></div>
    </div>
    <LaptopFrame x={x} y={y} width={screenWidth} opacity={1} />
  </>
}

export function BrainyLogoScene({ time = 0, width = 1920, height = 1080 }) {
  return <div className="brainy-scene" style={{ width, height }} aria-hidden="true">
    <CoverLaptop width={width} height={height} time={time} />
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
  return <MotionCanvas responsive={!inline} fill={!inline} duration={inline ? 8 : COVER_LOOP}
    className={`${inline ? 'brainy-cover--inline' : 'brainy-cover--logo'}${hero ? ' brainy-cover--hero' : ''}`}
    label={inline ? 'Just talk, let ideas take shape. Eight named brainy storm characters move around the message.' : 'A live brainy storm discussion in a laptop: the transcript and listening waveform animate as the focus moves between ideas, with named agents rushing around it.'}>
    {props => <Scene {...props} />}
  </MotionCanvas>
}
