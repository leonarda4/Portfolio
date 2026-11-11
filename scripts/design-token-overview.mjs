import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import postcss from 'postcss'
import { SUPPORTING_PALETTE } from '../design-system/playful-palette.js'

// The live portfolio and this reference share one source. Project styles are excluded.
const css = await fs.readFile('design-system/portfolio.css', 'utf8')
const base = {}, dark = {}, compact = {}
postcss.parse(css).walkDecls(d => {
  if (!d.prop.startsWith('--')) return
  let responsive = false
  for (let p = d.parent; p; p = p.parent) if (p.type === 'atrule' && p.name === 'media') responsive = true
  const values = responsive ? compact : d.parent.selector.includes("data-theme='dark'") ? dark : base
  values[d.prop] = d.value
})
const colors = [
  ['canvas', 'Canvas', 'Page, menus and floating navigation'],
  ['surface', 'Surface', 'Grouped content and footer'],
  ['border', 'Divider', 'Quiet separators, not interactive boundaries'],
  ['text', 'Primary text', 'Headings, body and active controls'],
  ['muted', 'Secondary text', 'Captions and supporting information'],
  ['accent', 'Accent', 'Crayon blue for homepage accent text, links and keyboard focus'],
]
const type = [
  ['title', 'Page title', 'Homepage and case-study title', 'Selected design work'],
  ['section', 'Section heading', 'Major sections within a page', 'Research and direction'],
  ['card', 'Card / subsection', 'Project cards and nested sections', 'Movement feedback'],
  ['body', 'Body text', 'Descriptions and case-study paragraphs', 'A shared visual language for clear, consistent experiences.'],
  ['small', 'Supporting text', 'Navigation, metadata and captions', 'Interaction design · Research · Prototyping'],
  ['label', 'Label', 'Short tags and field labels', 'PROJECT TYPE'],
]
// Guard against the original failures: duplicate colors, colliding hierarchy and fractional metrics.
for (const values of [base, { ...base, ...dark }]) {
  const palette = colors.map(([name]) => values[`--color-${name}`])
  assert.equal(new Set(palette).size, colors.length, 'Each color role must have a unique value')
}
for (const values of [base, { ...base, ...compact }]) {
  const sizes = type.map(([name]) => parseInt(values[`--type-${name}-size`]))
  assert(sizes.every((v, i) => i === 0 || sizes[i - 1] > v), 'Typography roles must remain distinct')
  for (const [name] of type) for (const metric of ['size', 'line']) assert.match(values[`--type-${name}-${metric}`], /^\d+px$/)
}
const echo = JSON.parse(await fs.readFile('src/content/project-one.json', 'utf8'))
const brainy = JSON.parse(await fs.readFile('src/content/project-two.json', 'utf8'))
assert.equal(echo.accent, SUPPORTING_PALETTE.find(color => color.name === 'Yellow').note, 'Echo must use sticky-note yellow')
for (const values of [base, { ...base, ...dark }]) assert.equal(values['--color-accent'], SUPPORTING_PALETTE.find(color => color.name === 'Blue').crayon, 'The portfolio accent must use crayon blue')
const data = { base, dark, compact, colors, type, supporting: SUPPORTING_PALETTE, projectColors: [
  ['Echo accent', echo.accent],
  ['Echo artwork tint', echo.tint],
  ['brainy storm project accent', brainy.accent],
] }
const previewOverrides = Object.entries(compact).map(([key, value]) => `${key}:${value};`).join('')
const desktopOverrides = Object.keys(compact).map(key => `${key}:${base[key]};`).join('')
const previewCSS = `\n:root[data-preview-size='mobile']{${previewOverrides}}\n:root[data-preview-size='desktop']{${desktopOverrides}}`
const template = await fs.readFile('scripts/design-token-template.html', 'utf8')
await fs.writeFile('public/design-tokens.html', template
  .replace('/* PORTFOLIO_TOKENS */', css + '\n' + await fs.readFile('design-system/range.css', 'utf8') + previewCSS)
  .replace('/* TOKEN_DATA */', JSON.stringify(data).replaceAll('<', '\\u003c')))
console.log('Built live foundation reference: six unique colors per theme; six distinct type roles with whole-pixel metrics.')
