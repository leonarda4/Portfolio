import MotionCanvas from './brainy/MotionCanvas'
import { LaptopFrame } from './brainy/LaptopFrame'
import { workspaceLayout as ui } from './brainy/workspace-layout'
import './BrainyCover.css'

const src = file => `/assets/brainy-storm/code/workspace/${file}`
const mix = (a, b, p) => a + (b - a) * p
// Easy ease: zero velocity and acceleration at both ends.
const smooth = value => { const p = Math.max(0, Math.min(1, value)); return p * p * p * (p * (p * 6 - 15) + 10) }
const progress = (time, start, end) => smooth((time - start) / (end - start))
const origins = [[173, 720], [800, 587], [1373, 707], [1747, 573]]
const stageHeight = 1200
const playbackRate = 1.4
const loopDuration = 14 / playbackRate

// Illustrative continuation of the captured conversation, not a verbatim record.
const transcript = [
  ['Marko', 'M', '#ffe500', "We should probably have some sort of system that tracks all these variations, because we're treating the same ideas as new ideas every fifteen minutes."],
  ['Giacomo', 'G', '#a346e0', 'Honestly, just having a proper transcript and a list of decisions would help.'],
  ['Leonarda', 'L', '#ff7043', 'Yeah, but not just a transcript. I think each idea needs its own place, with the arguments and decisions attached to it.'],
  ['Marko', 'M', '#ffe500', 'Right. The gaming agent and the furniture recommendation tool are separate ideas. We should be able to compare them without losing either thread.'],
  ['Giacomo', 'G', '#a346e0', 'And if we come back to the networking idea, it should update the same card instead of creating another one.'],
  ['Leonarda', 'L', '#ff7043', "Let's start there: capture the conversation, group it into ideas, and keep track of what we've agreed on. Then we can focus on talking."],
]

function WorkspaceTranscript({ scale }) {
  return <div className="brainy-transcript" style={{ transform: `scale(${scale})` }}>
    <img src={src('transcript-header.png')} alt="" className="brainy-transcript__header" />
    <div className="brainy-transcript__guidance">Introduce yourself naturally, for example “Hi, it’s Maya.” We’ll use your voice to recognize you as the conversation continues.</div>
    <div className="brainy-transcript__feed">
      {transcript.map(([name, initial, color, text], index) => <div className="brainy-transcript__line" key={index}>
        <span className="brainy-transcript__avatar" style={{ background: color, color: name === 'Giacomo' ? '#fff' : '#171717' }}>{initial}</span>
        <div className="brainy-transcript__content"><strong>{name}</strong><p>{text}</p></div>
      </div>)}
    </div>
  </div>
}

// RecordingShape / brand-listen from the app: 32px lobes, staggered by
// .13 seconds, breathing between .4 and 1 over a 950ms alternating cycle.
function ListeningWave({ time, scale }) {
  const count = Math.ceil(390 / 32)
  return <svg viewBox="0 0 390 56" preserveAspectRatio="none" style={{ position: 'absolute', left: 120 * scale, top: 14 * scale, width: 390 * scale, height: 48 * scale }}>
    <rect width="390" height="56" fill="#171717" />
    {Array.from({ length: count }, (_, i) => {
      const height = 10 + 17 * (1 - Math.abs(i / (count - 1) * 2 - 1))
      const breath = .7 - .3 * Math.cos(Math.PI * 2 * (time + i * .13) / 1.9)
      return <ellipse key={i} cx={16 + i * 358 / (count - 1)} cy="28" rx="16" ry={height * breath} fill="#3FFAE9" />
    })}
  </svg>
}

