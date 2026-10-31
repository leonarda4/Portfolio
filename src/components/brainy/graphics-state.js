import { DEFAULTS, constrainWorkbench } from './graphics-engine.js'
export function initialGraphic(recipe) {
  return { settings: constrainWorkbench({ ...DEFAULTS, body: recipe.body || DEFAULTS.body }), colors: { ...recipe.palette } }
}
export function updateGraphic(edits, recipe, change) {
  const current = edits[recipe.id] || initialGraphic(recipe)
  return { ...edits, [recipe.id]: {
    settings: constrainWorkbench({ ...current.settings, ...change.settings }),
    colors: { ...current.colors, ...change.colors },
  } }
}
