import { createHash, randomUUID, timingSafeEqual } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const colors = new Set(['Yellow', 'Peach', 'Pink', 'Lilac', 'Blue', 'Mint'])
const validPage = page => typeof page === 'string' && /^(\/|\/about|\/project\/[a-z0-9-]{1,80})$/.test(page)
const validId = id => typeof id === 'string' && /^[a-f0-9-]{36}$/i.test(id)
const error = (status, message) => Object.assign(new Error(message), { status })
const publicNote = ({ editHash, ...note }) => note
function keyHash(key) {
  if (!validId(key)) throw error(403, 'This note is not editable in this visit.')
  return createHash('sha256').update(key).digest('hex')
}
function authorize(note, key) {
  const supplied = keyHash(key)
  if (!note.editHash || !timingSafeEqual(Buffer.from(note.editHash, 'hex'), Buffer.from(supplied, 'hex'))) throw error(403, 'This note is not editable in this visit.')
}

export function validateSticker(input) {
  if (!input || typeof input !== 'object' || !validId(input.id) || !validPage(input.page)) throw error(400, 'Invalid sticker or page.')
  if (typeof input.text !== 'string' || !input.text.trim() || input.text.length > 280) throw error(400, 'Write a note of up to 280 characters.')
  if (!colors.has(input.color)) throw error(400, 'Choose a sticker color.')
  const p = input.placement
  if (!p || typeof p.anchor !== 'string' || !/^(page|intro|case-cover|about-page|footer|id:[a-z0-9-]{1,100}|project:#\/project\/[a-z0-9-]{1,80})$/.test(p.anchor)) throw error(400, 'Invalid sticker position.')
  if (!Number.isFinite(p.x) || p.x < 0 || p.x > 1 || !Number.isFinite(p.y) || p.y < 0 || p.y > (p.anchor === 'page' ? 500000 : 1)) throw error(400, 'Invalid sticker position.')
  return { id: input.id, page: input.page, text: input.text.trim(), color: input.color, placement: { anchor: p.anchor, x: p.x, y: p.y } }
}

export function createStickerStore(file = resolve(process.env.STICKER_DATA_FILE || '.data/stickers.json')) {
  let queue = Promise.resolve()
  async function read() {
    try {
      const data = JSON.parse(await readFile(file, 'utf8'))
      if (!Array.isArray(data)) throw new Error('Sticker data must be an array.')
      return data
    } catch (cause) { if (cause.code === 'ENOENT') return []; throw cause }
  }
  async function write(notes) {
    await mkdir(dirname(file), { recursive: true })
    const temporary = `${file}.${randomUUID()}.tmp`
    await writeFile(temporary, `${JSON.stringify(notes, null, 2)}\n`, { mode: 0o600 })
    await rename(temporary, file)
  }
  function transaction(work) {
    const operation = queue.then(work)
    queue = operation.catch(() => {})
    return operation
  }
  return {
    async list(page) { await queue; return (await read()).filter(note => note.page === page).map(publicNote) },
    add(input, key) {
      const sticker = validateSticker(input)
      const editHash = keyHash(key)
      return transaction(async () => {
        const notes = await read()
        const existing = notes.find(note => note.id === sticker.id)
        if (existing) {
          authorize(existing, key)
          return publicNote(existing)
        }
        if (notes.filter(note => note.page === sticker.page).length >= 2000) throw error(409, 'This page’s sticker board is full. Thank you for visiting!')
        const saved = { ...sticker, createdAt: new Date().toISOString(), editHash }
        await write([...notes, saved])
        return publicNote(saved)
      })
    },
    update(id, input, key) {
      const sticker = validateSticker(input)
      if (sticker.id !== id) throw error(400, 'Invalid note.')
      return transaction(async () => {
        const notes = await read()
        const index = notes.findIndex(note => note.id === id)
        if (index === -1) throw error(404, 'Note not found.')
        authorize(notes[index], key)
        if (notes[index].page !== sticker.page) throw error(400, 'Keep the note on its original page.')
        notes[index] = { ...notes[index], ...sticker }
        await write(notes)
        return publicNote(notes[index])
      })
    },
    remove(id, key) {
      return transaction(async () => {
        const notes = await read()
        const existing = notes.find(note => note.id === id)
        if (!existing) return
        authorize(existing, key)
        await write(notes.filter(note => note.id !== id))
      })
    },
  }
}

export function createStickerHandler({ store = createStickerStore(), limit = 30 } = {}) {
  const writes = new Map()
  return async (request, response, next) => {
    const url = new URL(request.url, 'http://localhost')
    const item = url.pathname.match(/^\/api\/stickers\/([a-f0-9-]{36})$/i)
    if (url.pathname !== '/api/stickers' && !item) { if (next) return next(); response.writeHead(404).end(); return }
    const send = (status, data) => { response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); response.end(JSON.stringify(data)) }
    try {
      if (request.method === 'GET' && !item) {
        const page = url.searchParams.get('page')
        if (!validPage(page)) throw error(400, 'Invalid page.')
        send(200, { stickers: await store.list(page) })
        return
      }
      if (item ? !['PATCH', 'DELETE'].includes(request.method) : request.method !== 'POST') { response.setHeader('Allow', item ? 'PATCH, DELETE' : 'GET, POST'); throw error(405, 'Method not supported.') }
      if (!request.headers['content-type']?.startsWith('application/json')) throw error(415, 'Send a JSON sticker.')
      if (request.headers.origin && new URL(request.headers.origin).host !== request.headers.host) throw error(403, 'Post stickers from this website.')
      const now = Date.now()
      for (const [key, value] of writes) if (value.expires <= now) writes.delete(key)
      const address = request.socket.remoteAddress
      const bucket = writes.get(address) || { count: 0, expires: now + 3600000 }
      if (request.method === 'POST' && bucket.count >= limit) { response.setHeader('Retry-After', String(Math.ceil((bucket.expires - now) / 1000))); throw error(429, 'Please try again in a little while.') }
      const key = request.headers['x-sticker-key']
      if (request.method === 'DELETE') { await store.remove(item[1], key); send(200, { deleted: true }); return }
      let body = ''
      for await (const chunk of request) {
        body += chunk
        if (Buffer.byteLength(body) > 4096) throw error(413, 'That note is too long.')
      }
      let input
      try { input = JSON.parse(body) } catch { throw error(400, 'Invalid sticker data.') }
      const sticker = item ? await store.update(item[1], input, key) : await store.add(input, key)
      if (!item) { bucket.count += 1; writes.set(address, bucket) }
      send(item ? 200 : 201, { sticker })
    } catch (cause) {
      if (!cause.status) console.error('Sticker storage error:', cause.message)
      send(cause.status || 503, { error: cause.status ? cause.message : 'The sticker board is unavailable. Your draft is still here—please try again.' })
    }
  }
}
