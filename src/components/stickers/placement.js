export const STICKER_SIZE = 184
export const COLORS = [
  { name: 'Yellow', value: '#fff08a', back: '#e9cf57' },
  { name: 'Peach', value: '#ffcbb4', back: '#e3a087' },
  { name: 'Pink', value: '#f6c6df', back: '#d89ebc' },
  { name: 'Lilac', value: '#d9ccfa', back: '#b6a0e0' },
  { name: 'Blue', value: '#c5e5fa', back: '#96c2e0' },
  { name: 'Mint', value: '#d1eab9', back: '#a7c986' },
]

const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max))
const anchorSelector = '.study-section, .project-card, .intro, .case-cover, .about-page, .footer'

function anchorKey(element) {
  if (element.id) return `id:${element.id}`
  if (element.matches('.project-card')) return `project:${element.getAttribute('href')}`
  return ['intro', 'case-cover', 'about-page', 'footer'].find(name => element.classList.contains(name))
}

export function placementAt(left, top) {
  const x = left + STICKER_SIZE / 2
  const y = top + STICKER_SIZE / 2
  const anchors = [...document.querySelectorAll(anchorSelector)]
  const element = anchors.find(element => {
    const box = element.getBoundingClientRect()
    return y >= box.top && y <= box.bottom && x >= box.left && x <= box.right
  }) || anchors.find(element => {
    const box = element.getBoundingClientRect()
    return y >= box.top && y <= box.bottom
  })
  if (!element) return { anchor: 'page', x: x / window.innerWidth, y: y + window.scrollY }
  const box = element.getBoundingClientRect()
  return { anchor: anchorKey(element), x: clamp((x - box.left) / box.width, 0, 1), y: clamp((y - box.top) / box.height, 0, 1) }
}

export function positionOf(placement) {
  const anchor = [...document.querySelectorAll(anchorSelector)].find(element => anchorKey(element) === placement.anchor)
  const box = anchor?.getBoundingClientRect()
  const x = box ? box.left + box.width * placement.x : window.innerWidth * placement.x
  const y = box ? box.top + box.height * placement.y : placement.y - window.scrollY
  return { left: clamp(x - STICKER_SIZE / 2, 8, window.innerWidth - STICKER_SIZE - 8), top: y - STICKER_SIZE / 2 }
}

export function clampDrop(left, top) {
  return {
    left: clamp(left, 8, window.innerWidth - STICKER_SIZE - 8),
    top: clamp(top, 70, window.innerHeight - STICKER_SIZE - 12),
  }
}
