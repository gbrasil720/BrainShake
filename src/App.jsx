import { useEffect, useRef, useState } from 'react'
import {
  ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpToLine, BoxSelect, Check, ChevronDown,
  CircleHelp, Copy, Download, FileCode2, FileImage, FilePlus2, FileText, Hand, ImagePlus,
  Link2, Menu, Minus, MoreHorizontal, Move, Palette, PanelRight, Pencil, Play, Plus,
  Redo2, RotateCcw, Save, Search, Settings2, Shapes, StickyNote, Trash2, Type, Undo2,
  Upload, Video, X, Zap
} from 'lucide-react'

const STORAGE_KEY = 'brainshake-board-v1'
const colors = { yellow: '#fff0ad', pink: '#ffd9d1', blue: '#cfe9eb', green: '#d8ebc9', white: '#ffffff' }

const seedObjects = [
  { id: 'welcome', type: 'sticky', x: 190, y: 145, w: 250, h: 190, color: 'yellow', title: 'Start here', text: 'Write an idea, drop in a file, or use the toolbar to shape your thinking.' },
  { id: 'prompt', type: 'text', x: 535, y: 175, w: 280, h: 150, text: 'What are we trying to discover?\n\nStart with an open question and let the connections appear.' }
]

function makeId(prefix = 'item') { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }

