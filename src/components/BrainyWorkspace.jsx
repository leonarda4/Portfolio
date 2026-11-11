import { useLayoutEffect, useRef, useState } from 'react'
import MotionCanvas from './brainy/MotionCanvas'
import { workspaceLayout as ui } from './brainy/workspace-layout'
import './BrainyCover.css'

const src = file => `/assets/brainy-storm/code/workspace/${file}`
const smooth = value => { const p = Math.max(0, Math.min(1, value)); return p * p * p * (p * (p * 6 - 15) + 10) }
const progress = (time, start, end) => smooth((time - start) / (end - start))
// A fast spatial entrance with a restrained, four-pixel settle. No opacity tween.
const cardEntrance = time => {
  const p = Math.max(0, Math.min(1, (time - 4.65) / .6)) - 1
  return 1 + 1.6 * p ** 3 + .6 * p ** 2
}
const duration = 16
const people = {
  Marko: ['M', '#ffe500'],
  Giacomo: ['G', '#a346e0'],
  Leonarda: ['L', '#ff7043'],
}
// Illustrative demo conversation, not a verbatim meeting record.
const history = [
  ['Marko', "We should keep each idea in its own card so we can come back to the reasoning later."],
  ['Giacomo', 'The gaming agent is interesting, but we would need a working game environment to test it.'],
  ['Leonarda', 'The furniture recommendation idea is easier to try. Someone describes their room and we suggest pieces that fit.'],
  ['Marko', 'We would still need a catalog with dimensions, prices, and availability. That could take most of the weekend.'],
  ['Giacomo', 'Maybe we should keep the first version small: one room, a few products, and a clear budget.'],
]
const turns = [
  { at: 0, end: 2.7, name: 'Leonarda', text: 'Yes. Let’s keep the room planner focused on one room for now.' },
  { at: 2.8, end: 5.4, name: 'Marko', text: 'What about a different idea: helping people find teammates at this hackathon?' },
  { at: 5.5, end: 8.4, name: 'Giacomo', text: 'We could match people by their skills and what they want to build.' },
  { at: 8.5, end: 11.5, name: 'Leonarda', text: 'And give each pair a conversation starter, so they know how to begin.' },
  { at: 11.6, end: 15.2, name: 'Marko', text: 'Let’s try it with the participants here. A short profile and three useful introductions.' },
]

function Avatar({ name }) {
  const [initial, color] = people[name]
  return <span className="brainy-transcript__avatar" style={{ background: color, color: name === 'Giacomo' ? '#fff' : '#171717' }}>{initial}</span>
}

function WorkspaceTranscript({ time, conversation = turns, leadIn = history, continuous = false }) {
  const viewport = useRef(null)
  const feed = useRef(null)
  const [offset, setOffset] = useState(0)
  const current = conversation.findLast(turn => time >= turn.at) || conversation[0]
  const lines = [...leadIn, ...conversation.filter(turn => time >= turn.at).map(turn => {
    const words = turn.text.split(' ')
    const spoken = Math.min(words.length, Math.max(1, Math.floor((time - turn.at) / (turn.end - turn.at) * words.length)))
    return [turn.name, words.slice(0, spoken).join(' ')]
  })]
  const contentKey = lines.map(line => line[1]).join('|')
  useLayoutEffect(() => {
    const measure = () => setOffset(Math.max(0, feed.current.offsetHeight - viewport.current.clientHeight))
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(feed.current)
    return () => observer.disconnect()
  }, [contentKey])
  return <div className="brainy-transcript">
    <img src={src('transcript-header.png')} alt="" className="brainy-transcript__header" />
    <div className="brainy-transcript__guidance">Introduce yourself naturally, for example “Hi, it’s Maya.” We’ll use your voice to recognize you as the conversation continues.</div>
    <div ref={viewport} className="brainy-transcript__viewport">
      <div ref={feed} className="brainy-transcript__feed" style={{ transform: `translateY(${-offset}px)`, transition: continuous ? 'none' : undefined }}>
        {lines.map(([name, text], index) => <div className="brainy-transcript__line" key={index}>
          <Avatar name={name} />
          <div className="brainy-transcript__content"><strong>{name}</strong><p>{text}</p></div>
        </div>)}
      </div>
    </div>
    <div className="brainy-transcript__speaking"><Avatar name={current.name} /><span><strong>{current.name}</strong> is speaking</span><i style={{ transform: `scale(${1 + .25 * Math.sin(time * Math.PI * 2 / 1.6)})` }} /></div>
  </div>
}

// Original RecordingShape lobes, animated on the shared scene clock.
function ListeningWave({ time }) {
  const count = Math.ceil(390 / 32)
  return <svg viewBox="0 0 390 56" className="brainy-workspace__wave">
    <rect width="390" height="56" fill="#171717" />
    {Array.from({ length: count }, (_, i) => {
      const height = 10 + 17 * (1 - Math.abs(i / (count - 1) * 2 - 1))
      const breath = .7 - .3 * Math.cos(Math.PI * 2 * (time + i * .13) / 1.6)
      return <ellipse key={i} cx={16 + i * 358 / (count - 1)} cy="28" rx="16" ry={height * breath} fill="#3FFAE9" />
    })}
  </svg>
}

