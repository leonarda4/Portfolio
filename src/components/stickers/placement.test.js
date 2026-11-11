import test from 'node:test'
import assert from 'node:assert/strict'
import { clampDrop, placementAt, positionOf, safeDrop, STICKER_SIZE } from './placement.js'

const rect = (left, top, width, height) => ({ left, top, width, height, right: left + width, bottom: top + height })

function element(selectors, box, options = {}) {
  const names = Array.isArray(selectors) ? selectors : [selectors]
  const node = {
    id: options.id || '',
    box,
    label: options.label,
    style: { visibility: 'visible', overflowX: 'visible', overflowY: 'visible', ...options.style },
    matches(selector) {
      return selector.split(',').some(value => {
        const candidate = value.trim()
        if (candidate === '.layout-nav-item:not([aria-disabled])') return names.includes('.layout-nav-item') && !options.disabled
        return names.includes(candidate)
      })
    },
    classList: { contains: name => names.includes(`.${name}`) },
    getAttribute: name => options.attributes?.[name] ?? null,
    closest: selector => options.parents?.[selector] || null,
    getBoundingClientRect() {
      const value = typeof node.box === 'function' ? node.box() : node.box
      return options.documentCoordinates ? rect(value.left - window.scrollX, value.top - window.scrollY, value.width, value.height) : value
    },
    getClientRects() { return options.rendered === false ? [] : [node.getBoundingClientRect()] },
  }
  return node
}

function browser(t, { width = 1440, height = 900, scrollY = 0, elements = [] } = {}) {
  const globals = {
    window: { innerWidth: width, innerHeight: height, scrollX: 0, scrollY },
    document: {
      querySelectorAll: selector => elements.filter(node => node.matches(selector)),
      createRange() {
        let selected
        return {
          selectNodeContents(node) { selected = node },
          getBoundingClientRect() { return selected.label || selected.getBoundingClientRect() },
        }
      },
    },
    getComputedStyle: node => node.style,
  }
  for (const [name, value] of Object.entries(globals)) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, name)
    Object.defineProperty(globalThis, name, { value, configurable: true, writable: true })
    t.after(() => previous ? Object.defineProperty(globalThis, name, previous) : delete globalThis[name])
  }
  return globals.window
}

function assertPoint(actual, expected) {
  assert.ok(Math.abs(actual.left - expected.left) < 1e-9, `left: expected ${expected.left}, got ${actual.left}`)
  assert.ok(Math.abs(actual.top - expected.top) < 1e-9, `top: expected ${expected.top}, got ${actual.top}`)
}

function assertInsideViewport(point) {
  assert.ok(point.left >= 8 && point.top >= 8)
  assert.ok(point.left + STICKER_SIZE <= window.innerWidth - 8)
  assert.ok(point.top + STICKER_SIZE <= window.innerHeight - 8)
}

function assertClearOf(point, box) {
  const separated = point.left + STICKER_SIZE <= box.left - 8
    || point.left >= box.right + 8
    || point.top + STICKER_SIZE <= box.top - 8
    || point.top >= box.bottom + 8
  assert.ok(separated, `note at ${JSON.stringify(point)} overlaps ${JSON.stringify(box)}`)
}

test('notes dropped in either page margin keep their exact position and scroll with the document', t => {
  const section = element('.study-section', rect(400, 800, 640, 1000), { id: 'research', documentCoordinates: true })
  const viewport = browser(t, { scrollY: 800, elements: [section] })
  for (const left of [48, 1192]) {
    viewport.scrollY = 800
    const placement = placementAt(left, 200)
    assert.equal(placement.anchor, 'page', 'a note beside a section must not snap into that section')
    assertPoint(positionOf(placement), { left, top: 200 })
    viewport.scrollY = 1050
    assertPoint(positionOf(placement), { left, top: -50 })
    assert.equal(positionOf(placement).top + viewport.scrollY, 1000)
  }
})

test('notes over content retain section and project anchors through scrolling', t => {
  const section = element('.study-section', rect(300, 1000, 700, 600), { id: 'research', documentCoordinates: true })
  const project = element('.project-card', rect(300, 1800, 700, 400), { attributes: { href: '#/project/echo' }, documentCoordinates: true })
  const viewport = browser(t, { scrollY: 800, elements: [section, project] })
  const placement = placementAt(350, 250)
  assert.equal(placement.anchor, 'id:research')
  assertPoint(positionOf(placement), { left: 350, top: 250 })
  viewport.scrollY = 1100
  assertPoint(positionOf(placement), { left: 350, top: -50 })

  viewport.scrollY = 1600
  const cardPlacement = placementAt(350, 250)
  assert.equal(cardPlacement.anchor, 'project:#/project/echo')
  assertPoint(positionOf(cardPlacement), { left: 350, top: 250 })
})

test('drop bounds allow the top margin and keep the whole note inside desktop and narrow viewports', t => {
  const viewport = browser(t)
  for (const [width, height] of [[1440, 900], [390, 844], [320, 568]]) {
    viewport.innerWidth = width
    viewport.innerHeight = height
    assertPoint(clampDrop(-100, -100), { left: 8, top: 8 })
    assertPoint(clampDrop(9999, 9999), { left: width - STICKER_SIZE - 8, top: height - STICKER_SIZE - 8 })
    assertPoint(safeDrop(24, 8), { left: 24, top: 8 })
    assertInsideViewport(safeDrop(9999, 9999))
  }
})

