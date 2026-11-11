import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { COLORS } from './stickers/placement'
import './PlayfulToolbar.css'

function Crayon({ color }) {
  const id = useId()
  return <svg className="playful-crayon" viewBox="0 0 48 144" aria-hidden="true">
    <defs>
      <linearGradient id={`${id}-wax`} x1="0" x2="1">
        <stop stopColor="#000" stopOpacity=".32" /><stop offset=".22" stopColor="#fff" stopOpacity=".13" /><stop offset=".46" stopColor="#fff" stopOpacity=".04" /><stop offset=".74" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity=".2" />
      </linearGradient>
      <linearGradient id={`${id}-tip`} x1="0" x2="1">
        <stop stopColor="#000" stopOpacity=".26" /><stop offset=".3" stopColor="#fff" stopOpacity=".23" /><stop offset=".7" stopColor="#fff" stopOpacity=".03" /><stop offset="1" stopColor="#000" stopOpacity=".12" />
      </linearGradient>
    </defs>
    <path d="M9 34h30v103c0 7-30 7-30 0Z" fill={color} />
    <path d="M9 34h30v103c0 7-30 7-30 0Z" fill={`url(#${id}-wax)`} />
    <path d="M9 34 20 3c1-2 7-2 8 0l11 31c-7 4-23 4-30 0Z" fill={color} />
    <path d="M9 34 20 3c1-2 7-2 8 0l11 31c-7 4-23 4-30 0Z" fill={`url(#${id}-tip)`} />
    <ellipse cx="24" cy="3" rx="4" ry="1.2" fill="#fff" opacity=".2" />
    <path d="M9 34c7 4 23 4 30 0" fill="none" stroke="#fff" strokeOpacity=".16" />
    <path d="M9 44c7 3 23 3 30 0v5c-7 3-23 3-30 0Zm0 10c7 3 23 3 30 0v2.5c-7 3-23 3-30 0Zm0 69c7 3 23 3 30 0v2.5c-7 3-23 3-30 0Zm0 7c7 3 23 3 30 0v5c-7 3-23 3-30 0Z" fill="#252526" />
  </svg>
}

function NoteStack({ color, peeling }) {
  const palette = COLORS.find(item => item.name === color) || COLORS[5]
  return <svg className={`playful-notes${peeling ? ' is-peeling' : ''}`} viewBox="0 0 82 82" aria-hidden="true">
    <path d="m4 32 58-13 13 62H14Z" fill={palette.back} opacity=".72" />
    <path className="playful-notes-middle" d="m8 20 61-8 8 69H17Z" fill={palette.back} />
    <rect className="playful-notes-front" x="20" y="2" width="58" height="80" fill={palette.value} />
  </svg>
}

export default function PlayfulToolbar({ trayRef, drawing, inkColor, onToggleDrawing, onNotePointerDown, onAddNote, noteColor, peeling, showOthers, onToggleOthers, strokeCount, onUndo, onClear, localOnly = false }) {
  const [options, setOptions] = useState(false)
  const optionsRef = useRef(null)
  const settingsRef = useRef(null)
  const id = useId()

  useEffect(() => {
    if (!options) return
    const outside = event => { if (!optionsRef.current?.contains(event.target) && !settingsRef.current?.contains(event.target)) setOptions(false) }
    const key = event => { if (event.key === 'Escape') { setOptions(false); settingsRef.current?.focus() } }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', key) }
  }, [options])

  return createPortal(<aside className={`playful-tools${drawing ? ' is-drawing' : ''}`} ref={trayRef} aria-label="Playful tools">
    {drawing && !options && <div className="playful-drawing-actions">
      <span>Draw anywhere</span>
      <button type="button" onClick={onUndo} disabled={!strokeCount} aria-label="Undo last drawing" title="Undo (⌘/Ctrl Z)"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 4 3 8l4 4M3 8h9a4 4 0 0 1 0 8h-2" /></svg></button>
      <button type="button" onClick={onToggleDrawing} aria-label="Stop drawing" title="Stop drawing (Esc)"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15" /></svg></button>
    </div>}
    <div className="playful-dock" role="group" aria-label="Drawing and notes">
      <button type="button" className="playful-tool playful-crayon-tool" aria-label={drawing ? 'Stop drawing' : 'Draw with crayon'} aria-pressed={drawing} onClick={onToggleDrawing} title={drawing ? 'Stop drawing (Esc)' : 'Draw with crayon'}><Crayon color={inkColor} /></button>
      <button type="button" className="playful-tool playful-note-tool" aria-label="Add a sticky note" onPointerDown={onNotePointerDown} onClick={onAddNote} title="Click or drag a sticky note"><NoteStack color={noteColor} peeling={peeling} /></button>
      <button ref={settingsRef} type="button" className="playful-settings" aria-label="Tool options" aria-expanded={options} aria-controls={options ? id : undefined} onClick={() => setOptions(!options)} title="Tool options"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h3m6 0h7M4 17h7m6 0h3" /><circle cx="10" cy="7" r="3" /><circle cx="14" cy="17" r="3" /></svg></button>
    </div>
    {options && <div ref={optionsRef} className="playful-options" id={id}>
      {!localOnly && <label className="playful-others"><span>Show others’ notes &amp; drawings</span><button type="button" className="sticker-switch" role="switch" aria-label="Show others’ notes and drawings" aria-checked={showOthers} onClick={onToggleOthers}><span /></button></label>}
      <button type="button" className="playful-option" onClick={onUndo} disabled={!strokeCount}>Undo last drawing</button>
      <button type="button" className="playful-option" onClick={onClear} disabled={!strokeCount}>Clear my drawings</button>
    </div>}
  </aside>, document.body)
}