function NewIdea({ time }) {
  return <div className="brainy-workspace__new-idea">
    <div className="brainy-workspace__new-art"><img src={src('card-4.png')} alt="" /></div>
    <div className="brainy-workspace__new-body">
      <div className="brainy-workspace__new-meta">↑ 0 <span>↓ 0</span><b>···</b></div>
      <h3>Hackathon Networking Matchmaker</h3>
      <p>Help hackathon participants find teammates through shared interests, complementary skills, and what they want to build.</p>
      {time >= 7.8 && <div><h4>Conclusion so far</h4><p>Match participants by their skills, shared interests, and what they want to build.</p></div>}
      {time >= 10.8 && <div><h4>Next to explore</h4><p>Give each match a conversation starter, then see which introductions lead to a team.</p></div>}
    </div>
  </div>
}

function WorkspaceView({ time, waveTime, defaultView = false, focusCard = -1, transcriptProps }) {
  // One card-width glide to the left. The new card arrives in the space revealed.
  const scroll = defaultView ? 0 : 444 + 316 * progress(time, 2.9, 4.5)
  const arrival = cardEntrance(time)
  const focused = defaultView ? focusCard : time < 4.65 ? 3 : 4
  return <div className="brainy-workspace__view">
    <img src={src('background.png')} alt="" className="brainy-workspace__background" />
    <div className="brainy-workspace__rail" style={{ left: ui.rail.x, top: ui.rail.y, width: ui.rail.width, height: ui.rail.height }}>
      {ui.cards.map((card, i) => <div key={card.file} data-idea-card={i} data-discussing={focused === i} className="brainy-workspace__card" style={{
        left: card.x - ui.rail.x - scroll, top: card.y - ui.rail.y, width: card.width, height: card.height,
        visibility: !defaultView && i === 4 && time < 4.65 ? 'hidden' : 'visible',
        transform: !defaultView && i === 4 ? `translateX(${354 * (1 - arrival)}px)` : undefined,
      }}>
        {i === 4 && !defaultView ? <NewIdea time={time} /> : <img src={src(card.file)} alt="" />}
        {focused === i && <div className="brainy-workspace__focus"><span>Brainy · Discussing now</span></div>}
      </div>)}
    </div>
    {Object.entries(ui.parts).map(([name, part]) => <div key={name} className={`brainy-workspace__part brainy-workspace__part--${name}`} style={{ left: part.x, top: part.y, width: part.width, height: part.height }}>
      {name === 'transcript' ? <WorkspaceTranscript time={time} {...transcriptProps} /> : <img src={src(part.file)} alt="" />}
      {name === 'navigation' && (defaultView || time >= 4.85) && <div className="brainy-workspace__new-nav">Hackathon Networking Match...</div>}
      {name === 'dock' && <><ListeningWave time={waveTime} /><span className="brainy-workspace__timer">01:{String(23 + Math.floor(time)).padStart(2, '0')}</span></>}
    </div>)}
  </div>
}

// A repeating discussion of the first two visible ideas. Prior turns remain
// above the active sentence, including across the cover clock's loop boundary.
const coverTurns = [
  { name: 'Marko', card: 0, text: 'For the decision tracker, each idea needs its own history. We should see what changed and why the team made that choice.' },
  { name: 'Giacomo', card: 1, text: 'The QR conversation starters could make introductions easier. Scan a profile and get a question based on something you both care about.' },
  { name: 'Leonarda', card: 0, text: 'Back to the decision tracker: keep the alternatives beside the conclusion, so we can revisit an idea without losing the earlier discussion.' },
  { name: 'Marko', card: 1, text: 'For the QR idea, let’s test a few conversation prompts with the people here. We can see which ones help a conversation get started.' },
]
export function BrainyWorkspacePreview({ time = 0, cycleDuration = 24 }) {
  const turnLength = cycleDuration / coverTurns.length
  const phase = ((time % cycleDuration) + cycleDuration) % cycleDuration
  const index = Math.floor(phase / turnLength)
  const current = coverTurns[index]
  const leadIn = Array.from({ length: 8 }, (_, i) => {
    const turn = coverTurns[(index + i) % coverTurns.length]
    return [turn.name, turn.text]
  })
  const transcriptProps = {
    time: phase % turnLength,
    conversation: [{ ...current, at: 0, end: turnLength * .86 }],
    leadIn,
    continuous: true,
  }
  return <div className="brainy-workspace" aria-hidden="true"><WorkspaceView
    time={phase} waveTime={phase / cycleDuration * 16 * 1.6} defaultView
    focusCard={current.card} transcriptProps={transcriptProps} /></div>
}

// Full 1440 × 900 native viewport. An opaque wipe returns the conversation
// to its opening state without reversing the scroll or rebuilding the interface.
export function BrainyWorkspaceScene({ time = 0 }) {
  const phase = ((time % duration) + duration) % duration
  const reset = progress(phase, 15.2, duration)
  return <div className="brainy-workspace" aria-hidden="true">
    <WorkspaceView time={Math.min(phase, 15.2)} waveTime={phase} />
    {reset > 0 && <div className="brainy-workspace__reset" style={{ clipPath: `inset(0 ${(1 - reset) * 100}% 0 0)` }}><WorkspaceView time={0} waveTime={phase} /></div>}
  </div>
}

export default function BrainyWorkspace() {
  return <MotionCanvas className="brainy-cover--workspace" width={1440} height={900} duration={duration} stillTime={11.5}
    label="A live brainy storm conversation: cards scroll left, a new idea appears, and the transcript and listening waveform stay active.">
    {({ time }) => <BrainyWorkspaceScene time={time} />}
  </MotionCanvas>
}