test('navigation reserves its text and marker while leaving the empty sidebar available', t => {
  const sidebar = element('.layout-sidebar', rect(48, 32, 300, 600))
  const nav = element('.layout-nav', rect(48, 32, 300, 200))
  const link = element(['.layout-nav-item', 'a'], rect(48, 32, 300, 40), {
    label: rect(72, 42, 48, 20), parents: { '.layout-nav': nav },
  })
  browser(t, { elements: [sidebar, nav, link] })
  assertPoint(safeDrop(132, 32), { left: 132, top: 32 })
  const protectedDrop = safeDrop(48, 32)
  assertClearOf(protectedDrop, rect(48, 32, 72, 40))
  assertInsideViewport(protectedDrop)
})

test('the closest clear location beside a toolbar is chosen without moving into another control', t => {
  const menu = element('.theme-menu', rect(48, 360, 200, 180))
  const dock = element('.playful-dock', rect(48, 480, 188, 68))
  browser(t, { elements: [menu, dock] })
  const result = safeDrop(60, 410)
  assertPoint(result, { left: 60, top: 556 })
  assertClearOf(result, menu.box)
  assertClearOf(result, dock.box)
  assertInsideViewport(result)
})

test('narrow layouts keep navigation and overlapping tool controls accessible', t => {
  const nav = element('.layout-nav', rect(24, 24, 342, 40), { style: { overflowX: 'auto' } })
  const home = element('.layout-nav-item', rect(24, 24, 110, 40), { label: rect(48, 34, 58, 20), parents: { '.layout-nav': nav } })
  const work = element('.layout-nav-item', rect(134, 24, 110, 40), { label: rect(158, 34, 58, 20), parents: { '.layout-nav': nav } })
  const menu = element('.playful-options', rect(24, 600, 220, 180))
  const dock = element('.playful-dock', rect(24, 760, 188, 68))
  browser(t, { width: 390, height: 844, elements: [nav, home, work, menu, dock] })
  const nearNav = safeDrop(24, 8)
  assertPoint(nearNav, { left: 24, top: 72 })
  const nearTools = safeDrop(24, 650)
  assertPoint(nearTools, { left: 24, top: 408 })
  for (const result of [nearNav, nearTools]) {
    assertInsideViewport(result)
    for (const box of [rect(24, 24, 82, 40), rect(134, 24, 82, 40), menu.box, dock.box]) assertClearOf(result, box)
  }
})

test('hidden, unrendered, offscreen, and disabled controls do not displace notes', t => {
  const elements = [
    element('.theme-menu', rect(80, 80, 260, 260), { style: { visibility: 'hidden' } }),
    element('.playful-options', rect(80, 80, 260, 260), { rendered: false }),
    element('.skip-link', rect(48, -80, 160, 40)),
    element('[data-sticker-obstacle]', rect(1500, 80, 160, 40)),
    element('.layout-nav-item', rect(80, 80, 260, 40), { disabled: true }),
  ]
  browser(t, { elements })
  assertPoint(safeDrop(100, 100), { left: 100, top: 100 })
})

test('navigation labels clipped by horizontal or vertical scrolling are not obstacles', t => {
  const horizontalNav = element('.layout-nav', rect(48, 24, 200, 40), { style: { overflowX: 'auto' } })
  const hiddenHorizontal = element('.layout-nav-item', rect(300, 24, 160, 40), {
    label: rect(324, 34, 80, 20), parents: { '.layout-nav': horizontalNav },
  })
  const studyNav = element('.study-nav', rect(48, 32, 200, 200), { style: { overflowY: 'auto' } })
  const hiddenVertical = element('.layout-nav-item', rect(48, 280, 200, 40), {
    label: rect(72, 290, 100, 20), parents: { '.study-nav': studyNav },
  })
  browser(t, { elements: [horizontalNav, hiddenHorizontal, studyNav, hiddenVertical] })
  assertPoint(safeDrop(300, 24), { left: 300, top: 24 })
  assertPoint(safeDrop(48, 280), { left: 48, top: 280 })
})

test('interactive artwork and builder controls remain available for note placement', t => {
  const elements = [
    element(['.motion-builder button', 'button'], rect(100, 100, 200, 60)),
    element(['.graphics-builder input', 'input'], rect(100, 180, 200, 60)),
    element(['.soundscape-card button', 'button'], rect(100, 240, 200, 60)),
  ]
  browser(t, { elements })
  assertPoint(safeDrop(100, 100), { left: 100, top: 100 })
})

test('responsive About notes use their rendered size at viewport and navigation boundaries', t => {
  const nav = element('.layout-nav-item', rect(24, 24, 342, 40))
  const dock = element('.playful-dock', rect(24, 760, 248, 68))
  browser(t, { width: 390, height: 844, elements: [nav, dock] })
  const size = { width: 260, height: 230 }
  assertPoint(clampDrop(9999, 9999, size), { left: 122, top: 606 })
  assertPoint(safeDrop(24, 8, size), { left: 24, top: 72 })
  assertPoint(safeDrop(24, 650, size), { left: 24, top: 522 })
  assertPoint(safeDrop(100, 200, size), { left: 100, top: 200 })
})
