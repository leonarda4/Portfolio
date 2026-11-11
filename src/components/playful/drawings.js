import { DRAWING_COLORS } from './brush.js'
import { aboutDrawingIds } from '../../content/about-collage.js'
import { themeDrawingIds } from '../../content/theme-art.js'

const permanentDrawingIds = new Set([...aboutDrawingIds, ...themeDrawingIds])

const cacheKey = page => `portfolio-shared-drawings:${page}`
const boards = new Map()
const validStroke = stroke => stroke && typeof stroke.id === 'string' && !permanentDrawingIds.has(stroke.id) && typeof stroke.path === 'string' && DRAWING_COLORS.includes(stroke.color) && stroke.placement?.width > 0

async function request(url, options = {}) {
  const body = options.body
  const response = await fetch(url, {
    ...options,
    // Large paths use an ordinary request; the saved outbox survives reloads.
    keepalive: !body || new Blob([body]).size < 60000,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Couldn’t save your drawing. Please try again.')
  return data
}

function readCache(page) {
  try {
    const value = JSON.parse(sessionStorage.getItem(cacheKey(page)) || '{}')
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  } catch { return {} }
}
function storeCache(page, value) {
  try { sessionStorage.setItem(cacheKey(page), JSON.stringify(value)); return true } catch { return false }
}

// One queue per page also survives React unmounts during case-study navigation.
export function createDrawingBoard(page, { cached = {}, send = request, cache = value => storeCache(page, value), makeKey = () => crypto.randomUUID() } = {}) {
  const keys = { ...cached.keys }
  const records = new Map((Array.isArray(cached.records) ? cached.records : []).filter(validStroke).map(stroke => [stroke.id, stroke]))
  const pending = new Map((Array.isArray(cached.pending) ? cached.pending : []).filter(entry => Array.isArray(entry) && entry.length === 2 && !permanentDrawingIds.has(entry[0]) && keys[entry[0]] && (entry[1]?.action === 'delete' || (entry[1]?.action === 'save' && validStroke(entry[1].stroke)))))
  const listeners = new Set()
  let revision = 0
  let running = null
  let loading = false
  let failure = null
  let imported = false
  let snapshot

  function publish() {
    snapshot = { strokes: [...records.values()], error: failure }
    cache({ keys, records: snapshot.strokes.filter(stroke => keys[stroke.id]), pending: [...pending] })
    for (const listener of listeners) listener()
  }
  publish()

  async function flush() {
    if (running) return running
    running = (async () => {
      while (pending.size) {
        const [id, change] = pending.entries().next().value
        try {
          const data = await send(`/api/drawings${change.action === 'delete' ? `/${id}` : ''}`, {
            method: change.action === 'delete' ? 'DELETE' : 'POST',
            headers: { 'X-Drawing-Key': keys[id] },
            ...(change.action === 'save' ? { body: JSON.stringify(change.stroke) } : {}),
          })
          // Undo or clear may replace this save while its request is in flight.
          if (pending.get(id) === change) {
            pending.delete(id)
            if (change.action === 'save') records.set(id, data.drawing)
          }
          revision += 1
          failure = null
          publish()
        } catch (cause) {
          // If a save was undone while failing, continue with its deletion.
          if (pending.get(id) !== change) continue
          failure = cause.message || 'Couldn’t save your drawing. Please try again.'
          publish()
          break
        }
      }
    })()
    try { await running } finally { running = null }
  }

  async function load() {
    if (loading) return
    loading = true
    const version = revision
    try {
      const data = await send(`/api/drawings?page=${encodeURIComponent(page)}`)
      if (version !== revision) return
      const merged = new Map(data.drawings.filter(validStroke).map(stroke => [stroke.id, stroke]))
      for (const [id, change] of pending) {
        if (change.action === 'save') merged.set(id, change.stroke)
        else merged.delete(id)
      }
      records.clear()
      for (const [id, stroke] of merged) records.set(id, stroke)
      publish()
    } catch { /* Saving reports failures; an unavailable read leaves the local draft intact. */ }
    finally { loading = false }
  }

  function add(stroke) {
    if (records.has(stroke.id) || permanentDrawingIds.has(stroke.id)) return
    keys[stroke.id] ||= makeKey()
    const saved = { ...stroke, page }
    records.set(saved.id, saved)
    pending.set(saved.id, { action: 'save', stroke: saved })
    revision += 1
    publish()
    return flush()
  }

  function remove(ids) {
    for (const id of ids) {
      if (!keys[id]) continue
      records.delete(id)
      pending.set(id, { action: 'delete' })
    }
    revision += 1
    publish()
    return flush()
  }

  return {
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener) },
    getSnapshot: () => snapshot,
    isOwn: id => Boolean(keys[id]),
    load,
    add,
    undo() { const own = [...records.keys()].filter(id => keys[id]); return remove(own.slice(-1)) },
    clear() { return remove([...records.keys()].filter(id => keys[id])) },
    async retry() { failure = null; publish(); await flush(); await load() },
    importLegacy(width) {
      if (imported) return
      imported = true
      try {
        const key = `portfolio-drawings:${page}`
        const legacy = JSON.parse(sessionStorage.getItem(key) || '[]')
        if (!Array.isArray(legacy)) return
        for (const stroke of legacy) {
          if (typeof stroke.id !== 'string' || typeof stroke.path !== 'string' || !DRAWING_COLORS.includes(stroke.color)) continue
          add({ ...stroke, placement: { anchor: 'page', x: 0, y: 0, width, fallbackX: 0, fallbackY: 0 } })
        }
        // Retain the old copy if the browser cannot store the new outbox.
        if (cache({ keys, records: [...records.values()].filter(stroke => keys[stroke.id]), pending: [...pending] })) sessionStorage.removeItem(key)
      } catch { /* Existing drawings remain available if browser storage is blocked. */ }
    },
  }
}

export function drawingBoard(page) {
  if (!boards.has(page)) boards.set(page, createDrawingBoard(page, { cached: readCache(page) }))
  return boards.get(page)
}
