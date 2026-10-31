const EDIT_KEY = 'portfolio-sticker-edit-keys'
const VISIBILITY_KEY = 'portfolio-show-other-stickers'
const memoryKeys = {}

export function editKeys() {
  try { return { ...JSON.parse(sessionStorage.getItem(EDIT_KEY) || '{}'), ...memoryKeys } }
  catch { return { ...memoryKeys } }
}

export function createEditKey(id) {
  memoryKeys[id] = crypto.randomUUID()
  try { sessionStorage.setItem(EDIT_KEY, JSON.stringify(editKeys())) } catch { /* This visit still works without storage. */ }
}

export function getShowOthers() {
  try { return localStorage.getItem(VISIBILITY_KEY) === 'true' } catch { return false }
}

export function saveShowOthers(value) {
  try { localStorage.setItem(VISIBILITY_KEY, String(value)) } catch { /* Preference stays in memory. */ }
}

async function request(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'Couldn’t save your note. Please try again.')
  return data
}

export const readStickers = (page, signal) => request(`/api/stickers?page=${encodeURIComponent(page)}`, { signal })
export const saveSticker = (note, exists) => request(`/api/stickers${exists ? `/${note.id}` : ''}`, { method: exists ? 'PATCH' : 'POST', keepalive: true, headers: { 'X-Sticker-Key': editKeys()[note.id] }, body: JSON.stringify(note) })
export const deleteSticker = id => request(`/api/stickers/${id}`, { method: 'DELETE', keepalive: true, headers: { 'X-Sticker-Key': editKeys()[id] } })
