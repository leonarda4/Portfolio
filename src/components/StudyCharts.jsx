import { useId } from 'react'
import './StudyCharts.css'

const tones = ['var(--chart-ink)', 'var(--chart-muted)', 'var(--chart-light)']
function Ring({ items, total, children }) {
  let offset = 0
  return <div className="chart-ring"><svg viewBox="0 0 120 120" aria-hidden="true">
    <circle cx="60" cy="60" r="52" fill="none" stroke="var(--chart-grid)" strokeWidth="4" />
    {items.map((item, i) => {
      const length = item.value / total * 100
      const start = offset
      offset += length
      return <circle key={item.label} cx="60" cy="60" r="52" fill="none" stroke={tones[i % tones.length]} strokeWidth="4" pathLength="100" strokeDasharray={`${length} ${100 - length}`} strokeDashoffset={-start} transform="rotate(-90 60 60)" />
    })}
  </svg><div className="chart-ring-value">{children}</div></div>
}

function ParticipantCounts({ items }) {
  return <dl className="participant-counts">{items.map(item => <div key={item.label}>
    <dt>{item.label}</dt>
    <dd><span className="participant-dot-row" aria-hidden="true">{Array.from({ length: 10 }, (_, index) => <i key={index} className={index < item.value ? 'is-filled' : ''} />)}</span><span className="chart-number">{item.value}<small>/10</small><span className="comparison-sr"> participants</span></span></dd>
  </div>)}</dl>
}

export function ParticipantCountChart({ block }) {
  const title = useId()
  return <figure className="study-chart participant-charts" aria-labelledby={title}>
    <header className="comparison-header"><h3 id={title}>{block.title}</h3><span className="chart-note">10 participants</span></header>
    <ParticipantCounts items={block.items} />
    <figcaption>{block.caption}</figcaption>
  </figure>
}

export function ParticipantCharts({ block }) {
  const title = useId()
  const frequency = block.groups[2]
  return <figure className="study-chart participant-charts" aria-labelledby={title}>
    <header className="comparison-header"><h3 id={title}>{block.title}</h3><span className="chart-note">10 participants</span></header>
    <div className="participant-breakdowns">{block.groups.slice(0, 2).map(group => <div className="participant-breakdown" key={group.title}>
      <h4>{group.title}</h4>
      <ParticipantCounts items={group.items} />
    </div>)}</div>
    <div className="activity-distribution">
      <h4>Dance & expressive movement</h4>
      <p className="chart-description">How often participants reported taking part in dance, performance, or other expressive movement.</p>
      <div className="activity-axis-labels"><span>Participants</span></div>
      <div className="activity-columns">{frequency.items.map((item, index) => <div className="activity-column" key={item.label} aria-label={`${item.label}: ${item.value} participants`}>
        <span className="chart-number" aria-hidden="true">{item.value}</span>
        <div className="activity-dots" aria-hidden="true">{Array.from({ length: item.value }, (_, i) => <i key={i} />)}</div>
        <span className="activity-rating" aria-hidden="true">{index + 1}{item.endpoint && <span className="activity-endpoint">{item.endpoint}</span>}</span>
      </div>)}</div>
    </div>
    <figcaption>Each dot represents one participant · n = 10.</figcaption>
  </figure>
}

export function RecognitionChart({ block }) {
  const title = useId()
  return <figure className="study-chart recognition-chart" aria-labelledby={title}>
    <header className="comparison-header"><h3 id={title}>{block.title}</h3><span className="chart-note">Recognized / 10 participants</span></header>
    <div className="recognition-rings">{block.items.map(item => <div className="recognition-item" key={item.label}>
      <Ring items={[item]} total={10}><span className="chart-number">{item.value}<small>/10</small></span></Ring>
      <h4>{item.label}</h4>
    </div>)}</div>
    <figcaption>{block.caption}</figcaption>
  </figure>
}
