// Memory only: drawings survive route changes, but never leave this browser tab.
const boards = new Map()

export function localDrawingBoard(page) {
  if (!boards.has(page)) {
    let snapshot = { strokes: [], error: null }
    const listeners = new Set()
    const publish = strokes => {
      snapshot = { strokes, error: null }
      listeners.forEach(listener => listener())
    }
    boards.set(page, {
      subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener) },
      getSnapshot: () => snapshot,
      isOwn: id => snapshot.strokes.some(stroke => stroke.id === id),
      add(stroke) { publish([...snapshot.strokes, stroke]) },
      undo() { publish(snapshot.strokes.slice(0, -1)) },
      clear() { publish([]) },
    })
  }
  return boards.get(page)
}
