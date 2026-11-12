import projectOne from './content/project-one.json'
import projectTwo from './content/project-two.json'
import projectThree from './content/project-three.json'
import projectFour from './content/project-four.json'

// EDIT THIS FILE to fill in your portfolio. Image paths resolve from public/.
// Empty image paths show a correctly sized placeholder; use your own assets.
export const profile = {
  name: 'Leonarda Lovrić',
  headline: 'Thinking in systems & designing for people.',
  introduction: 'Product designer with a CS background, connecting people, technology, and considered experiences.',
  update: 'Currently putting together my selected work',
  location: 'Zurich', timeZone: 'Europe/Zurich',
  email: 'Leonarda.lovric@zhdk.ch', // Your email enables the copy-email interaction.
  resume: '/assets/Leonarda_Lovric_CV.pdf',
  socials: [{ label: 'LinkedIn', url: '' }, { label: 'GitHub', url: '' }, { label: 'X (Twitter)', url: '' }],
  about: 'Introduce yourself here. Share what draws you to design, how your background shapes your approach, and the kinds of problems you enjoy working on.',
}


// Each project has its own editable content file.
export const projects = [projectThree, projectOne, projectTwo, projectFour]

export const experiments = [
  {
    slug: 'professor-feathers',
    title: 'Educational voice-based toy / Concept 2026',
    cardTitle: 'Educational voice-based toy',
    cardStatus: 'Concept 2026',
    cover: '/assets/professor-feathers/preview.jpg',
    coverVideo: '/assets/professor-feathers/preview.mp4',
    coverAlt: 'Professor Feathers educational voice-based toy demonstration',
    video: '/assets/professor-feathers/Professor Feathers.mp4',
    width: 1920,
    height: 1080,
  },
  {
    slug: 'reticulations',
    title: 'On-brand halftone effects for photos and videos / Shipped 2026',
    cardTitle: 'On-brand halftone effects for photos and videos',
    cardStatus: 'Shipped 2026',
    cover: '/assets/reticulations/preview.jpg',
    coverVideo: '/assets/reticulations/preview.mp4',
    coverAlt: 'Reticulations halftone tool demonstration for on-brand photos and videos',
    video: '/assets/reticulations/reticulations_short.mp4',
    width: 1920,
    height: 1080,
  },
]
