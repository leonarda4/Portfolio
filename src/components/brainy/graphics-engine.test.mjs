import test from 'node:test'
import assert from 'node:assert/strict'
import { recipes, palettes, drawRecipe } from './graphics-engine.js'
import { initialGraphic, updateGraphic } from './graphics-state.js'
const all = recipes()
test('all original and curated recipes render with both slider extremes and every palette', () => {
 assert.equal(all.length, 42)
 assert.equal(all.filter(recipe => recipe.type === 'original').length, 15)
 for (const recipe of all) for (const scale of [.9, 1.2]) for (const spacing of [.9, 1.2]) for (const colors of palettes) {
  const settings = { ...initialGraphic(recipe).settings, scale, spacing }
  const svg = drawRecipe(recipe, settings, colors)
  assert.doesNotMatch(svg, /NaN|undefined|Infinity|<script/)
  assert.match(svg, /viewBox="0 0 800 450"/)
  assert.ok(svg.includes(`fill="${colors.background}"`))
 }
 for (const recipe of all) {
  const animated = drawRecipe(recipe, initialGraphic(recipe).settings, recipe.palette, true)
  assert.doesNotMatch(animated, /NaN|undefined|Infinity/)
  assert.match(animated, /class="recipe-motion rm-/)
  assert.match(animated, /@keyframes/)
 }
})
test('edits stay with each recipe and color changes preserve geometry', () => {
 const a = all[2], b = all[3]
 let edits = updateGraphic({}, a, { settings: { scale: 1.12, spacing: 1.18 } })
 edits = updateGraphic(edits, a, { colors: palettes[0] })
 edits = updateGraphic(edits, a, { colors: { accent: '#F9A3EF' } })
 const retained = edits[a.id]
 edits = updateGraphic(edits, b, { settings: { scale: .92 } })
 assert.equal(edits[a.id], retained)
 assert.equal(retained.settings.scale, 1.12); assert.equal(retained.settings.spacing, 1.18)
 assert.equal(retained.colors.background, palettes[0].background); assert.equal(retained.colors.accent, '#F9A3EF')
 assert.equal(edits[b.id].settings.scale, .92)
 assert.notEqual(drawRecipe(a, retained.settings, retained.colors), drawRecipe(a))
})
