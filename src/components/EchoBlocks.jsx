import { lazy, Suspense } from 'react'
const Graphic = lazy(() => import('./EchoGraphic'))
import './EchoBlocks.css'
import { ParticipantCharts, ParticipantCountChart, RecognitionChart } from './StudyCharts'

export function Sources({ items = [] }) {
  return items.length ? <div className="study-sources">{items.map(item => <a key={item.url} href={item.url} target="_blank" rel="noreferrer">{item.label} ↗</a>)}</div> : null
}
export default function EchoBlocks({ block }) {
  if (block.type === 'graphic') {
    return <figure className="echo-graphic"><Suspense fallback={<p>Loading diagram…</p>}><Graphic id={block.id} /></Suspense>{block.caption && <figcaption>{block.caption}</figcaption>}</figure>
  }
  if (block.type === 'pending') return <aside className="echo-pending"><span>Coming later</span><h3>{block.title}</h3><p>{block.body}</p></aside>
  if (block.type === 'questions') return <ol className="echo-questions">{block.items.map((question, i) => <li key={question}><span>0{i + 1}</span><h3>{question}</h3></li>)}</ol>
  if (block.type === 'studyFlow') return <div className="echo-flow text-block"><h3>{block.title}</h3><ol>{block.items.map((item, i) => <li key={item.title}><span className="echo-step">0{i + 1}</span><h4>{item.title}</h4><p>{item.body}</p></li>)}</ol></div>
  if (block.type === 'demographics') return <ParticipantCharts block={block} />
  if (block.type === 'participantCounts') return <ParticipantCountChart block={block} />
  if (block.type === 'recognition') return <RecognitionChart block={block} />
  if (block.type === 'visualPlaceholder') return <figure className="echo-visual-placeholder" aria-label={`${block.title}: visual to be added`}>
    <div className="echo-visual-placeholder__frames">{block.items.map(label => <div key={label}><span aria-hidden="true">＋</span><span>{label}</span></div>)}</div>
    <figcaption>{block.caption}</figcaption>
  </figure>
  return null
}
