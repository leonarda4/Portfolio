import { experiments } from '../portfolioData'
import { aboutDrawings, aboutNotes } from '../content/about-collage'
import { SUPPORTING_PALETTE } from '../../design-system/playful-palette'
import AboutNote from './AboutNote'
import './AboutCollage.css'

export function PlaySection({ renderCard }) {
  const readyExperiments = experiments.filter(experiment => (experiment.cover || experiment.coverVideo) && experiment.title)
  return <section id="play" className="home-section home-play" aria-labelledby="play-heading">
    <header className="home-section-heading"><h2 id="play-heading" className="accent-type">playground</h2></header>
    {readyExperiments.length > 0 && <div className="project-grid experiment-grid">{readyExperiments.map(renderCard)}</div>}
  </section>
}

export function AboutSection() {
  return <section id="about" className="home-section home-about" aria-labelledby="about-heading">
    <div className="about-collage">
      <header className="home-section-heading"><h2 id="about-heading" className="accent-type">About me</h2></header>
      <img className="about-portrait" src="/assets/portrait.jpg" alt="Leonarda" width="3024" height="4032" loading="lazy" />
      <p id="about-note-move-help" className="about-note-move-help">Drag to move this note, or use the arrow keys. Hold Shift for larger steps. Press Home to restore its original position. The text and color stay fixed.</p>
      <ol className="about-notes" aria-label="My path into design">
        {aboutNotes.map(note => <li key={note.id} className={`about-note about-note--${note.key}`} style={{ '--note-x': `${note.x / 10.02}%`, '--note-y': `${note.y / 10.02}cqw`, '--note-color': SUPPORTING_PALETTE.find(color => color.name === note.color).note }}>
          <AboutNote>{note.text}</AboutNote>
        </li>)}
      </ol>
      {aboutDrawings.map(item => <img key={item.key} className={`about-drawing about-drawing--${item.key}`} src={item.src} alt="" aria-hidden="true" width={item.width} height={item.height} style={{ '--drawing-x': `${item.x / 10.02}%`, '--drawing-y': `${item.y / 10.02}cqw`, '--drawing-width': `${item.width / 10.02}%` }} />)}
    </div>
  </section>
}
