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
  email: '', // Your email enables the copy-email interaction.
  resume: '', // e.g. /assets/Leonarda_Lovric_CV.pdf
  socials: [{ label: 'LinkedIn', url: '' }, { label: 'Github', url: '' }, { label: 'X (Twitter)', url: '' }],
  about: 'Introduce yourself here. Share what draws you to design, how your background shapes your approach, and the kinds of problems you enjoy working on.',
}


// Each project has its own editable content file.
export const projects = [projectOne, projectTwo, projectThree, projectFour]
