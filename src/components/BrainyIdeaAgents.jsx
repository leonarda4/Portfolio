import { useId } from 'react'
import MotionCanvas from './brainy/MotionCanvas'
import { WorkingAgent } from './brainy/WorkingAgent'
import content from './brainy/idea-agent-content.json'
import { ideaAgentFlight, IDEA_AGENT_FLIGHT_DURATION } from './brainy/idea-agent-flight'
import './BrainyCover.css'
import './BrainyIdeaAgents.css'

const agents = { prism: { index: 3, name: 'Prism' }, archie: { index: 4, name: 'Archie' }, scout: { index: 2, name: 'Scout' } }

function Agent({ agent }) {
  return <MotionCanvas className="idea-agent__character" width={1000} height={600} fill duration={IDEA_AGENT_FLIGHT_DURATION} label={`${agent.name} floating across the idea’s findings`}>
    {({ time, width, height }) => {
      const flight = ideaAgentFlight(time, agent.index)
      const { phase } = flight
      const size = 110
      return <WorkingAgent index={agent.index}
        x={width * .46 + (width * .46 - size) * Math.sin(phase)}
        y={height * .5 + (height * .5 - size) * Math.sin(phase * 2)}
        size={size} time={flight.time} emote={flight.emote} nametagSize={17} tempo={1} energy={1.5} eyeIntensity={1.35} />
    }}
  </MotionCanvas>
}

function Argument({ item, kind }) {
  return <div className="idea-agent__argument">
    <div className="idea-agent__meta"><span className={`idea-agent__tag idea-agent__tag--${kind === 'impact' ? (item.severity_or_impact === 'Medium' ? 'impact-medium' : 'impact') : item.severity_or_impact === 'High' ? 'risk' : 'medium'}`}>{item.severity_or_impact} {kind}</span><span>{item.category}</span></div>
    <p>{item.point}</p>
    <details className="idea-agent__source">
      <summary>Source{item.speaker ? ` · ${item.speaker}` : ''}</summary>
      {item.quote ? <blockquote><p>“{item.quote}”</p><cite>{item.speaker}</cite></blockquote> : <p className="idea-agent__context">{item.source_context}</p>}
    </details>
  </div>
}

function Tradeoffs() {
  const data = content.tradeoffs
  return <div className="idea-agent__output">
    <table className="idea-agent__table idea-agent__tradeoffs">
      <thead><tr><th scope="col">Pros</th><th scope="col">Cons</th></tr></thead>
      <tbody>{Array.from({ length: Math.max(data.pros.length, data.cons.length) }, (_, i) => <tr key={i}>
        <td>{data.pros[i] && <Argument item={data.pros[i]} index={i} kind="impact" />}</td>
        <td>{data.cons[i] && <Argument item={data.cons[i]} index={i} kind="risk" />}</td>
      </tr>)}</tbody>
    </table>
  </div>
}

