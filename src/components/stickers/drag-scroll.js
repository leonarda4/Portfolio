// Keep a held note under the pointer while the page scrolls, including at its edges.
export function createDragScroller(onScroll) {
  let pointer
  let frame
  let previousTime
  const edge = 48
  function tick(time) {
    const elapsed = Math.min(time - (previousTime ?? time), 32)
    previousTime = time
    if (pointer) {
      const distance = pointer.y < edge ? pointer.y - edge
        : pointer.y > window.innerHeight - edge ? pointer.y - window.innerHeight + edge : 0
      if (distance) window.scrollBy(0, Math.max(-1, Math.min(1, distance / edge)) * elapsed * .7)
    }
    frame = requestAnimationFrame(tick)
  }
  window.addEventListener('scroll', onScroll)
  frame = requestAnimationFrame(tick)
  return {
    update(x, y) { pointer = { x, y } },
    stop() { cancelAnimationFrame(frame); window.removeEventListener('scroll', onScroll) },
  }
}
