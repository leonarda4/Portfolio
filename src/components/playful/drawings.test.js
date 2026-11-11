import test from 'node:test'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { createDrawingBoard } from './drawings.js'
import { aboutDrawingIds } from '../../content/about-collage.js'
import { themeDrawingIds } from '../../content/theme-art.js'

const stroke = () => ({ id: randomUUID(), color: '#6487ff', path: 'M 0 0 Q 3 4 6 0 Z', placement: { anchor: 'page', x: .3, y: 200, width: 1200, fallbackX: .3, fallbackY: 200 } })
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no }); return { promise, resolve, reject } }
const copy = value => JSON.parse(JSON.stringify(value))

for (const [name, ids] of [['About', aboutDrawingIds], ['navigation', themeDrawingIds]]) {
test(`permanent ${name} artwork stays outside visitor drawing controls and cached requests`, async () => {
  const permanent = [...ids].map(id => ({ ...stroke(), id }))
  const visitor = stroke()
  const writes = []
  const board = createDrawingBoard('/', {
    cached: {
      keys: Object.fromEntries([...permanent, visitor].map(item => [item.id, randomUUID()])),
      records: [...permanent, visitor],
      pending: permanent.map(item => [item.id, { action: 'delete' }]),
    },
    cache: () => true,
    send: async (url, options) => {
      if (!options) return { drawings: [...permanent, visitor] }
      writes.push(url)
      return { deleted: true }
    },
  })
  assert.deepEqual(board.getSnapshot().strokes.map(item => item.id), [visitor.id])
  await board.retry()
  for (const item of permanent) await board.add(item)
  await board.clear()
  assert.deepEqual(writes, [`/api/drawings/${visitor.id}`])
})
}

test('undo during a save removes the stroke on the server after the save completes', async () => {
  const saving = deferred(), requests = []
  const board = createDrawingBoard('/', { cache: () => true, send: async (url, options) => {
    requests.push(options.method)
    if (options.method === 'POST') { await saving.promise; return { drawing: JSON.parse(options.body) } }
    return { deleted: true }
  } })
  const first = board.add(stroke())
  board.undo()
  assert.equal(board.getSnapshot().strokes.length, 0)
  saving.resolve()
  await first
  assert.deepEqual(requests, ['POST', 'DELETE'])
  assert.equal(board.getSnapshot().strokes.length, 0)
})

test('an interrupted save survives reload and retries with the same ID and editing key', async () => {
  let cached
  const sent = []
  const board = createDrawingBoard('/', { cache: value => { cached = copy(value); return true }, send: async (url, options) => { sent.push(options); throw new Error('Offline. Please retry.') } })
  const original = stroke()
  await board.add(original)
  assert.equal(board.getSnapshot().strokes.length, 1)
  assert.match(board.getSnapshot().error, /Offline/)
  const saved = { ...original, page: '/' }
  const restored = createDrawingBoard('/', { cached, cache: () => true, send: async (url, options) => {
    if (!options) return { drawings: [saved] }
    sent.push(options); return { drawing: JSON.parse(options.body) }
  } })
  await restored.retry()
  assert.equal(sent[0].headers['X-Drawing-Key'], sent[1].headers['X-Drawing-Key'])
  assert.equal(JSON.parse(sent[1].body).id, original.id)
  assert.equal(restored.getSnapshot().strokes.length, 1)
  assert.equal(restored.getSnapshot().error, null)
})

test('clear deletes only this visitor’s drawings and stale reads cannot restore them', async () => {
  const own = stroke(), other = stroke(), delayed = deferred()
  let reads = 0
  const deleted = []
  const board = createDrawingBoard('/', { cached: { keys: { [own.id]: randomUUID() }, records: [own] }, cache: () => true, send: async (url, options) => {
    if (options) { deleted.push(url); return { deleted: true } }
    if (++reads === 1) return { drawings: [own, other] }
    return delayed.promise
  } })
  await board.load()
  const stale = board.load()
  await board.clear()
  delayed.resolve({ drawings: [own, other] })
  await stale
  assert.deepEqual(deleted, [`/api/drawings/${own.id}`])
  assert.deepEqual(board.getSnapshot().strokes.map(value => value.id), [other.id])
  assert.equal(board.isOwn(other.id), false)
})

test('failed deletion stays hidden through refresh and can be retried after reload', async () => {
  const own = stroke()
  let cached
  const board = createDrawingBoard('/', { cached: { keys: { [own.id]: randomUUID() }, records: [own] }, cache: value => { cached = copy(value); return true }, send: async (url, options) => {
    if (options) throw new Error('Offline')
    return { drawings: [own] }
  } })
  await board.clear()
  await board.load()
  assert.equal(board.getSnapshot().strokes.length, 0)
  const restored = createDrawingBoard('/', { cached, cache: () => true, send: async (url, options) => options ? { deleted: true } : { drawings: [] } })
  await restored.retry()
  assert.equal(restored.getSnapshot().error, null)
  assert.equal(restored.getSnapshot().strokes.length, 0)
})

test('existing tab-local paths are imported once without changing their geometry', async t => {
  const legacy = { id: randomUUID(), color: '#6487ff', path: 'M 100 100 Q 120 130 140 100 Z' }
  const storage = new Map([['portfolio-drawings:/', JSON.stringify([legacy])]])
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage')
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: { getItem: key => storage.get(key), removeItem: key => storage.delete(key) } })
  t.after(() => previous ? Object.defineProperty(globalThis, 'sessionStorage', previous) : delete globalThis.sessionStorage)
  const posted = []
  const board = createDrawingBoard('/', { cache: () => true, send: async (url, options) => {
    if (!options) return { drawings: posted }
    const drawing = JSON.parse(options.body); posted.push(drawing); return { drawing }
  } })
  board.importLegacy(1200)
  board.importLegacy(1200)
  await board.retry()
  assert.equal(posted.length, 1)
  assert.equal(posted[0].path, legacy.path)
  assert.deepEqual(posted[0].placement, { anchor: 'page', x: 0, y: 0, width: 1200, fallbackX: 0, fallbackY: 0 })
  assert.equal(storage.has('portfolio-drawings:/'), false)
})