// Scene 10's actual UI parts and 16:10 viewport, animated as DOM layers.
// The cards remain the same elements from their first reveal through the scroll.
export function BrainyWorkspaceScene({ time: elapsed = 0 }) {
  const time = elapsed * playbackRate
  const morph = progress(time, 2.7, 4.2)
  const zoom = progress(time, 4.8, 5.9)
  const exit = stageHeight * progress(time, 12.3, 13.4)
  const screenWidth = mix(1720, 1560, zoom)
  const screenHeight = screenWidth * 900 / 1440
  // The sourced base ends 563 units below the display top. Rest that exact
  // physical edge on the canvas bottom, keeping the screen and bezel together.
  const screenY = mix((stageHeight - screenHeight) / 2, stageHeight - 563 * screenWidth / 840, zoom)
  const screen = { x: (1920 - screenWidth) / 2, y: screenY, width: screenWidth }
  const scale = screenWidth / 1440
  const radius = 8 * screenWidth / 840
  // One uninterrupted glide, with a gentle acceleration and final settle.
  const scroll = ui.scrollMax * progress(time, 6.5, 11.5)
  const parts = {
    navigation: { p: progress(time, 3.05, 4.2), x: -440, y: 0 },
    transcript: { p: progress(time, 3.2, 4.35), x: 440, y: 0 },
    heading: { p: progress(time, 3.3, 4.2), x: 0, y: 32 },
    dock: { p: progress(time, 3.5, 4.45), x: 0, y: 210 },
  }
  const railLeft = screen.x + ui.rail.x * scale
  const railTop = screen.y + ui.rail.y * scale
  const railBottom = stageHeight - screen.y - (ui.rail.y + ui.rail.height) * scale
  const railRight = 1920 - screen.x - (ui.rail.x + ui.rail.width) * scale
  return <div className="brainy-workspace" style={{ position: 'relative', width: 1920, height: stageHeight, overflow: 'hidden', background: '#eaeae8' }} aria-hidden="true">
    <div style={{ position: 'absolute', inset: 0, transform: `translateY(${exit}px)` }}>
      <div style={{ position: 'absolute', left: screen.x, top: screen.y, width: screenWidth, height: screenHeight, borderRadius: `${radius}px ${radius}px ${radius / 4}px ${radius / 4}px`, overflow: 'hidden', opacity: progress(time, 2.85, 3.85) }}>
        <img src={src('background.png')} alt="" style={{ width: '100%', height: '100%' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, clipPath: `inset(${railTop * morph}px ${railRight * morph}px ${railBottom * morph}px ${railLeft * morph}px)` }}>
        {ui.cards.map((card, i) => {
          const settle = progress(time, i * .07, .95 + i * .07)
          const reveal = progress(time, 1.3 + i * .08, 2.1 + i * .08)
          const initialScale = 304 / card.width
          const artScale = mix(210 / card.art.width, initialScale, settle)
          const currentScale = mix(artScale, scale, morph)
          const initialX = 236 + i * 380, initialY = 288
          const origin = origins[i] || [initialX, initialY]
          const x = mix(mix(origin[0], initialX, settle), screen.x + (card.x - scroll) * scale, morph)
          const y = mix(mix(origin[1], initialY, settle), screen.y + card.y * scale, morph)
          const visibleHeight = mix(card.art.y + card.art.height, card.height, reveal)
          return <div key={card.file} data-idea-card={i} style={{ position: 'absolute', left: x, top: y, width: card.width * currentScale, height: card.height * currentScale,
            opacity: i < 4 ? progress(time, i * .07, .25 + i * .07) : progress(time, 3.55, 4.2),
            clipPath: `inset(0 0 ${100 * (1 - visibleHeight / card.height)}% 0)` }}>
            <img src={src(card.file)} alt="" style={{ width: '100%', height: '100%' }} />
          </div>
        })}
      </div>
      <div style={{ position: 'absolute', left: screen.x, top: screen.y, width: screenWidth, height: screenHeight, borderRadius: `${radius}px ${radius}px ${radius / 4}px ${radius / 4}px`, overflow: 'hidden' }}>
        {Object.entries(ui.parts).map(([name, part]) => {
          const motion = parts[name]
          return <div key={name} style={{ position: 'absolute', left: part.x * scale, top: part.y * scale, width: part.width * scale, height: part.height * scale,
            transform: `translate(${motion.x * (1 - motion.p)}px, ${motion.y * (1 - motion.p)}px)`, opacity: motion.p }}>
            {name === 'transcript' ? <WorkspaceTranscript scale={scale} /> : <img src={src(part.file)} alt="" style={{ width: '100%', height: '100%' }} />}
            {name === 'dock' && <ListeningWave time={elapsed} scale={scale} />}
          </div>
        })}
      </div>
      <LaptopFrame {...screen} opacity={progress(time, 5, 5.9)} />
    </div>
  </div>
}

export default function BrainyWorkspace() {
  return <MotionCanvas className="brainy-cover--workspace" width={1920} height={stageHeight} duration={loopDuration} stillTime={6.4 / playbackRate}
    label="The brainy storm workspace assembles from idea cards into a laptop, then scrolls horizontally through all five ideas.">
    {({ time }) => <BrainyWorkspaceScene time={time} />}
  </MotionCanvas>
}