function App() {
  const [board, setBoard] = useState(() => loadBoard())
  const [past, setPast] = useState([])
  const [future, setFuture] = useState([])
  const [tool, setTool] = useState('select')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [selected, setSelected] = useState([])
  const [context, setContext] = useState(null)
  const [dragging, setDragging] = useState(null)
  const [drawing, setDrawing] = useState(null)
  const [dropActive, setDropActive] = useState(false)
  const [toast, setToast] = useState('')
  const [showPanel, setShowPanel] = useState(true)
  const [grid, setGrid] = useState(true)
  const [accent, setAccent] = useState('#d86e50')
  const [theme, setTheme] = useState(() => localStorage.getItem('brainshake-theme') || 'light')
  const canvasRef = useRef(null)
  const fileRef = useRef(null)
  const boardFileRef = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(board))
    } catch {
      setToast('Storage limit reached. Export your board to keep a backup.')
    }
  }, [board])

  useEffect(() => { localStorage.setItem('brainshake-theme', theme) }, [theme])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 2400)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    const onKey = event => {
      const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
      const mod = event.metaKey || event.ctrlKey
      if (mod && event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); return }
      if (mod && event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); return }
      if (mod && event.key.toLowerCase() === 'a' && !typing) { event.preventDefault(); setSelected(board.objects.map(item => item.id)); return }
      if (mod && event.key.toLowerCase() === 'c' && !typing) { event.preventDefault(); copySelection(); return }
      if (mod && event.key.toLowerCase() === 'v' && !typing) { event.preventDefault(); pasteSelection(); return }
      if (typing) return
      if (event.key === 'Delete' || event.key === 'Backspace') removeSelection()
      if (event.key === 'Escape') { setSelected([]); setTool('select'); setContext(null) }
      const shortcuts = { v: 'select', h: 'hand', t: 'text', n: 'sticky', p: 'pen', l: 'connector' }
      if (shortcuts[event.key.toLowerCase()]) setTool(shortcuts[event.key.toLowerCase()])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function loadBoard() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { name: 'My first idea', objects: seedObjects } } catch { return { name: 'My first idea', objects: seedObjects } }
  }

  function updateBoard(mutator, saveHistory = true) {
    setBoard(current => {
      const next = mutator(current)
      if (saveHistory) { setPast(items => [...items.slice(-39), current]); setFuture([]) }
      return next
    })
  }

  function undo() { if (!past.length) return; setFuture(items => [board, ...items]); setBoard(past[past.length - 1]); setPast(items => items.slice(0, -1)); setSelected([]) }
  function redo() { if (!future.length) return; setPast(items => [...items, board]); setBoard(future[0]); setFuture(items => items.slice(1)); setSelected([]) }
  function screenPoint(event) { const rect = canvasRef.current.getBoundingClientRect(); return { x: (event.clientX - rect.left - pan.x) / zoom, y: (event.clientY - rect.top - pan.y) / zoom } }

  function addObject(type, data = {}, position) {
    const point = position || screenPoint({ clientX: window.innerWidth * .52, clientY: window.innerHeight * .48 })
    const item = { id: makeId(type), type, x: point.x - 130, y: point.y - 90, w: type === 'text' ? 280 : 250, h: type === 'text' ? 145 : 180, color: 'yellow', text: '', ...data }
    updateBoard(current => ({ ...current, objects: [...current.objects, item] }))
    setSelected([item.id]); setTool('select')
  }

  function updateObject(id, patch, history = true) { updateBoard(current => ({ ...current, objects: current.objects.map(item => item.id === id ? { ...item, ...patch } : item) }), history) }
  function removeSelection() { if (!selected.length) return; updateBoard(current => ({ ...current, objects: current.objects.filter(item => !selected.includes(item.id)) })); setSelected([]); setToast('Item removed') }
  function duplicateSelection() { const copies = board.objects.filter(item => selected.includes(item.id)).map(item => ({ ...item, id: makeId(item.type), x: item.x + 24, y: item.y + 24 })); if (!copies.length) return; updateBoard(current => ({ ...current, objects: [...current.objects, ...copies] })); setSelected(copies.map(item => item.id)) }
  function copySelection() { const items = board.objects.filter(item => selected.includes(item.id)); if (!items.length) return; navigator.clipboard?.writeText(JSON.stringify(items)); sessionStorage.setItem('brainshake-copy', JSON.stringify(items)); setToast('Copied to clipboard') }
  function pasteSelection() { try { const items = JSON.parse(sessionStorage.getItem('brainshake-copy') || '[]').map(item => ({ ...item, id: makeId(item.type), x: item.x + 32, y: item.y + 32 })); if (!items.length) return; updateBoard(current => ({ ...current, objects: [...current.objects, ...items] })); setSelected(items.map(item => item.id)) } catch { setToast('Could not paste') } }
  function exportBoard() { const blob = new Blob([JSON.stringify(board, null, 2)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `${board.name.replaceAll(' ', '-').toLowerCase()}.brainshake.json`; link.click(); URL.revokeObjectURL(link.href); setToast('Board exported') }
  function importBoard(file) { const reader = new FileReader(); reader.onload = () => { try { const data = JSON.parse(reader.result); if (!data.objects || !Array.isArray(data.objects)) throw Error(); updateBoard(() => data); setSelected([]); setToast('Board imported') } catch { setToast('Invalid BrainShake file') } }; reader.readAsText(file) }

  function beginDrag(event, item) {
    if (tool !== 'select' || ![0, 1, 2].includes(event.button) || item.locked) return
    if (event.target.closest('textarea') && event.button === 0 && event.buttons === 1) return
    if (event.button !== 0) event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    const point = screenPoint(event)
    const ids = selected.includes(item.id) ? selected : [item.id]
    if (!selected.includes(item.id)) setSelected([item.id])
    setDragging({ type: 'move', ids, start: point, origins: board.objects.filter(object => ids.includes(object.id)).map(object => ({ id: object.id, x: object.x, y: object.y })) })
  }

  function beginResize(event, item) { event.stopPropagation(); const point = screenPoint(event); setDragging({ type: 'resize', id: item.id, start: point, w: item.w, h: item.h }) }
  function beginPan(event) { if (tool !== 'hand' || event.button !== 0) return; setDragging({ type: 'pan', start: { x: event.clientX, y: event.clientY }, origin: pan }) }
  function movePointer(event) {
    if (drawing) { const point = screenPoint(event); setDrawing(current => ({ ...current, points: [...current.points, { x: point.x - current.x, y: point.y - current.y }] })); return }
    if (!dragging) return
    if (dragging.type === 'pan') { setPan({ x: dragging.origin.x + event.clientX - dragging.start.x, y: dragging.origin.y + event.clientY - dragging.start.y }); return }
    const point = screenPoint(event)
    if (dragging.type === 'resize') updateObject(dragging.id, { w: Math.max(100, dragging.w + point.x - dragging.start.x), h: Math.max(80, dragging.h + point.y - dragging.start.y) }, false)
    if (dragging.type === 'move') updateBoard(current => ({ ...current, objects: current.objects.map(item => { const origin = dragging.origins.find(value => value.id === item.id); return origin ? { ...item, x: origin.x + point.x - dragging.start.x, y: origin.y + point.y - dragging.start.y } : item }) }), false)
  }
  function endPointer() { if (drawing) { updateBoard(current => ({ ...current, objects: [...current.objects, drawing] })); setDrawing(null) } setDragging(null) }
  function beginDrawing(event) { if (tool !== 'pen' || event.button !== 0) return; event.currentTarget.setPointerCapture?.(event.pointerId); const point = screenPoint(event); setDrawing({ id: makeId('stroke'), type: 'stroke', x: point.x, y: point.y, w: 500, h: 500, points: [{ x: 0, y: 0 }] }) }

  function selectObject(event, item) {
    event.stopPropagation()
    if (tool === 'connector') { if (!selected.length) setSelected([item.id]); else if (selected[0] !== item.id) { const first = board.objects.find(object => object.id === selected[0]); updateBoard(current => ({ ...current, objects: [...current.objects, { id: makeId('connector'), type: 'connector', from: first.id, to: item.id }] })); setSelected([]); setTool('select') } return }
    if (event.shiftKey) setSelected(current => current.includes(item.id) ? current.filter(id => id !== item.id) : [...current, item.id]); else if (!selected.includes(item.id)) setSelected([item.id])
  }

  function readFileAsDataUrl(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file) }) }
  async function importFiles(files) {
    for (const file of Array.from(files)) {
      try {
        if (file.type.startsWith('image/')) addObject('image', { src: await readFileAsDataUrl(file), name: file.name, w: 280, h: 200 })
        else if (file.type.startsWith('video/')) addObject('video', { src: await readFileAsDataUrl(file), name: file.name, w: 320, h: 220 })
        else if (file.name.toLowerCase().endsWith('.html')) addObject('html', { src: await readFileAsDataUrl(file), name: file.name, w: 350, h: 240 })
        else if (file.type.startsWith('text/') || file.name.toLowerCase().endsWith('.md')) { const reader = new FileReader(); reader.onload = () => addObject('text', { text: reader.result, name: file.name }); reader.readAsText(file) }
        else setToast(`Unsupported format: ${file.name}`)
      } catch { setToast(`Could not import ${file.name}`) }
    }
  }

  function importUrl() {
    const url = window.prompt('Image URL')
    if (!url || !/^https?:\/\//i.test(url)) { if (url) setToast('Enter a valid image URL'); return }
    addObject('image', { src: url, name: 'Web image', w: 280, h: 200 })
  }

  function onWheel(event) {
    event.preventDefault()
    const rect = canvasRef.current.getBoundingClientRect()
    const point = screenPoint(event)
    const nextZoom = Math.min(2.4, Math.max(.35, zoom + (event.deltaY > 0 ? -.08 : .08)))
    setZoom(nextZoom)
    setPan({ x: event.clientX - rect.left - point.x * nextZoom, y: event.clientY - rect.top - point.y * nextZoom })
  }
  function fitContent() { if (!board.objects.length) { setZoom(1); setPan({ x: 0, y: 0 }); return } setZoom(.8); setPan({ x: 80, y: 30 }) }

  function handleCanvasPointerDown(event) {
    if (event.target !== event.currentTarget) return
    const point = screenPoint(event)
    if (tool === 'text' || tool === 'sticky') { addObject(tool, {}, point); return }
    setSelected([])
    beginPan(event)
    beginDrawing(event)
  }

  const selectedItem = board.objects.find(item => item.id === selected[0])
  const connectors = board.objects.filter(item => item.type === 'connector')
  const contentObjects = board.objects.filter(item => item.type !== 'connector')

  return <div className={`app theme-${theme}`} style={{ '--accent': accent }} onClick={() => setContext(null)}>
    <header className="topbar">
      <div className="brand"><img className="brand-logo" src={`${import.meta.env.BASE_URL}logo.png`} alt="BrainShake" /><span className="brand-name">BrainShake</span><span className="brand-sub">workspace</span></div>
      <div className="board-title"><Shapes size={15} /><input aria-label="Nome do board" value={board.name} onChange={event => setBoard(current => ({ ...current, name: event.target.value }))} /></div>
      <div className="top-actions"><span className="save-state"><i className="save-dot" /> Saved locally</span><button className="icon-button" title="Search"><Search size={17} /></button><button className="icon-button" title="Help"><CircleHelp size={17} /></button><button className="icon-button" title="Export board" onClick={exportBoard}><Download size={17} /></button><button className="icon-button" title="Import board" onClick={() => boardFileRef.current?.click()}><Upload size={17} /></button><button className="icon-button" title="Settings" onClick={() => setShowPanel(value => !value)}><Settings2 size={17} /></button></div>
    </header>
    <aside className="sidebar">
      <div className="sidebar-section"><div className="section-label">Workspace</div><button className="nav-item active"><BoxSelect size={16} /><span>Canvas</span></button><button className="nav-item" onClick={() => fileRef.current?.click()}><Upload size={16} /><span>Import</span></button><button className="nav-item" onClick={importUrl}><Link2 size={16} /><span>Import image URL</span></button><button className="nav-item" onClick={exportBoard}><Download size={16} /><span>Export</span></button></div>
      <div className="sidebar-section"><div className="section-label">Boards <button className="icon-button" style={{ display: 'inline-grid', width: 20, height: 20 }} title="New board" onClick={() => { const name = `Board ${Date.now().toString().slice(-4)}`; setBoard({ name, objects: [] }); setSelected([]) }}><Plus size={14} /></button></div><div className="board-list"><div className="board-item active"><span>{board.name}</span><button aria-label="More options"><MoreHorizontal size={15} /></button></div></div></div>
      <div className="sidebar-section"><div className="section-label">View</div><button className="nav-item" onClick={() => setGrid(value => !value)}><Shapes size={16} /><span>{grid ? 'Hide grid' : 'Show grid'}</span></button><button className="nav-item" onClick={() => setShowPanel(value => !value)}><PanelRight size={16} /><span>Properties</span></button></div>
      <div className="sidebar-foot">Everything stays in your browser.<br />No account. No cloud. Just ideas.</div>
    </aside>
    <main className="workspace">
      <div ref={canvasRef} className={`canvas-shell ${grid ? '' : 'grid-off'}`} onWheel={onWheel} onPointerDown={handleCanvasPointerDown} onPointerMove={movePointer} onPointerUp={endPointer} onPointerCancel={endPointer} onDragOver={event => { event.preventDefault(); setDropActive(true) }} onDragLeave={() => setDropActive(false)} onDrop={event => { event.preventDefault(); setDropActive(false); importFiles(event.dataTransfer.files) }} onContextMenu={event => { event.preventDefault(); setContext({ x: event.clientX, y: event.clientY }) }}>
        <div className="canvas-world" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
          <svg className="canvas-world" style={{ width: 1, height: 1, overflow: 'visible' }}>{connectors.map(item => { const from = board.objects.find(object => object.id === item.from); const to = board.objects.find(object => object.id === item.to); if (!from || !to) return null; const x1 = from.x + from.w / 2; const y1 = from.y + from.h / 2; const x2 = to.x + to.w / 2; const y2 = to.y + to.h / 2; return <g className="connector" key={item.id}><line x1={x1} y1={y1} x2={x2} y2={y2} /><polygon points={`${x2},${y2} ${x2 - 10},${y2 - 4} ${x2 - 7},${y2 + 7}`} /></g>})}</svg>
          {contentObjects.map(item => <CanvasObject key={item.id} item={item} selected={selected.includes(item.id)} onSelect={selectObject} onDrag={beginDrag} onResize={beginResize} onChange={(id, patch) => updateObject(id, patch, false)} />)}
          {drawing && <svg className="stroke" style={{ position: 'absolute', left: drawing.x, top: drawing.y, width: 500, height: 500 }}><path d={drawing.points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ')} /></svg>}
        </div>
        {!board.objects.length && <div className="empty-state"><div className="empty-icon"><Zap size={28} /></div><h1>A place to think out loud</h1><p>Drop files here, create a note, draw, or connect ideas. Your board is saved automatically on this device.</p></div>}
        {dropActive && <div className="drop-overlay"><Upload size={20} /> Drop to add to the board</div>}
      </div>
      <Toolbar tool={tool} setTool={value => value === 'image' || value === 'video' || value === 'html' ? fileRef.current?.click() : setTool(value)} undo={undo} redo={redo} canUndo={past.length > 0} canRedo={future.length > 0} addObject={addObject} />
      <div className="zoom-controls"><button className="icon-button" title="Zoom out" onClick={() => setZoom(value => Math.max(.35, value - .1))}><Minus size={15} /></button><span className="zoom-value">{Math.round(zoom * 100)}%</span><button className="icon-button" title="Zoom in" onClick={() => setZoom(value => Math.min(2.4, value + .1))}><Plus size={15} /></button><button className="icon-button" title="Fit content" onClick={fitContent}><MaximizeIcon /></button></div>
      {showPanel && <Properties item={selectedItem} accent={accent} setAccent={setAccent} theme={theme} setTheme={setTheme} grid={grid} setGrid={setGrid} onClose={() => setShowPanel(false)} onChange={(id, patch) => updateObject(id, patch)} />}
      {context && <ContextMenu position={context} hasSelection={selected.length > 0} onDuplicate={duplicateSelection} onDelete={removeSelection} onCopy={copySelection} onFront={() => updateBoard(current => ({ ...current, objects: [...current.objects.filter(item => !selected.includes(item.id)), ...current.objects.filter(item => selected.includes(item.id))] }))} />}
      {toast && <div className="toast"><Check size={14} /> {toast}</div>}
      <input ref={fileRef} type="file" hidden multiple accept="image/*,video/*,.html,.md,.txt" onChange={event => { importFiles(event.target.files); event.target.value = '' }} />
      <input ref={boardFileRef} type="file" hidden accept="application/json,.json,.brainshake.json" onChange={event => { if (event.target.files[0]) importBoard(event.target.files[0]); event.target.value = '' }} />
    </main>
  </div>
}

function CanvasObject({ item, selected, onSelect, onDrag, onResize, onChange }) {
  const common = { className: `canvas-object ${selected ? 'selected' : ''}`, style: { left: item.x, top: item.y, width: item.w, height: item.h }, onPointerDown: event => onSelect(event, item), onDoubleClick: event => { event.stopPropagation(); onChange(item.id, { editing: true }) } }
  const resize = selected && <div className="resize-handle" onPointerDown={event => onResize(event, item)} />
  let content
  if (item.type === 'sticky') content = <div className={`object-card sticky ${item.color || 'yellow'}`} style={{ background: colors[item.color] }}><h3>{item.title || 'Note'}</h3><textarea className="sticky-text" value={item.text} onChange={event => onChange(item.id, { text: event.target.value })} onPointerDown={event => event.stopPropagation()} /></div>
  if (item.type === 'text') content = <div className="object-card text-card"><textarea value={item.text} placeholder="Write your idea..." onChange={event => onChange(item.id, { text: event.target.value })} onPointerDown={event => event.stopPropagation()} /></div>
  if (item.type === 'image') content = <div className="object-card image-card"><img src={item.src} alt={item.name || 'Imported image'} /></div>
  if (item.type === 'video') content = <div className="object-card video-card"><video src={item.src} controls onPointerDown={event => event.stopPropagation()} /></div>
  if (item.type === 'html') content = <div className="object-card html-card"><div className="html-label"><FileCode2 size={12} /> {item.name}</div><iframe title={item.name} src={item.src} sandbox="allow-scripts" /></div>
  if (item.type === 'stroke') content = <svg className="stroke object-card" viewBox="0 0 500 500"><path d={item.points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ')} /></svg>
  return <div {...common} onPointerDown={event => { common.onPointerDown(event); onDrag(event, item) }}>{content}{resize}</div>
}

function Toolbar({ tool, setTool, undo, redo, canUndo, canRedo }) {
  const tools = [{ id: 'select', icon: BoxSelect, label: 'Select (V)' }, { id: 'hand', icon: Hand, label: 'Pan canvas (H)' }, { id: 'text', icon: Type, label: 'Text (T)' }, { id: 'sticky', icon: StickyNote, label: 'Sticky note (N)' }, { id: 'pen', icon: Pencil, label: 'Pen (P)' }, { id: 'connector', icon: Link2, label: 'Connect (L)' }]
  return <div className="toolbar">{tools.map(({ id, icon: Icon, label }) => <button key={id} className={`tool-button ${tool === id ? 'active' : ''}`} title={label} onClick={() => setTool(id)}><Icon size={17} /></button>)}<div className="toolbar-divider" /><button className="tool-button" title="Import image, video, or file" onClick={() => setTool('image')}><ImagePlus size={17} /></button><button className="tool-button" title="Undo" disabled={!canUndo} onClick={undo}><Undo2 size={17} /></button><button className="tool-button" title="Redo" disabled={!canRedo} onClick={redo}><Redo2 size={17} /></button></div>
}

function Properties({ item, accent, setAccent, theme, setTheme, grid, setGrid, onClose, onChange }) {
  return <div className="floating-panel"><div className="panel-heading"><span><PanelRight size={14} /> Properties</span><button className="icon-button" title="Close properties" onClick={onClose}><X size={14} /></button></div>{item ? <><div className="panel-row"><span>Type</span><strong>{item.type}</strong></div><div className="panel-row"><span>Position</span><span>{Math.round(item.x)} × {Math.round(item.y)}</span></div><div className="panel-row"><span>Size</span><span>{Math.round(item.w)} × {Math.round(item.h)}</span></div>{item.type === 'sticky' && <div className="panel-row"><span>Note color</span><div className="color-row">{Object.keys(colors).map(color => <button key={color} className={`color-swatch ${item.color === color ? 'active' : ''}`} style={{ background: colors[color] }} onClick={() => onChange(item.id, { color })} aria-label={`${color} color`} />)}</div></div>}<button className="nav-item" style={{ padding: 0, marginTop: 8, color: '#b2553c' }} onClick={() => onChange(item.id, { locked: !item.locked })}>{item.locked ? 'Unlock object' : 'Lock object'}</button></> : <p style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.5 }}>Select an item to edit its properties.</p>}<div className="panel-row" style={{ marginTop: 8 }}><span>Grid</span><button className="nav-item" style={{ padding: '0 7px', minHeight: 25, background: grid ? '#eaf0eb' : '#f0f2ef' }} onClick={() => setGrid(value => !value)}>{grid ? 'On' : 'Off'}</button></div><div className="panel-row"><span>Theme</span><select value={theme} onChange={event => setTheme(event.target.value)}><option value="light">Light</option><option value="warm">Warm</option><option value="mint">Mint</option></select></div><div className="panel-row"><span>Accent</span><div className="color-row">{['#d86e50', '#577d6a', '#50739a', '#8a6b9f', '#c58a44'].map(color => <button key={color} className={`color-swatch ${accent === color ? 'active' : ''}`} style={{ background: color }} onClick={() => setAccent(color)} aria-label="Choose accent color" />)}</div></div></div>
}

function ContextMenu({ position, hasSelection, onDuplicate, onDelete, onCopy, onFront }) {
  if (!hasSelection) return null
  return <div className="context-menu" style={{ left: position.x, top: position.y }} onClick={event => event.stopPropagation()}><button onClick={onDuplicate}><Copy size={14} /> Duplicate</button><button onClick={onCopy}><Copy size={14} /> Copy</button><button onClick={onFront}><ArrowUpToLine size={14} /> Bring to front</button><button onClick={onDelete} style={{ color: '#b2553c' }}><Trash2 size={14} /> Delete</button></div>
}

function MaximizeIcon() { return <span style={{ fontSize: 15, lineHeight: 1 }}>⛶</span> }

export default App