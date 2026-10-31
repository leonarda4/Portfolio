import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer } from 'node:http'
import { randomUUID } from 'node:crypto'
import { createStickerHandler, createStickerStore, validateSticker } from './stickers.js'

const note = overrides => ({ id: randomUUID(), page: '/', text: 'Hello from a visitor', color: 'Yellow', placement: { anchor: 'intro', x: .5, y: .5 }, ...overrides })
const key = randomUUID()

test('concurrent visitors persist without losing notes; retries do not duplicate; pages stay separate', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'portfolio-stickers-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const file = join(directory, 'notes.json')
  const store = createStickerStore(file)
  const notes = Array.from({ length: 20 }, () => note())
  await Promise.all(notes.map(value => store.add(value, key)))
  await store.add(notes[0], key)
  await store.add(note({ page: '/about' }), key)
  assert.equal((await store.list('/')).length, 20)
  assert.equal((await createStickerStore(file).list('/about')).length, 1)
  assert.equal(JSON.parse(await readFile(file, 'utf8')).length, 21)
  await assert.rejects(store.add(notes[0], randomUUID()), { status: 403 })
  await writeFile(file, '{corrupt')
  await assert.rejects(store.add(note(), key))
  assert.equal(await readFile(file, 'utf8'), '{corrupt')
})

test('rejects invalid content and placements instead of writing them', () => {
  for (const invalid of [note({ text: ' ' }), note({ text: 'x'.repeat(281) }), note({ color: 'red' }), note({ page: '/private' }), note({ placement: { anchor: 'intro', x: Infinity, y: 0 } }), note({ placement: { anchor: 'intro', x: .5, y: 2 } })]) {
    assert.throws(() => validateSticker(invalid), { status: 400 })
  }
  assert.equal(validateSticker(note({ text: '  hello  ' })).text, 'hello')
})

test('visitors share notes, can edit their own, and cannot change someone else’s', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'portfolio-stickers-api-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const server = createServer(createStickerHandler({ store: createStickerStore(join(directory, 'notes.json')), limit: 2 }))
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  t.after(() => new Promise(resolve => server.close(resolve)))
  const base = `http://127.0.0.1:${server.address().port}/api/stickers`
  const post = (value, headers = {}) => fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Sticker-Key': key, ...headers }, body: JSON.stringify(value) })
  assert.equal((await post(note(), { Origin: 'https://other.example' })).status, 403)
  const first = await post(note())
  assert.equal(first.status, 201)
  const saved = (await first.json()).sticker
  const secondVisitor = await fetch(`${base}?page=/`)
  assert.equal((await secondVisitor.json()).stickers[0].id, saved.id)
  assert.equal('editHash' in saved, false)
  const update = (value, editKey) => fetch(`${base}/${saved.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'X-Sticker-Key': editKey }, body: JSON.stringify(value) })
  assert.equal((await update({ ...saved, text: 'A changed thought', color: 'Mint' }, randomUUID())).status, 403)
  assert.equal((await update({ ...saved, text: 'A changed thought', color: 'Mint' }, key)).status, 200)
  const remove = editKey => fetch(`${base}/${saved.id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'X-Sticker-Key': editKey } })
  assert.equal((await remove(randomUUID())).status, 403)
  assert.equal((await remove(key)).status, 200)
  assert.equal((await (await fetch(`${base}?page=/`)).json()).stickers.length, 0)
  assert.equal((await fetch(base, { method: 'DELETE' })).status, 405)
  assert.equal((await post(note())).status, 201)
  assert.equal((await post(note())).status, 429)
})
