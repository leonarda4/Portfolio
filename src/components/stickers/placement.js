import { SUPPORTING_PALETTE } from '../../../design-system/playful-palette.js'

export const STICKER_SIZE = 184
export const COLORS = SUPPORTING_PALETTE.map(({ name, note, fold }) => ({ name, value: note, back: fold }))

const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max))
const anchorSelector = '.study-section, .project-card, .intro, .case-cover, .about-page, .footer'
// Protect access to navigation and contact actions, not interactive artwork.
const obstacleSelector = '.layout-nav-item:not([aria-disabled]), .sidebar-back, .theme-toggle, .theme-menu, .playful-dock, .playful-settings, .playful-drawing-actions, .playful-options, .study-end a, .study-end button, .footer-socials a[href], .contact-note button, .about-content .text-link, .project-card .card-copy, .sticker-save-error, .skip-link, [data-sticker-obstacle]'

function obstacleBox(element) {
  const box = element.getBoundingClientRect()
  let { left, right, top, bottom } = box
  // Link elements fill their grid column. Reserve their labels, not that empty space.
  if (element.matches('.layout-nav-item, .project-card .card-copy')) {
    const range = document.createRange()
    range.selectNodeContents(element)
    const label = range.getBoundingClientRect()
    left = Math.max(left, label.left - (element.matches('.layout-nav-item') ? 24 : 0))
    right = Math.min(right, label.right)
  }
  for (const parent of [element.closest('.layout-nav'), element.closest('.study-nav')]) {
    if (!parent) continue
    const style = getComputedStyle(parent)
    const clip = parent.getBoundingClientRect()
    if (/auto|scroll|hidden|clip/.test(style.overflowX)) { left = Math.max(left, clip.left); right = Math.min(right, clip.right) }
    if (/auto|scroll|hidden|clip/.test(style.overflowY)) { top = Math.max(top, clip.top); bottom = Math.min(bottom, clip.bottom) }
  }
  return { left, right, top, bottom, width: right - left, height: bottom - top }
}

function anchorKey(element) {
  if (element.id) return `id:${element.id}`
  if (element.matches('.project-card')) return `project:${element.getAttribute('href')}`
  return ['intro', 'case-cover', 'about-page', 'footer'].find(name => element.classList.contains(name))
}

export function anchorAt(x, y) {
  const element = [...document.querySelectorAll(anchorSelector)].find(element => {
    const box = element.getBoundingClientRect()
    return y >= box.top && y <= box.bottom && x >= box.left && x <= box.right
  })
  return element ? { anchor: anchorKey(element), box: element.getBoundingClientRect() } : null
}

export function boxForAnchor(key) {
  return [...document.querySelectorAll(anchorSelector)].find(element => anchorKey(element) === key)?.getBoundingClientRect()
}

export function placementAt(left, top) {
  const x = left + STICKER_SIZE / 2
  const y = top + STICKER_SIZE / 2
  const match = anchorAt(x, y)
  if (!match) return { anchor: 'page', x: x / window.innerWidth, y: y + window.scrollY }
  const { anchor, box } = match
  return { anchor, x: clamp((x - box.left) / box.width, 0, 1), y: clamp((y - box.top) / box.height, 0, 1) }
}

export function positionOf(placement) {
  const box = boxForAnchor(placement.anchor)
  const x = box ? box.left + box.width * placement.x : window.innerWidth * placement.x
  const y = box ? box.top + box.height * placement.y : placement.y - window.scrollY
  return { left: clamp(x - STICKER_SIZE / 2, 8, window.innerWidth - STICKER_SIZE - 8), top: y - STICKER_SIZE / 2 }
}

export function clampDrop(left, top, { width = STICKER_SIZE, height = STICKER_SIZE } = {}) {
  return {
    left: clamp(left, 8, window.innerWidth - width - 8),
    top: clamp(top, 8, window.innerHeight - height - 8),
  }
}

export function safeDrop(left, top, { width = STICKER_SIZE, height = STICKER_SIZE } = {}) {
  const size = { width, height }
  const point = clampDrop(left, top, size)
  const gap = 8
  const obstacles = [...document.querySelectorAll(obstacleSelector)]
    .filter(element => element.getClientRects().length && getComputedStyle(element).visibility !== 'hidden')
    .map(obstacleBox)
    .filter(box => box.width > 0 && box.height > 0 && box.right > 0 && box.left < window.innerWidth && box.bottom > 0 && box.top < window.innerHeight)
  const overlap = ({ left, top }) => obstacles.reduce((area, box) => area
    + Math.max(0, Math.min(left + width, box.right + gap) - Math.max(left, box.left - gap))
    * Math.max(0, Math.min(top + height, box.bottom + gap) - Math.max(top, box.top - gap)), 0)
  if (!overlap(point)) return point

  // The closest free position lies at the requested coordinate or an obstacle edge.
  const xs = new Set([point.left])
  const ys = new Set([point.top])
  for (const box of obstacles) {
    xs.add(clampDrop(box.left - width - gap, point.top, size).left)
    xs.add(clampDrop(box.right + gap, point.top, size).left)
    ys.add(clampDrop(point.left, box.top - height - gap, size).top)
    ys.add(clampDrop(point.left, box.bottom + gap, size).top)
  }
  let closest = point
  let leastOverlap = overlap(point)
  let shortestDistance = Infinity
  for (const x of xs) for (const y of ys) {
    const candidate = { left: x, top: y }
    const area = overlap(candidate)
    const distance = (x - point.left) ** 2 + (y - point.top) ** 2
    if (area < leastOverlap || (area === leastOverlap && distance < shortestDistance)) {
      closest = candidate
      leastOverlap = area
      shortestDistance = distance
    }
  }
  return closest
}
