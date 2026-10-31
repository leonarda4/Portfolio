import { roster } from './assets.js'
import { bodies, eyes, personalities, normalizeRecipe } from './motions.js'

export const storageKey = 'portfolio-brainy-motion-v1'
const bounded = (value, min, max, fallback) => Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
export function defaultRecipe(name) {
  return { body: personalities[name].body, eyes: personalities[name].eyes, speed: 1, energy: 1, expression: 1, upright: false, loop: true, duration: 4.8 }
}
function validate(name, input = {}) {
  const base = defaultRecipe(name)
  return normalizeRecipe({ ...base,
    body: bodies.some(([key]) => key === input?.body) ? input.body : base.body,
    eyes: eyes.some(([key]) => key === input?.eyes) ? input.eyes : base.eyes,
    speed: bounded(input?.speed, .5, 2, 1), energy: bounded(input?.energy, .25, 1.5, 1),
    expression: bounded(input?.expression, .4, 1.35, 1),
  })
}
export function createMotionStore(storage, now = () => performance.now() / 1000) {
  let saved
  try { saved = JSON.parse(storage?.getItem(storageKey)) } catch { /* Optional browser storage. */ }
  let state = Object.fromEntries(roster.map(({ name }) => [name, { ...validate(name, saved?.version === 1 ? saved.recipes?.[name] : undefined), startedAt: now() }]))
  const listeners = new Set()
  return {
    getSnapshot: () => state,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener) },
    update(name, patch) {
      if (!Object.hasOwn(state, name)) return
      const old = state[name]
      const restart = patch.body !== undefined || patch.eyes !== undefined
      const recipe = validate(name, { ...old, ...patch })
      const moment = now()
      const startedAt = restart ? moment : patch.speed !== undefined ? moment - (moment - old.startedAt) * old.speed / recipe.speed : old.startedAt
      state = { ...state, [name]: { ...recipe, startedAt } }
      try { storage?.setItem(storageKey, JSON.stringify({ version: 1, recipes: state })) } catch { /* Edits still persist for this visit. */ }
      listeners.forEach(listener => listener())
    },
  }
}
let store
export function getMotionStore() {
  if (!store) {
    let storage
    try { storage = window.localStorage } catch { /* Storage may be disabled. */ }
    store = createMotionStore(storage)
  }
  return store
}
