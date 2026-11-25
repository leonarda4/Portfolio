// Keep focus in place for navigation and dialog restoration, but distinguish
// pointer interactions from keyboard navigation when drawing control outlines.
const root = document.documentElement
const pointer = () => { root.dataset.inputModality = 'pointer' }
const keyboard = event => {
  // Safari can use Option+Tab when full keyboard access is disabled.
  if ((event.metaKey || event.ctrlKey || event.altKey) && event.key !== 'Tab') return
  if (['Shift', 'Meta', 'Control', 'Alt'].includes(event.key)) return
  root.dataset.inputModality = 'keyboard'
}

document.addEventListener('pointerdown', pointer, { capture: true, passive: true })
document.addEventListener('wheel', pointer, { capture: true, passive: true })
document.addEventListener('keydown', keyboard, true)

if (import.meta.hot) import.meta.hot.dispose(() => {
  document.removeEventListener('pointerdown', pointer, true)
  document.removeEventListener('wheel', pointer, true)
  document.removeEventListener('keydown', keyboard, true)
})
