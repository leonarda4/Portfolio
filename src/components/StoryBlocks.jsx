import './StoryBlocks.css'

export function StoryCover({ items, brief }) {
  return <div className="story-cover">
    <span className="story-label">Ecosystem cover · Visual to add</span>
    <div className="story-cover__frames">{items.map(item => <div key={item}><span aria-hidden="true">＋</span><span>{item}</span></div>)}</div>
    <p>{brief}</p>
  </div>
}

export default function StoryBlocks({ block }) {
  if (block.type === 'storyTimeline') return <figure className="story-timeline" aria-label={block.label}>
    <ol>{block.items.map(item => <li key={item.dateTime}>
      <time dateTime={item.dateTime}>{item.date}</time>
      <span className="story-timeline__rail" aria-hidden="true"><i /></span>
      <div className="story-timeline__content"><h3>{item.title}</h3><p>{item.body}</p></div>
    </li>)}</ol>
  </figure>
  if (block.type === 'storyFlow') return <figure className="story-flow" aria-label={block.label}>
    <ol style={{ '--story-steps': block.items.length }}>
      {block.items.map((item, index) => <li key={item.title}>
        <div className={`story-flow__node${item.logo ? ' story-flow__node--branded' : ''}`}>
          {item.logo && <img className="story-flow__logo" src={item.logo} alt="" width="32" height="32" />}
          <div><h3>{item.title}</h3><p>{item.body}</p></div>
        </div>
        {index < block.items.length - 1 && <span className="story-flow__connector" aria-hidden="true">{block.connector || '→'}</span>}
      </li>)}
    </ol>
  </figure>
  if (block.type === 'storyCallout') return <aside className="story-callout">
    {block.title && <h3>{block.title}</h3>}
    <p>{block.body}</p>
  </aside>
  if (block.type === 'storyCards') return <div className="story-cards">
    {block.items.map(item => <div className="story-card" key={item.title}>
      <h3>{item.title}</h3><p>{item.body}</p>
    </div>)}
  </div>
  return null
}
