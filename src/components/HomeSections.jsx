import { useLayoutEffect, useRef, useState } from 'react'
import { experiments } from '../portfolioData'
import { aboutNotes } from '../content/about-collage'
import { trailSegments } from '../content/about-artwork'
import { SUPPORTING_PALETTE } from '../../design-system/playful-palette'
import AboutNote from './AboutNote'
import AboutCrayons from './AboutCrayons'
import ResponsiveImage from './ResponsiveImage'
import './AboutCollage.css'

export function PlaySection({ renderCard }) {
  const readyExperiments = experiments.filter(experiment => (experiment.cover || experiment.coverVideo) && experiment.title)
  return <section id="play" className="home-section home-play" aria-labelledby="play-heading">
    <header className="home-section-heading"><h2 id="play-heading" className="accent-type">side quests</h2></header>
    {readyExperiments.length > 0 && <div className="project-grid experiment-grid">{readyExperiments.map(renderCard)}</div>}
  </section>
}

export function AboutSection() {
  return <section id="about" className="home-section home-about" aria-labelledby="about-heading">
    <div className="about-collage">
      <div className="about-canvas">
      <header className="home-section-heading"><h2 id="about-heading" className="accent-type">About me</h2></header>
      <ResponsiveImage className="about-portrait" src="/assets/portrait.jpg" sizes="(max-width: 760px) 80vw, 500px" alt="Leonarda" loading="lazy" />
      <p id="about-note-move-help" className="about-note-move-help">Drag to move this note, or use the arrow keys. Hold Shift for larger steps. Press Home to restore its original position. The text and color stay fixed.</p>
      <ol className="about-notes" aria-label="My path into design">
        {aboutNotes.map(note => <li key={note.id} className={`about-note about-note--${note.key}`} style={{ '--note-x': `${note.x}px`, '--note-y': `${note.y}px`, '--note-color': SUPPORTING_PALETTE.find(color => color.name === note.color).note }}>
          <AboutNote>{note.text}</AboutNote>
        </li>)}
      </ol>
      <div className="about-drawing about-drawing--loop-arrow" aria-hidden="true"><div className="about-arrow-art"><img src="/assets/about/figma/f096b.svg" alt="" /></div></div>
      <div className="about-drawing about-drawing--trail" aria-hidden="true"><div className="about-trail-art">
        {trailSegments.map(([asset, x, y]) => <img key={asset} src={`/assets/about/figma/${asset}.svg`} alt="" style={{ left: x, top: y }} />)}
      </div></div>
      </div>
    </div>
  </section>
}

export function AboutContactSection({ children }) {
  const container = useRef(null)
  const [width, setWidth] = useState(1056)
  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(container.current)
    setWidth(container.current.clientWidth)
    return () => observer.disconnect()
  }, [])
  const layout = width >= 900 ? 'collage' : width >= 640 ? 'tablet' : 'mobile'
  return <div ref={container} className="home-personal" data-layout={layout} style={{ '--about-scale': width / 1056 }}>
    <AboutSection />
    <AboutCrayons group="about" />
    {children}
    <AboutCrayons group="contact" />
  </div>
}
