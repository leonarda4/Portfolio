import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, useSyncExternalStore } from 'react'
import { melodramaPath } from './playful/brush'
import { drawingBoard } from './playful/drawings'
import { localDrawingBoard } from './playful/local-drawings'
import { captureStroke, strokeTransform } from './playful/placement'
import './PlayfulDrawing.css'

const MAX_POINTS = 4000
const PlayfulDrawing = forwardRef(function PlayfulDrawing({ active, page, color, showOthers, localOnly = false, onStrokeComplete, onStrokeCountChange }, ref) {
  const board = localOnly ? localDrawingBoard(page) : drawingBoard(page)
  const { strokes, error } = useSyncExternalStore(board.subscribe, board.getSnapshot)
  const [preview, setPreview] = useState(null)
  const [, refreshLayout] = useState(0)
  const gesture = useRef(null)
  const surface = useRef(null)
  const frame = useRef(0)
  const countCallback = useRef(onStrokeCountChange)
  countCallback.current = onStrokeCountChange

  const cancel = useCallback(() => {
    const current = gesture.current
    gesture.current = null
    cancelAnimationFrame(frame.current)
    frame.current = 0
    if (current && surface.current?.hasPointerCapture(current.pointerId)) surface.current.releasePointerCapture(current.pointerId)
    setPreview(null)
  }, [])

  useEffect(() => {
    cancel()
    if (localOnly) return
    board.importLegacy(window.innerWidth)
    board.retry()
    const load = () => { if (!document.hidden) board.load() }
    const retry = () => board.retry()
    const interval = setInterval(load, 15000)
    document.addEventListener('visibilitychange', load)
    window.addEventListener('online', retry)
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', load); window.removeEventListener('online', retry) }
  }, [board, cancel, localOnly])

  useEffect(() => {
    countCallback.current?.(strokes.filter(stroke => board.isOwn(stroke.id)).length)
  }, [board, strokes])

  useEffect(() => {
    let resizeFrame
    const update = () => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(() => refreshLayout(value => value + 1)) }
    const observer = new ResizeObserver(update)
    const content = document.getElementById('main-content')
    if (content) observer.observe(content)
    window.addEventListener('resize', update)
    return () => { observer.disconnect(); cancelAnimationFrame(resizeFrame); window.removeEventListener('resize', update) }
  }, [])

  useEffect(() => {
    if (!active) cancel()
  }, [active, cancel])

  useEffect(() => {
    const blur = () => cancel()
    window.addEventListener('blur', blur)
    return () => {
      window.removeEventListener('blur', blur)
      cancelAnimationFrame(frame.current)
    }
  }, [cancel])

  useImperativeHandle(ref, () => ({
    undo() { cancel(); board.undo() },
    clear() { cancel(); board.clear() },
  }), [board, cancel])

  function eventPoint(event) {
    return { x: event.clientX + window.scrollX, y: event.clientY + window.scrollY, pressure: event.pointerType === 'pen' ? event.pressure || .5 : .5 }
  }

  function addPoints(event) {
    const current = gesture.current
    if (!current || current.pointerId !== event.pointerId) return
    const samples = event.nativeEvent?.getCoalescedEvents?.() || []
    for (const sample of samples.length ? samples : [event]) {
      const next = eventPoint(sample)
      const previous = current.points[current.points.length - 1]
      if (Math.hypot(next.x - previous.x, next.y - previous.y) >= .65 && current.points.length < MAX_POINTS) current.points.push(next)
    }
  }

  function renderPreview() {
    frame.current = 0
    const current = gesture.current
    if (current) setPreview({ color: current.color, path: melodramaPath(current.points, current.seed) })
  }

  function start(event) {
    if (!active || gesture.current || event.button !== 0 || !event.isPrimary) return
    event.preventDefault()
    gesture.current = { pointerId: event.pointerId, points: [eventPoint(event)], seed: Math.random() * Math.PI * 2, color }
    event.currentTarget.setPointerCapture(event.pointerId)
    renderPreview()
  }

  function move(event) {
    if (!gesture.current || gesture.current.pointerId !== event.pointerId) return
    event.preventDefault()
    addPoints(event)
    if (!frame.current) frame.current = requestAnimationFrame(renderPreview)
  }

  function finish(event) {
    const current = gesture.current
    if (!current || current.pointerId !== event.pointerId) return
    addPoints(event)
    const stroke = { id: crypto.randomUUID(), color: current.color, ...captureStroke(current.points, current.seed) }
    cancel()
    board.add(stroke)
    onStrokeComplete?.()
  }

  return <>
    <svg className="playful-drawing" aria-hidden="true">
      {strokes.filter(stroke => showOthers || board.isOwn(stroke.id)).map(stroke => <path key={stroke.id} d={stroke.path} fill={stroke.color} transform={strokeTransform(stroke.placement)} />)}
      {preview && <path d={preview.path} fill={preview.color} />}
    </svg>
    <div ref={surface} className={`playful-drawing-input${active ? ' is-active' : ''}`} aria-hidden="true" onPointerDown={start} onPointerMove={move} onPointerUp={finish} onPointerCancel={cancel} onLostPointerCapture={cancel} />
    {error && <div className="sticker-save-error" role="alert">{error} <button type="button" onClick={() => board.retry()}>Retry</button></div>}
  </>
})

export default PlayfulDrawing
