import test from 'node:test'
import assert from 'node:assert/strict'
import { createMotionStore, storageKey } from './motion-store.js'
const memory = () => { const data = new Map(); return { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) } }
test('each agent keeps an independent recipe and reload restores all edits', () => {
 const storage = memory(), store = createMotionStore(storage, () => 10)
 const memo = store.getSnapshot().Memo
 store.update('Finn', { body: 'bounce', energy: 1.5, eyes: 'scan' })
 store.update('Brainy', { speed: 1.7, expression: .5 })
 assert.equal(store.getSnapshot().Memo, memo)
 assert.equal(store.getSnapshot().Finn.body, 'bounce')
 const restored = createMotionStore(storage, () => 20).getSnapshot()
 assert.equal(restored.Finn.eyes, 'scan'); assert.equal(restored.Finn.energy, 1.5)
 assert.equal(restored.Brainy.speed, 1.7); assert.equal(restored.Brainy.expression, .5)
 assert.equal(restored.Memo.body, 'memo'); assert.equal(restored.Finn.startedAt, 20)
})
test('bad stored values fall back safely and storage failures do not lose current edits', () => {
 const storage = memory()
 storage.setItem(storageKey, JSON.stringify({ version: 1, recipes: { Memo: { body: 'bad', eyes: 'bad', speed: 99, energy: -5, expression: null } } }))
 const store = createMotionStore(storage, () => 1)
 assert.equal(store.getSnapshot().Memo.body, 'memo'); assert.equal(store.getSnapshot().Memo.speed, 2)
 assert.equal(store.getSnapshot().Memo.energy, .25); assert.equal(store.getSnapshot().Memo.expression, 1)
 storage.setItem = () => { throw Error('blocked') }
 store.update('Memo', { body: 'spin' }); assert.equal(store.getSnapshot().Memo.loop, false)
 assert.equal(store.getSnapshot().Memo.duration, .9)
 store.update('Memo', { body: 'float' }); assert.equal(store.getSnapshot().Memo.loop, true)
})
test('tempo edits preserve motion phase and only a new movement restarts that agent', () => {
 let now = 10
 const store = createMotionStore(memory(), () => now)
 now = 12
 store.update('Memo', { speed: 2 })
 assert.equal((now - store.getSnapshot().Memo.startedAt) * 2, 2)
 store.update('Finn', { body: 'float' })
 assert.equal(store.getSnapshot().Finn.startedAt, 12)
 assert.equal(store.getSnapshot().Memo.startedAt, 11)
})
