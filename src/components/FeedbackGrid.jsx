import { useId } from 'react'
import './FeedbackGrid.css'

function FeedbackCard({ item, featured = false }) {
  return <blockquote className={`feedback-card${featured ? ' feedback-card--featured' : ''}`}>
    
    <p>“{item.quote}”</p>
    <cite>{item.attribution} · Exit survey</cite>
  </blockquote>
}

export default function FeedbackGrid({ block }) {
  const titleId = useId()
  const featuredIndex = block.items.findIndex(item => item.featured)
  return <div className="participant-feedback">
    {block.title && <div className="feedback-heading"><h3 id={titleId}>{block.title}</h3></div>}
    <p className="feedback-note">{block.note}</p>
    <div className="feedback-grid">
      {featuredIndex !== -1 && <FeedbackCard item={block.items[featuredIndex]} featured />}
      {block.items.map((item, index) => index === featuredIndex ? null : <FeedbackCard key={index} item={item} />)}
    </div>
  </div>
}
