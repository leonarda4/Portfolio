import { DRAWING_COLORS, nextDrawingColor } from './brush.js'

let state = { active: false, color: nextDrawingColor(), colorMode: 'random' }
const listeners = new Set()
function update(patch) {
  state = { ...state, ...patch }
  listeners.forEach(listener => listener())
}
export const subscribeDrawingTool = listener => { listeners.add(listener); return () => listeners.delete(listener) }
export const getDrawingTool = () => state
export function setDrawingActive(value) { update({ active: typeof value === 'function' ? value(state.active) : value }) }
export function selectCrayon(color) { if (DRAWING_COLORS.includes(color)) update({ color, active: true, colorMode: 'fixed' }) }
export function advanceCrayon() { if (state.colorMode === 'random') update({ color: nextDrawingColor(state.color) }) }
