import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { clampDrop, COLORS, placementAt, positionOf, safeDrop, STICKER_SIZE } from './stickers/placement'
import { createEditKey, deleteSticker, editKeys, getShowOthers, readStickers, saveShowOthers, saveSticker } from './stickers/api'
import { aboutNoteIds } from '../content/about-collage'
import PlayfulToolbar from './PlayfulToolbar'
import PlayfulDrawing from './PlayfulDrawing'
import { nextDrawingColor } from './playful/brush'
import './StickerBoard.css'

function Paper({ color = 'Yellow', children }) {
  const palette = COLORS.find(item => item.name === color) || COLORS[0]
  return <div className="sticker-paper" style={{ '--paper': palette.value, '--paper-back': palette.back }}><div className="sticker-paper-face">{children}</div><span className="sticker-fold" aria-hidden="true" /></div>
}

export default function StickerBoard({ page }) {
  const [notes, setNotes] = useState([])
  const [selected, setSelected] = useState(null)
  const [typing, setTyping] = useState(false)
  const [showOthers, setShowOthers] = useState(getShowOthers)
  const [drag, setDrag] = useState(null)
  const [failure, setFailure] = useState(null)
  const [drawing, setDrawing] = useState(false)
  const [inkColor, setInkColor] = useState(nextDrawingColor)
  const [strokeCount, setStrokeCount] = useState(0)
  const [noteColor, setNoteColor] = useState('Mint')
  const [, refreshLayout] = useState(0)
  const tray = useRef(null)
  const crayon = useRef(null)
  const nextColor = useRef('Mint')
  const editor = useRef(null)
  const textarea = useRef(null)
  const selection = useRef(null)
  const gesture = useRef(null)
  const suppressClick = useRef(false)
  const persisted = useRef(new Set())
  const localChanges = useRef(new Map())
  const queue = useRef(Promise.resolve())
  const mounted = useRef(true)
  const revision = useRef(0)

  function select(note) { if (selection.current?.id !== note?.id) setTyping(false); selection.current = note; setSelected(note) }

  function persist(note) {
    revision.current += 1
    localChanges.current.set(note.id, note)
    setNotes(current => [...current.filter(item => item.id !== note.id), note])
    queue.current = queue.current.then(async () => {
      try {
        await saveSticker(note, persisted.current.has(note.id))
        persisted.current.add(note.id)
        if (localChanges.current.get(note.id) === note) localChanges.current.delete(note.id)
        if (mounted.current) setFailure(current => current?.note.id === note.id ? null : current)
      } catch { if (mounted.current) setFailure({ note, action: 'save' }) }
    })
  }

  function remove(note) {
    revision.current += 1
    select(null)
    localChanges.current.set(note.id, null)
    setNotes(current => current.filter(item => item.id !== note.id))
    queue.current = queue.current.then(async () => {
      try {
        if (persisted.current.has(note.id)) await deleteSticker(note.id)
        persisted.current.delete(note.id)
        localChanges.current.delete(note.id)
        if (mounted.current) setFailure(current => current?.note.id === note.id ? null : current)
      } catch { if (mounted.current) { localChanges.current.set(note.id, note); setNotes(current => [...current.filter(item => item.id !== note.id), note]); setFailure({ note, action: 'delete' }) } }
    })
  }

  function finishEditing() {
    const note = selection.current
    if (!note || gesture.current) return
    select(null)
    if (note.text.trim()) persist({ ...note, text: note.text.trim() })
    else remove(note)
  }

  useEffect(() => {
    mounted.current = true
    const controller = new AbortController()
    let fetching = false
    async function load(force = false) {
      if ((document.hidden && force !== true) || fetching) return
      fetching = true
      const version = revision.current
      try {
        const data = await readStickers(page, controller.signal)
        if (controller.signal.aborted || version !== revision.current) return
        data.stickers.forEach(note => persisted.current.add(note.id))
        setNotes(current => {
          const merged = new Map(data.stickers.map(note => [note.id, note]))
          for (const [id, note] of localChanges.current) { if (note) merged.set(id, note); else merged.delete(id) }
          if (selection.current) merged.set(selection.current.id, selection.current)
          for (const note of current) if (!persisted.current.has(note.id) && !localChanges.current.has(note.id)) merged.set(note.id, note)
          return [...merged.values()]
        })
      } catch { /* Loading never adds UI around the canvas; saves report actual failures. */ }
      finally { fetching = false }
    }
    load(true)
    const interval = setInterval(load, 15000)
    document.addEventListener('visibilitychange', load)
    return () => { mounted.current = false; controller.abort(); clearInterval(interval); document.removeEventListener('visibilitychange', load) }
  }, [page])

  useEffect(() => {
    let frame
    const update = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => refreshLayout(value => value + 1)) }
    const observer = new ResizeObserver(update)
    observer.observe(document.getElementById('main-content'))
    window.addEventListener('resize', update)
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener('resize', update) }
  }, [])

  function create(position) {
    finishEditing()
    setDrawing(false)
    const point = safeDrop(position.left, position.top)
    const note = { id: crypto.randomUUID(), page, text: '', color: nextColor.current, placement: placementAt(point.left, point.top) }
    nextColor.current = COLORS[Math.floor(Math.random() * COLORS.length)].name
    setNoteColor(nextColor.current)
    createEditKey(note.id)
    select(note)
    setTyping(true)
    requestAnimationFrame(() => textarea.current?.focus({ preventScroll: true }))
  }

  useEffect(() => {
    function outside(event) { if (selection.current && !editor.current?.contains(event.target)) finishEditing() }
    function move(event) {
      const current = gesture.current
      if (!current || event.pointerId !== current.pointerId) return
      const distance = Math.hypot(event.clientX - current.startX, event.clientY - current.startY)
      if (distance < 5 && !current.moved) return
      event.preventDefault()
      current.moved = true
      current.position = clampDrop(event.clientX - current.offsetX, event.clientY - current.offsetY)
      setDrag({ ...current.position, progress: Math.min(distance / 150, 1), note: current.note })
    }
    function finish(event) {
      const current = gesture.current
      if (!current || event.pointerId !== current.pointerId) return
      gesture.current = null
      suppressClick.current = current.moved
      setDrag(null)
      if (event.type === 'pointercancel' || !current.moved) return
      if (current.note) {
        const point = safeDrop(current.position.left, current.position.top)
        const note = { ...selection.current, placement: placementAt(point.left, point.top) }
        select(note)
        requestAnimationFrame(() => editor.current?.focus({ preventScroll: true }))
        if (note.text.trim()) persist(note)
      } else create(current.position)
    }
    function key(event) {
      const note = selection.current
      if (!note) return
      const typing = event.target.matches('textarea, input, [contenteditable="true"]')
      if (event.key === 'Escape' || ((event.metaKey || event.ctrlKey) && event.key === 'Enter')) {
        event.preventDefault()
        if (gesture.current) { gesture.current = null; setDrag(null) }
        finishEditing()
        tray.current?.querySelector('button')?.focus({ preventScroll: true })
      } else if (!typing && (event.key === 'Delete' || event.key === 'Backspace')) {
        event.preventDefault(); remove(note)
      } else if (!typing && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault()
        const position = positionOf(note.placement)
        const step = event.shiftKey ? 30 : 10
        const point = safeDrop(position.left + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0), position.top + (event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0))
        select({ ...note, placement: placementAt(point.left, point.top) })
      }
    }
    const pagehide = () => finishEditing()
    document.addEventListener('pointerdown', outside, true)
    window.addEventListener('pointermove', move, { passive: false })
    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', finish)
    window.addEventListener('keydown', key)
    window.addEventListener('pagehide', pagehide)
    return () => { document.removeEventListener('pointerdown', outside, true); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', finish); window.removeEventListener('pointercancel', finish); window.removeEventListener('keydown', key); window.removeEventListener('pagehide', pagehide) }
  }, [])

  useEffect(() => {
    if (!drawing) return
    function key(event) {
      if (event.target.closest('textarea, input, [contenteditable="true"]')) return
      if (event.key === 'Escape') { setDrawing(false); tray.current?.querySelector('.playful-crayon-tool')?.focus({ preventScroll: true }) }
      if ((event.metaKey || event.ctrlKey) && !event.shiftKey && event.key.toLowerCase() === 'z') { event.preventDefault(); crayon.current?.undo() }
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [drawing])

  function startDrag(event, note = null) {
    if (event.button !== 0 || (event.target.tagName === 'TEXTAREA' && document.activeElement === event.target)) return
    setDrawing(false)
    suppressClick.current = false
    if (note && selection.current?.id !== note.id) select(note)
    if (note) event.preventDefault()
    const box = note ? positionOf(note.placement) : event.currentTarget.getBoundingClientRect()
    gesture.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, offsetX: note ? event.clientX - box.left : STICKER_SIZE / 2, offsetY: note ? event.clientY - box.top : STICKER_SIZE / 2, note, moved: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const keys = editKeys()
  const visible = notes.filter(note => !aboutNoteIds.has(note.id) && (showOthers || keys[note.id]) && note.id !== selected?.id)
  if (selected && !aboutNoteIds.has(selected.id)) visible.push(selected)

  return <>
    <PlayfulDrawing ref={crayon} active={drawing} page={page} color={inkColor} showOthers={showOthers} onStrokeComplete={() => setInkColor(nextDrawingColor)} onStrokeCountChange={setStrokeCount} />
    <PlayfulToolbar trayRef={tray} drawing={drawing} inkColor={inkColor} onToggleDrawing={() => { finishEditing(); setDrawing(current => !current) }} noteColor={noteColor} peeling={!!drag && !drag.note} onNotePointerDown={event => startDrag(event)} onAddNote={event => {
        if (event.detail && suppressClick.current) { suppressClick.current = false; return }
        const box = tray.current.getBoundingClientRect()
        create(clampDrop(box.left + 2, box.top - STICKER_SIZE - 24))
      }} showOthers={showOthers} onToggleOthers={() => { setShowOthers(!showOthers); saveShowOthers(!showOthers) }} strokeCount={strokeCount} onUndo={() => crayon.current?.undo()} onClear={() => crayon.current?.clear()} />
    <div className="sticker-layer" aria-label="Visitor stickers">
      {visible.map(note => {
        const position = positionOf(note.placement)
        const pagePosition = { left: position.left + window.scrollX, top: position.top + window.scrollY }
        const active = selected?.id === note.id
        return <div key={note.id} ref={active ? editor : undefined} className={`${active ? 'sticker-editor' : 'placed-sticker'}${keys[note.id] ? ' is-editable' : ''}${active && typing ? ' is-typing' : ''}${active && drag ? ' is-dragging' : ''}`} style={pagePosition} role={active ? 'group' : keys[note.id] ? 'button' : undefined} tabIndex={keys[note.id] ? 0 : undefined} aria-label={active ? 'Selected note' : keys[note.id] ? `Edit note: ${note.text}` : `Visitor note: ${note.text}`} onBlur={event => { if (active && event.relatedTarget && !event.currentTarget.contains(event.relatedTarget) && !gesture.current) finishEditing() }} onPointerDown={event => { if (keys[note.id] && !event.target.closest('.sticker-colors')) startDrag(event, note) }} onClick={event => {
          if (!keys[note.id] || suppressClick.current) return
          if (event.target.closest('.sticker-colors') || (typing && event.target.tagName === 'TEXTAREA')) return
          select(note); requestAnimationFrame(() => editor.current?.focus({ preventScroll: true }))
        }} onDoubleClick={() => { if (keys[note.id]) { select(note); setTyping(true); requestAnimationFrame(() => textarea.current?.focus({ preventScroll: true })) } }} onKeyDown={event => { if (event.target === event.currentTarget && keys[note.id] && ['Enter', ' '].includes(event.key)) { event.preventDefault(); select(note); setTyping(true); requestAnimationFrame(() => textarea.current?.focus({ preventScroll: true })) } }}>
          {active && <div className={`sticker-colors${position.top < 54 ? ' is-below' : ''}`} role="group" aria-label="Note color" onPointerDown={event => event.stopPropagation()}>
            {COLORS.map(color => <button key={color.name} type="button" style={{ '--swatch': color.value }} aria-label={color.name} aria-pressed={note.color === color.name} onClick={event => { event.stopPropagation(); select({ ...selection.current, color: color.name }) }} />)}
          </div>}
          <Paper color={note.color}>{active ? <textarea ref={textarea} aria-label="Note text" maxLength={280} value={note.text} spellCheck={false} onChange={event => select({ ...selection.current, text: event.target.value })} /> : <p className="sticker-message">{note.text}</p>}</Paper>
        </div>
      })}
    </div>
    {drag && createPortal(<div className="sticker-in-flight" style={{ left: drag.left, top: drag.top, '--peel': `${16 + Math.sin(drag.progress * Math.PI) * 72}px`, '--lift': `${-8 + drag.progress * 5}deg`, '--lift-scale': drag.note ? 1.02 : .32 + drag.progress * .68 }} aria-hidden="true"><Paper color={drag.note?.color || noteColor}><p className="sticker-message">{drag.note?.text}</p></Paper></div>, document.body)}
    {failure && <div className="sticker-save-error" role="alert">Couldn’t {failure.action} your note. <button onClick={() => { setFailure(null); failure.action === 'save' ? persist(failure.note) : remove(failure.note) }}>Retry</button></div>}
  </>
}