// A simplified excerpt of the film's system map, preserving its node labels.
function ArchitectureMap({ compact = false }) {
  const id = useId()
  const nodes = compact ? [
    [110, 10, 'Web Client'], [110, 140, 'API Gateway'], [110, 270, 'Event Queue'],
    [10, 390, 'Brainy Agent', 'Worker'], [210, 390, 'Research Agent', 'Worker'],
    [10, 550, 'Vector', 'Database'], [210, 550, 'Relational', 'Database'], [210, 710, 'External Search', 'API'],
  ] : [
    [290, 15, 'Web Client'], [290, 125, 'API Gateway'], [290, 235, 'Event Queue'],
    [100, 345, 'Brainy Agent', 'Worker'], [480, 345, 'Research Agent', 'Worker'],
    [20, 470, 'Vector', 'Database'], [290, 470, 'Relational', 'Database'], [560, 470, 'External Search', 'API'],
  ]
  return <svg className={`idea-agent__map idea-agent__map--${compact ? 'compact' : 'wide'}`} viewBox={compact ? '0 0 410 800' : '0 0 760 560'} role="img" aria-label="Web Client connects to an API Gateway and Event Queue. Brainy Agent Worker uses a Vector Database and Relational Database. Research Agent Worker uses the Relational Database and External Search API.">
      <defs><marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10Z" fill="#777" /></marker></defs>
      <g fill="none" stroke="#777" strokeWidth="1.5" markerEnd={`url(#${id})`}>
        {compact ? <>
          <path d="M200 70V140"/><path d="M200 200V270"/>
          <path d="M200 330V360H100V390"/><path d="M200 330V360H300V390"/>
          <path d="M100 460V550"/><path d="M150 460C150 500 250 500 250 550"/>
          <path d="M300 460V550"/><path d="M390 425H402V680H300V710"/>
        </> : <><path d="M380 75V125"/><path d="M380 185V235"/>
        <path d="M380 295V320H190V345"/><path d="M380 295V320H570V345"/>
        <path d="M150 415V438H110V470"/><path d="M230 415C230 440 340 440 340 470"/>
        <path d="M530 415C530 440 420 440 420 470"/><path d="M610 415V438H650V470"/></>}
      </g>
      <g className="idea-agent__map-label">{compact ? <><rect x="121" y="92" width="158" height="24" fill="#f47aff"/><text x="200" y="110" textAnchor="middle">Stream audio/text</text><rect x="130" y="222" width="140" height="24" fill="#f47aff"/><text x="200" y="240" textAnchor="middle">Enqueue chunks</text></> : <><rect x="391" y="88" width="145" height="26" fill="#f47aff"/><text x="395" y="107">Stream audio/text</text><rect x="391" y="198" width="135" height="26" fill="#f47aff"/><text x="395" y="217">Enqueue chunks</text></>}</g>
      {nodes.map(([x,y,line,second])=><g key={line} className="idea-agent__node">
        {second === 'Database' ? <><path d={`M${x} ${y+12}V${y+58}C${x} ${y+77} ${x+180} ${y+77} ${x+180} ${y+58}V${y+12}Z`} /><ellipse cx={x+90} cy={y+12} rx="90" ry="12" /></> : <rect x={x} y={y} width="180" height={second?70:60} /> }
        <text x={x+90} y={y+(second === 'Database'?40:second?29:37)} textAnchor="middle">{line}{second&&<tspan x={x+90} dy={second === 'Database'?23:25}>{second}</tspan>}</text>
      </g>)}
    </svg>
}

function Architecture() {
  return <div className="idea-agent__output"><ArchitectureMap /><ArchitectureMap compact /></div>
}

function Research() {
  const data = content.research
  return <div className="idea-agent__output">
    <table className="idea-agent__table idea-agent__research">
      <thead><tr><th scope="col">Competitor</th><th scope="col">What they do</th><th scope="col">How we differ</th></tr></thead>
      <tbody>{data.competitors.map(item => <tr key={item.name}>
        <th scope="row">{item.name}</th><td data-label="What they do"><p>{item.idea}</p></td><td data-label="How we differ"><p>{item.howWeDiffer}</p></td>
      </tr>)}</tbody>
    </table>
    <div className="idea-agent__sources"><span>Sources</span>{data.groundingSources.map(url => <a key={url} href={url} target="_blank" rel="noreferrer">{new URL(url).hostname} ↗</a>)}</div>
  </div>
}

function CollaborationOverview() {
  return <figure className="idea-agent idea-agent--system" aria-label="How conversation becomes an enriched idea page">
    <ol className="idea-agent__flow">{[
      ['Conversation', 'The team talks'], ['Transcript', 'Speech becomes text'], ['Ideas', 'Related thoughts stay together'], ['Agent contributions', 'Summaries, trade-offs, architecture, workflows and research'], ['Updated idea pages', 'Findings return to the workspace'],
    ].map(([label,detail]) => <li key={label}><strong>{label}</strong><span>{detail}</span></li>)}</ol>
  </figure>
}

export default function BrainyIdeaAgents({ kind }) {
  if (kind === 'system') return <CollaborationOverview />
  const agent = agents[kind]
  if (!agent) return null
  return <figure className={`idea-agent idea-agent--${kind}`} aria-label={`${agent.name}: an example of work within an idea page`}>
    {kind === 'prism' ? <Tradeoffs /> : kind === 'archie' ? <Architecture /> : <Research />}
    <Agent agent={agent} />
  </figure>
}
