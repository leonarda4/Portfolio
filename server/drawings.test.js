import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer } from 'node:http'
import { randomUUID } from 'node:crypto'
import { createDrawingHandler, createDrawingStore, validateDrawing } from './drawings.js'
import { melodramaPath } from '../src/components/playful/brush.js'
import { createDrawingBoard } from '../src/components/playful/drawings.js'

const stroke = overrides => ({
  id: randomUUID(), page: '/project/echo', color: '#6487ff',
  path: melodramaPath([{ x: -20, y: -5, pressure: .5 }, { x: 20, y: 5, pressure: .5 }], 1),
  placement: { anchor: 'id:research', x: .4, y: .3, width: 680, fallbackX: .6, fallbackY: 2400 },
  ...overrides,
})
const key = randomUUID()

test('drawings keep exact paths and positions after restart, concurrent writes, and retries', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'portfolio-drawings-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const file = join(directory, 'drawings.json')
  const store = createDrawingStore(file)
  const drawings = Array.from({ length: 20 }, () => stroke())
  await Promise.all(drawings.map(value => store.add(value, key)))
  await store.add(drawings[0], key)
  await store.add(stroke({ page: '/' }), key)
  const restarted = createDrawingStore(file)
  const saved = await restarted.list('/project/echo')
  assert.equal(saved.length, 20)
  assert.equal((await restarted.list('/')).length, 1)
  for (const original of drawings) {
    const found = saved.find(value => value.id === original.id)
    assert.deepEqual(found.placement, original.placement)
    assert.equal(found.path, original.path)
    assert.equal(found.color, original.color)
    assert.equal('editHash' in found, false)
  }
  await assert.rejects(store.add(drawings[0], randomUUID()), { status: 403 })
  await writeFile(file, '{corrupt')
  await assert.rejects(store.add(stroke(), key))
  assert.equal(await readFile(file, 'utf8'), '{corrupt')
})

test('drawing validation accepts brush paths and dots, and rejects unsafe or unbounded data', () => {
  const dot = stroke({ path: melodramaPath([{ x: 0, y: 0, pressure: .5 }]) })
  assert.equal(validateDrawing(dot).path, dot.path)
  for (const invalid of [
    stroke({ path: '<svg onload="alert(1)"></svg>' }), stroke({ path: 'M NaN 1 Z' }),
    stroke({ path: 'M 500001 0 Z' }), stroke({ path: 'M' + ' 0'.repeat(130000) + ' Z' }),
    stroke({ page: '/private' }), stroke({ color: 'url(https://example.com)' }),
    stroke({ placement: { anchor: 'id:research', x: .5, y: 2, width: 680, fallbackX: .5, fallbackY: 500 } }),
    stroke({ placement: { anchor: 'page', x: .5, y: 200, width: 0, fallbackX: .5, fallbackY: 200 } }),
  ]) assert.throws(() => validateDrawing(invalid), { status: 400 })
})

test('visitors can read shared drawings, but only their owner can undo or clear them', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'portfolio-drawings-api-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const server = createServer(createDrawingHandler({ store: createDrawingStore(join(directory, 'drawings.json')), limit: 2 }))
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  t.after(() => new Promise(resolve => server.close(resolve)))
  const base = `http://127.0.0.1:${server.address().port}/api/drawings`
  const post = (value, headers = {}) => fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Drawing-Key': key, ...headers }, body: JSON.stringify(value) })
  assert.equal((await post(stroke(), { Origin: 'https://other.example' })).status, 403)
  const first = await post(stroke())
  assert.equal(first.status, 201)
  const saved = (await first.json()).drawing
  assert.equal('editHash' in saved, false)
  assert.equal((await (await fetch(`${base}?page=/project/echo`)).json()).drawings[0].id, saved.id)
  const remove = editKey => fetch(`${base}/${saved.id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'X-Drawing-Key': editKey } })
  assert.equal((await remove(randomUUID())).status, 403)
  assert.equal((await remove(key)).status, 200)
  assert.equal((await remove(key)).status, 200, 'deletion retries are safe')
  assert.equal((await (await fetch(`${base}?page=/project/echo`)).json()).drawings.length, 0)
  assert.equal((await fetch(base, { method: 'DELETE' })).status, 405)
  assert.equal((await post(stroke())).status, 201)
  assert.equal((await post(stroke())).status, 429)
})

test('browser drawing queues round-trip through the real API across reload and a second visitor', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'portfolio-drawings-roundtrip-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const file = join(directory, 'drawings.json')
  const server = createServer(createDrawingHandler({ store: createDrawingStore(file) }))
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  t.after(() => new Promise(resolve => server.close(resolve)))
  const origin = `http://127.0.0.1:${server.address().port}`
  const send = async (url, options = {}) => {
    const response = await fetch(origin + url, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error)
    return data
  }
  let cached
  const visitor = createDrawingBoard('/project/echo', { send, cache: value => { cached = JSON.parse(JSON.stringify(value)); return true } })
  const original = stroke()
  await visitor.add(original)
  assert.equal(visitor.getSnapshot().error, null)
  const reloaded = createDrawingBoard('/project/echo', { cached, send, cache: () => true })
  await reloaded.retry()
  const other = createDrawingBoard('/project/echo', { send, cache: () => true })
  await other.load()
  assert.equal(reloaded.isOwn(original.id), true)
  assert.equal(other.isOwn(original.id), false)
  assert.deepEqual(other.getSnapshot().strokes[0].placement, original.placement)
  assert.equal(other.getSnapshot().strokes[0].path, original.path)
  await other.clear()
  assert.equal((await createDrawingStore(file).list('/project/echo')).length, 1)
  await reloaded.undo()
  await other.load()
  assert.equal(other.getSnapshot().strokes.length, 0)
})
