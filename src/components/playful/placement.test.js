import test from 'node:test'
import assert from 'node:assert/strict'
import { captureStroke, strokeTransform } from './placement.js'

function setup(t, anchored = true) {
  const viewport = { innerWidth: 1200, scrollX: 0, scrollY: 600 }
  const box = { left: 300, top: 800, width: 680, height: 1000 }
  const section = { id: 'research', getBoundingClientRect: () => ({ ...box, top: box.top - viewport.scrollY, right: box.left + box.width, bottom: box.top + box.height - viewport.scrollY }) }
  for (const [name, value] of Object.entries({ window: viewport, document: { querySelectorAll: () => anchored ? [section] : [] } })) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name)
    Object.defineProperty(globalThis, name, { value, configurable: true })
    t.after(() => previous ? Object.defineProperty(globalThis, name, previous) : delete globalThis[name])
  }
  return { viewport, box }
}

test('strokes stay at their original document position as the page scrolls', t => {
  const { viewport } = setup(t)
  const drawing = captureStroke([{ x: 400, y: 1000, pressure: .5 }, { x: 600, y: 1100, pressure: .5 }], 1)
  assert.equal(drawing.placement.anchor, 'id:research')
  assert.equal(strokeTransform(drawing.placement), 'translate(500 1050) scale(1)')
  viewport.scrollY = 950
  assert.equal(strokeTransform(drawing.placement), 'translate(500 1050) scale(1)')
})

test('responsive drawings follow their section with uniform scaling and keep the saved path', t => {
  const { viewport, box } = setup(t)
  const drawing = captureStroke([{ x: 400, y: 1000, pressure: .5 }, { x: 600, y: 1100, pressure: .5 }], 1)
  const original = drawing.path
  viewport.innerWidth = 388
  box.left = 24; box.width = 340; box.top = 1200; box.height = 1400
  assert.equal(strokeTransform(drawing.placement), 'translate(124 1550) scale(0.5)')
  assert.equal(drawing.path, original)
})

test('drawings in empty margins retain their page coordinates', t => {
  const { viewport } = setup(t, false)
  const drawing = captureStroke([{ x: 40, y: 1000, pressure: .5 }, { x: 60, y: 1100, pressure: .5 }], 1)
  assert.equal(drawing.placement.anchor, 'page')
  assert.equal(strokeTransform(drawing.placement), 'translate(50 1050) scale(1)')
  viewport.scrollY = 1000
  assert.equal(strokeTransform(drawing.placement), 'translate(50 1050) scale(1)')
})
