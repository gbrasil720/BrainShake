import { useEffect, useRef, useState } from 'react'
import JSZip from 'jszip'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { CoffeeIcon, GithubIcon } from './AnimatedIcons.jsx'
import {
  ArrowUpToLine,
  BoxSelect,
  Check,
  Circle,
  Diamond,
  Hexagon,
  PaintBucket,
  Copy,
  Download,
  FileArchive,
  FileCode2,
  FileText,
  Hand,
  ImagePlus,
  Link2,
  Minus,
  MoreHorizontal,
  PanelRight,
  Pencil,
  Plus,
  Redo2,
  Search,
  Settings2,
  Shapes,
  Square,
  StickyNote,
  Trash2,
  Triangle,
  Type,
  Undo2,
  Upload,
  X,
  Zap
} from 'lucide-react'

const STORAGE_KEY = 'brainshake-board-v1'
const colors = {
  yellow: '#fff0ad',
  pink: '#ffd9d1',
  blue: '#cfe9eb',
  green: '#d8ebc9',
  white: '#ffffff'
}

const seedObjects = [
  {
    id: 'welcome',
    type: 'sticky',
    x: 190,
    y: 145,
    w: 250,
    h: 190,
    color: 'yellow',
    title: 'Start here',
    text: 'Write an idea, drop in a file, or use the toolbar to shape your thinking.'
  },
  {
    id: 'prompt',
    type: 'text',
    x: 535,
    y: 175,
    w: 280,
    h: 150,
    text: 'What are we trying to discover?\n\nStart with an open question and let the connections appear.'
  }
]

function makeId(prefix = 'item') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function loadBoards() {
  try {
    const saved = JSON.parse(localStorage.getItem('brainshake-boards-v1'))
    if (Array.isArray(saved) && saved.length) return saved
  } catch {}
  const current = { name: 'My first idea', objects: seedObjects }
  return [{ ...current, id: 'board-main' }]
}

function App() {
  const [boards, setBoards] = useState(() => loadBoards())
  const [board, setBoard] = useState(() => loadBoards()[0])
  const [past, setPast] = useState([])
  const [future, setFuture] = useState([])
  const [tool, setTool] = useState('select')
  const [strokeWidth, setStrokeWidth] = useState(4)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [selected, setSelected] = useState([])
  const [context, setContext] = useState(null)
  const [dragging, setDragging] = useState(null)
  const [drawing, setDrawing] = useState(null)
  const [dropActive, setDropActive] = useState(false)
  const [toast, setToast] = useState('')
  const [showPanel, setShowPanel] = useState(true)
  const [urlOpen, setUrlOpen] = useState(false)
  const [dockPosition, setDockPosition] = useState(
    () => localStorage.getItem('brainshake-dock') || 'bottom'
  )
  const [dockDragging, setDockDragging] = useState(false)
  const [grid, setGrid] = useState(true)
  const [accent, setAccent] = useState(() => localStorage.getItem('brainshake-accent') || '#d86e50')
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
    setBoards((current) => current.map((item) => (item.id === board.id ? board : item)))
  }, [board])
  useEffect(() => {
    localStorage.setItem('brainshake-boards-v1', JSON.stringify(boards))
  }, [boards])

  function switchBoard(id) {
    const next = boards.find((item) => item.id === id)
    if (!next || next.id === board.id) return
    setBoard(next)
    setSelected([])
    setPan({ x: 0, y: 0 })
    setZoom(1)
  }

  function createBoard() {
    const next = { id: makeId('board'), name: `Board ${boards.length + 1}`, objects: [] }
    setBoards((current) => [...current, next])
    setBoard(next)
    setSelected([])
    setPast([])
    setFuture([])
  }

  function deleteBoard(id) {
    if (boards.length < 2) return
    const nextBoards = boards.filter((item) => item.id !== id)
    setBoards(nextBoards)
    if (board.id === id) setBoard(nextBoards[0])
    setSelected([])
  }

  useEffect(() => {
    localStorage.setItem('brainshake-theme', theme)
  }, [theme])
  useEffect(() => {
    localStorage.setItem('brainshake-accent', accent)
  }, [accent])
  useEffect(() => {
    localStorage.setItem('brainshake-dock', dockPosition)
  }, [dockPosition])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 2400)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    const onKey = (event) => {
      const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)
      const mod = event.metaKey || event.ctrlKey
      if (mod && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        event.shiftKey ? redo() : undo()
        return
      }
      if (mod && event.key.toLowerCase() === 'y') {
        event.preventDefault()
        redo()
        return
      }
      if (mod && event.key.toLowerCase() === 'a' && !typing) {
        event.preventDefault()
        setSelected(board.objects.map((item) => item.id))
        return
      }
      if (mod && event.key.toLowerCase() === 'c' && !typing) {
        event.preventDefault()
        copySelection()
        return
      }
      if (mod && event.key.toLowerCase() === 'v' && !typing) {
        event.preventDefault()
        pasteSelection()
        return
      }
      if (typing) return
      if (event.key === 'Delete' || event.key === 'Backspace') removeSelection()
      if (event.key === 'Escape') {
        setSelected([])
        setTool('select')
        setContext(null)
      }
      const shortcuts = { v: 'select', h: 'hand', t: 'text', n: 'sticky', p: 'pen', l: 'connector' }
      if (shortcuts[event.key.toLowerCase()]) setTool(shortcuts[event.key.toLowerCase()])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function loadBoard() {
    try {
      return (
        JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
          name: 'My first idea',
          objects: seedObjects
        }
      )
    } catch {
      return { name: 'My first idea', objects: seedObjects }
    }
  }

  function updateBoard(mutator, saveHistory = true) {
    setBoard((current) => {
      const next = mutator(current)
      if (saveHistory) {
        setPast((items) => [...items.slice(-39), current])
        setFuture([])
      }
      return next
    })
  }

  function undo() {
    if (!past.length) return
    setFuture((items) => [board, ...items])
    setBoard(past[past.length - 1])
    setPast((items) => items.slice(0, -1))
    setSelected([])
  }
  function redo() {
    if (!future.length) return
    setPast((items) => [...items, board])
    setBoard(future[0])
    setFuture((items) => items.slice(1))
    setSelected([])
  }
  function screenPoint(event) {
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: (event.clientX - rect.left - pan.x) / zoom,
      y: (event.clientY - rect.top - pan.y) / zoom
    }
  }

  function addObject(type, data = {}, position) {
    const point =
      position ||
      screenPoint({ clientX: window.innerWidth * 0.52, clientY: window.innerHeight * 0.48 })
    const item = {
      id: makeId(type),
      type,
      x: point.x - 130,
      y: point.y - 90,
      w: type === 'text' ? 280 : 250,
      h: type === 'text' ? 145 : 180,
      color: 'yellow',
      text: '',
      ...data
    }
    updateBoard((current) => ({ ...current, objects: [...current.objects, item] }))
    setSelected([item.id])
    setTool('select')
  }

  function updateObject(id, patch, history = true) {
    updateBoard(
      (current) => ({
        ...current,
        objects: current.objects.map((item) => (item.id === id ? { ...item, ...patch } : item))
      }),
      history
    )
  }
  function removeSelection() {
    if (!selected.length) return
    updateBoard((current) => ({
      ...current,
      objects: current.objects.filter((item) => !selected.includes(item.id))
    }))
    setSelected([])
    setToast('Item removed')
  }
  function duplicateSelection() {
    const copies = board.objects
      .filter((item) => selected.includes(item.id))
      .map((item) => ({ ...item, id: makeId(item.type), x: item.x + 24, y: item.y + 24 }))
    if (!copies.length) return
    updateBoard((current) => ({ ...current, objects: [...current.objects, ...copies] }))
    setSelected(copies.map((item) => item.id))
  }
  function copySelection() {
    const items = board.objects.filter((item) => selected.includes(item.id))
    if (!items.length) return
    navigator.clipboard?.writeText(JSON.stringify(items))
    sessionStorage.setItem('brainshake-copy', JSON.stringify(items))
    setToast('Copied to clipboard')
  }
  function pasteSelection() {
    try {
      const items = JSON.parse(sessionStorage.getItem('brainshake-copy') || '[]').map((item) => ({
        ...item,
        id: makeId(item.type),
        x: item.x + 32,
        y: item.y + 32
      }))
      if (!items.length) return
      updateBoard((current) => ({ ...current, objects: [...current.objects, ...items] }))
      setSelected(items.map((item) => item.id))
    } catch {
      setToast('Could not paste')
    }
  }
  function boardFilename(extension) {
    return `${
      board.name
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase() || 'brainshake-board'
    }.${extension}`
  }
  function downloadBlob(blob, filename) {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    setTimeout(() => URL.revokeObjectURL(link.href), 0)
  }
  function dataUrlInfo(src, id) {
    const match = /^data:([^;,]+)?((?:;[^,]*)?),([ -]*)$/s.exec(src)
    if (!match) return null
    const mediaType = match[1] || 'application/octet-stream'
    const metadata = match[2] || ''
    const extension =
      {
        'image/jpeg': 'jpg',
        'image/svg+xml': 'svg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'video/mp4': 'mp4',
        'video/webm': 'webm',
        'text/html': 'html'
      }[mediaType] || 'bin'
    return {
      mediaType,
      extension,
      data: match[3],
      base64: metadata.includes(';base64'),
      id: id.replace(/[^a-z0-9_-]/gi, '-')
    }
  }
  async function exportBrainshake() {
    const zip = new JSZip()
    const media = []
    const objects = board.objects.map((item) => {
      if (!['image', 'video', 'html'].includes(item.type) || !item.src?.startsWith('data:'))
        return { ...item }
      const info = dataUrlInfo(item.src, item.id)
      if (!info) return { ...item }
      const path = `media/${info.id}.${info.extension}`
      const content = info.base64 ? info.data : decodeURIComponent(info.data)
      media.push({ path, content, base64: info.base64 })
      return { ...item, src: path, mediaType: info.mediaType }
    })
    zip.file('board.json', JSON.stringify({ name: board.name, objects }, null, 2))
    media.forEach((item) => zip.file(item.path, item.content, { base64: item.base64 }))
    downloadBlob(await zip.generateAsync({ type: 'blob' }), boardFilename('brainshake'))
    setToast('Board exported')
  }
  function exportJson() {
    const objects = board.objects.map((item) => {
      if (!['image', 'video', 'html'].includes(item.type)) return { ...item }
      const { src, ...withoutSrc } = item
      return { ...withoutSrc, mediaOmitted: true }
    })
    downloadBlob(
      new Blob([JSON.stringify({ name: board.name, objects }, null, 2)], {
        type: 'application/json'
      }),
      boardFilename('json')
    )
    setToast('Board exported')
  }
  async function importBoard(file) {
    try {
      const buffer = await file.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      let data
      if (bytes[0] === 0x50 && bytes[1] === 0x4b) {
        const zip = await JSZip.loadAsync(buffer)
        const manifest = zip.file('board.json')
        if (!manifest) throw Error()
        data = JSON.parse(await manifest.async('text'))
        for (const item of data.objects || []) {
          if (!item.src?.startsWith('media/')) continue
          const mediaFile = zip.file(item.src.replace(/^\.\//, ''))
          if (!mediaFile || !item.mediaType) throw Error()
          item.src = `data:${item.mediaType};base64,${await mediaFile.async('base64')}`
        }
      } else data = JSON.parse(new TextDecoder().decode(bytes))
      if (!data || typeof data.name !== 'string' || !Array.isArray(data.objects)) throw Error()
      updateBoard(() => data)
      setSelected([])
      setToast('Board imported')
    } catch {
      setToast('Invalid BrainShake file')
    }
  }

  function beginDrag(event, item) {
    if (tool !== 'select' || ![0, 1, 2].includes(event.button) || item.locked) return
    if (
      event.target.closest('textarea, .markdown-preview') &&
      event.button === 0 &&
      event.buttons === 1
    )
      return
    if (event.button !== 0) event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture?.(event.pointerId)
    const point = screenPoint(event)
    const ids = selected.includes(item.id) ? selected : [item.id]
    if (!selected.includes(item.id)) setSelected([item.id])
    setDragging({
      type: 'move',
      ids,
      start: point,
      origins: board.objects
        .filter((object) => ids.includes(object.id))
        .map((object) => ({ id: object.id, x: object.x, y: object.y }))
    })
  }

  function beginResize(event, item) {
    event.stopPropagation()
    const point = screenPoint(event)
    setDragging({ type: 'resize', id: item.id, start: point, w: item.w, h: item.h })
  }
  function beginPan(event) {
    if (tool !== 'hand' || event.button !== 0) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    event.preventDefault()
    setDragging({ type: 'pan', start: { x: event.clientX, y: event.clientY }, origin: pan })
  }
  function movePointer(event) {
    if (drawing) {
      const point = screenPoint(event)
      setDrawing((current) => ({
        ...current,
        points: [...current.points, { x: point.x - current.x, y: point.y - current.y }]
      }))
      return
    }
    if (!dragging) return
    if (dragging.type === 'pan') {
      setPan({
        x: dragging.origin.x + event.clientX - dragging.start.x,
        y: dragging.origin.y + event.clientY - dragging.start.y
      })
      return
    }
    const point = screenPoint(event)
    if (dragging.type === 'resize')
      updateObject(
        dragging.id,
        {
          w: Math.max(100, dragging.w + point.x - dragging.start.x),
          h: Math.max(80, dragging.h + point.y - dragging.start.y)
        },
        false
      )
    if (dragging.type === 'move')
      updateBoard(
        (current) => ({
          ...current,
          objects: current.objects.map((item) => {
            const origin = dragging.origins.find((value) => value.id === item.id)
            return origin
              ? {
                  ...item,
                  x: origin.x + point.x - dragging.start.x,
                  y: origin.y + point.y - dragging.start.y
                }
              : item
          })
        }),
        false
      )
  }
  function finishStroke(stroke) {
    const padding = (stroke.strokeWidth || 4) / 2
    const bounds = stroke.points.reduce(
      (result, point) => ({
        minX: Math.min(result.minX, point.x),
        minY: Math.min(result.minY, point.y),
        maxX: Math.max(result.maxX, point.x),
        maxY: Math.max(result.maxY, point.y)
      }),
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
    )
    const minX = bounds.minX - padding
    const minY = bounds.minY - padding
    return {
      ...stroke,
      x: stroke.x + minX,
      y: stroke.y + minY,
      w: Math.max(stroke.strokeWidth || 4, bounds.maxX - minX + padding),
      h: Math.max(stroke.strokeWidth || 4, bounds.maxY - minY + padding),
      points: stroke.points.map((point) => ({ x: point.x - minX, y: point.y - minY }))
    }
  }
  function endPointer(event) {
    if (drawing) {
      updateBoard((current) => ({
        ...current,
        objects: [...current.objects, finishStroke(drawing)]
      }))
      setDrawing(null)
    }
    if (event?.currentTarget?.hasPointerCapture?.(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId)
    setDragging(null)
  }
  function beginDrawing(event) {
    if (tool !== 'pen' || event.button !== 0) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    const point = screenPoint(event)
    setDrawing({
      id: makeId('stroke'),
      type: 'stroke',
      x: point.x,
      y: point.y,
      w: 500,
      h: 500,
      strokeWidth,
      points: [{ x: 0, y: 0 }]
    })
  }

  function selectObject(event, item) {
    event.stopPropagation()
    if (tool === 'connector') {
      if (!selected.length) setSelected([item.id])
      else if (selected[0] !== item.id) {
        const first = board.objects.find((object) => object.id === selected[0])
        updateBoard((current) => ({
          ...current,
          objects: [
            ...current.objects,
            { id: makeId('connector'), type: 'connector', from: first.id, to: item.id }
          ]
        }))
        setSelected([])
        setTool('select')
      }
      return
    }
    if (event.shiftKey)
      setSelected((current) =>
        current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id]
      )
    else if (!selected.includes(item.id)) setSelected([item.id])
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
  async function importFiles(files) {
    for (const file of Array.from(files)) {
      try {
        if (file.type.startsWith('image/'))
          addObject('image', {
            src: await readFileAsDataUrl(file),
            name: file.name,
            w: 280,
            h: 200
          })
        else if (file.type.startsWith('video/'))
          addObject('video', {
            src: await readFileAsDataUrl(file),
            name: file.name,
            w: 320,
            h: 220
          })
        else if (file.name.toLowerCase().endsWith('.html'))
          addObject('html', { src: await readFileAsDataUrl(file), name: file.name, w: 350, h: 240 })
        else if (file.type.startsWith('text/') || file.name.toLowerCase().endsWith('.md')) {
          const reader = new FileReader()
          reader.onload = () => addObject('text', { text: reader.result, name: file.name })
          reader.readAsText(file)
        } else setToast(`Unsupported format: ${file.name}`)
      } catch {
        setToast(`Could not import ${file.name}`)
      }
    }
  }

  function importUrl() {
    setUrlOpen(true)
  }

  function submitImageUrl(url) {
    if (!/^https?:\/\//i.test(url)) {
      setToast('Enter a valid image URL')
      return
    }
    addObject('image', { src: url, name: 'Web image', w: 280, h: 200 })
    setUrlOpen(false)
  }

  function onWheel(event) {
    event.preventDefault()
    const rect = canvasRef.current.getBoundingClientRect()
    const point = screenPoint(event)
    const delta =
      event.deltaMode === 1
        ? event.deltaY * 16
        : event.deltaMode === 2
          ? event.deltaY * rect.height
          : event.deltaY
    const nextZoom = Math.min(2.4, Math.max(0.35, zoom * Math.pow(0.9985, delta)))
    setZoom(nextZoom)
    setPan({
      x: event.clientX - rect.left - point.x * nextZoom,
      y: event.clientY - rect.top - point.y * nextZoom
    })
  }
  function fitContent() {
    if (!board.objects.length) {
      setZoom(1)
      setPan({ x: 0, y: 0 })
      return
    }
    setZoom(0.8)
    setPan({ x: 80, y: 30 })
  }

  function handleCanvasPointerDown(event) {
    if (event.target !== event.currentTarget) return
    const point = screenPoint(event)
    if (tool === 'text' || tool === 'sticky') {
      addObject(tool, {}, point)
      return
    }
    setSelected([])
    beginPan(event)
    beginDrawing(event)
  }

  const selectedItem = board.objects.find((item) => item.id === selected[0])
  const connectors = board.objects.filter((item) => item.type === 'connector')
  const contentObjects = board.objects.filter((item) => item.type !== 'connector')

  return (
    <div
      className={`app theme-${theme}`}
      style={{ '--accent': accent }}
      onClick={() => setContext(null)}
    >
      <header className="topbar">
        <div className="brand">
          <img
            className="brand-logo"
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="BrainShake"
          />
          <span className="brand-name">BrainShake</span>
          <span className="brand-sub">workspace</span>
        </div>
        <div className="board-title">
          <Shapes size={15} />
          <input
            aria-label="Nome do board"
            value={board.name}
            onChange={(event) => setBoard((current) => ({ ...current, name: event.target.value }))}
          />
        </div>
        <div className="top-actions">
          <span className="save-state">
            <i className="save-dot" /> Saved locally
          </span>
          <button className="icon-button" title="Search">
            <Search size={17} />
          </button>
          <ExportMenu onExport={exportBrainshake} onExportJson={exportJson} compact />
          <button
            className="icon-button"
            title="Import board"
            onClick={() => boardFileRef.current?.click()}
          >
            <Upload size={17} />
          </button>
          <button
            className="icon-button"
            title="Settings"
            onClick={() => setShowPanel((value) => !value)}
          >
            <Settings2 size={17} />
          </button>
        </div>
      </header>
      <aside className="sidebar">
        <div className="sidebar-section">
          <div className="section-label">Workspace</div>
          <button className="nav-item active">
            <BoxSelect size={16} />
            <span>Canvas</span>
          </button>
          <button className="nav-item" onClick={() => fileRef.current?.click()}>
            <Upload size={16} />
            <span>Import</span>
          </button>
          <button className="nav-item" onClick={importUrl}>
            <Link2 size={16} />
            <span>Import image URL</span>
          </button>
          <ExportMenu onExport={exportBrainshake} onExportJson={exportJson} />
        </div>
        <div className="sidebar-section">
          <div className="section-label">
            Boards{' '}
            <button
              className="icon-button"
              style={{ display: 'inline-grid', width: 20, height: 20 }}
              title="New board"
              onClick={createBoard}
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="board-list">
            {boards.map((item) => (
              <button
                key={item.id}
                className={'board-item ' + (item.id === board.id ? 'active' : '')}
                onClick={() => switchBoard(item.id)}
              >
                <span>{item.name}</span>
                {boards.length > 1 && (
                  <span
                    className="board-delete"
                    role="button"
                    aria-label="Delete board"
                    onClick={(event) => {
                      event.stopPropagation()
                      deleteBoard(item.id)
                    }}
                  >
                    <X size={13} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="sidebar-section">
          <div className="section-label">View</div>
          <button className="nav-item" onClick={() => setGrid((value) => !value)}>
            <Shapes size={16} />
            <span>{grid ? 'Hide grid' : 'Show grid'}</span>
          </button>
          <button className="nav-item" onClick={() => setShowPanel((value) => !value)}>
            <PanelRight size={16} />
            <span>Properties</span>
          </button>
        </div>
        <div className="sidebar-foot">
          <div className="sidebar-foot-copy">
            Everything stays in your browser.
            <br />
            No account. No cloud. Just ideas.
          </div>
          <div className="sidebar-links">
            <a
              className="sidebar-link"
              href="https://github.com/pxdritz1/BrainShake"
              target="_blank"
              rel="noreferrer"
              title="Open GitHub repository"
            >
              <GithubIcon size={16} />
              <span>Source</span>
            </a>
            <a
              className="sidebar-link"
              href="https://ko-fi.com/pxdritz1"
              target="_blank"
              rel="noreferrer"
              title="Support on Ko-fi"
            >
              <CoffeeIcon size={16} />
              <span>Ko-fi</span>
            </a>
          </div>
        </div>
      </aside>
      <main className="workspace">
        <div
          ref={canvasRef}
          className={`canvas-shell ${grid ? '' : 'grid-off'} ${dragging?.type === 'pan' ? 'is-panning' : ''}`}
          onWheel={onWheel}
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={movePointer}
          onPointerUp={endPointer}
          onPointerCancel={endPointer}
          onDragOver={(event) => {
            event.preventDefault()
            setDropActive(true)
          }}
          onDragLeave={() => setDropActive(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDropActive(false)
            importFiles(event.dataTransfer.files)
          }}
          onContextMenu={(event) => {
            event.preventDefault()
            setContext({ x: event.clientX, y: event.clientY })
          }}
        >
          <div
            className="canvas-world"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transition:
                dragging?.type === 'pan' ? 'none' : 'transform 140ms cubic-bezier(.2,.75,.25,1)'
            }}
          >
            <svg className="canvas-world" style={{ width: 1, height: 1, overflow: 'visible' }}>
              {connectors.map((item) => {
                const from = board.objects.find((object) => object.id === item.from)
                const to = board.objects.find((object) => object.id === item.to)
                if (!from || !to) return null
                const x1 = from.x + from.w / 2
                const y1 = from.y + from.h / 2
                const x2 = to.x + to.w / 2
                const y2 = to.y + to.h / 2
                return (
                  <g className="connector" key={item.id}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} />
                    <polygon points={`${x2},${y2} ${x2 - 10},${y2 - 4} ${x2 - 7},${y2 + 7}`} />
                  </g>
                )
              })}
            </svg>
            {contentObjects.map((item) => (
              <CanvasObject
                key={item.id}
                item={item}
                selected={selected.includes(item.id)}
                onSelect={selectObject}
                onDrag={beginDrag}
                onResize={beginResize}
                onChange={(id, patch) => updateObject(id, patch, false)}
                onRemove={(id) => {
                  updateBoard((current) => ({
                    ...current,
                    objects: current.objects.filter((object) => object.id !== id)
                  }))
                  setSelected((current) => current.filter((value) => value !== id))
                }}
              />
            ))}
            {drawing && (
              <svg
                className="stroke"
                style={{
                  position: 'absolute',
                  left: drawing.x,
                  top: drawing.y,
                  width: 500,
                  height: 500
                }}
              >
                <path
                  style={{ strokeWidth }}
                  d={drawing.points
                    .map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`)
                    .join(' ')}
                />
              </svg>
            )}
          </div>
          {!board.objects.length && (
            <div className="empty-state">
              <div className="empty-icon">
                <Zap size={28} />
              </div>
              <h1>A place to think out loud</h1>
              <p>
                Drop files here, create a note, draw, or connect ideas. Your board is saved
                automatically on this device.
              </p>
            </div>
          )}
          {dropActive && (
            <div className="drop-overlay">
              <Upload size={20} /> Drop to add to the board
            </div>
          )}
        </div>
        {dockDragging && (
          <DockDropZones
            onDrop={(position) => {
              setDockPosition(position)
              setDockDragging(false)
            }}
          />
        )}
        <Toolbar
          dockPosition={dockPosition}
          onDockDragStart={() => setDockDragging(true)}
          onDockDragEnd={() => setDockDragging(false)}
          tool={tool}
          setTool={(value) =>
            value === 'image' || value === 'video' || value === 'html'
              ? fileRef.current?.click()
              : setTool(value)
          }
          strokeWidth={strokeWidth}
          setStrokeWidth={setStrokeWidth}
          undo={undo}
          redo={redo}
          canUndo={past.length > 0}
          canRedo={future.length > 0}
          addObject={addObject}
        />
        <div className="zoom-controls">
          <button
            className="icon-button"
            title="Zoom out"
            onClick={() => setZoom((value) => Math.max(0.35, value - 0.1))}
          >
            <Minus size={15} />
          </button>
          <span className="zoom-value">{Math.round(zoom * 100)}%</span>
          <button
            className="icon-button"
            title="Zoom in"
            onClick={() => setZoom((value) => Math.min(2.4, value + 0.1))}
          >
            <Plus size={15} />
          </button>
          <button className="icon-button" title="Fit content" onClick={fitContent}>
            <MaximizeIcon />
          </button>
        </div>
        {showPanel && (
          <Properties
            dockPosition={dockPosition}
            setDockPosition={setDockPosition}
            item={selectedItem}
            accent={accent}
            setAccent={setAccent}
            theme={theme}
            setTheme={setTheme}
            grid={grid}
            setGrid={setGrid}
            onClose={() => setShowPanel(false)}
            onChange={(id, patch) => updateObject(id, patch)}
          />
        )}
        {context && (
          <ContextMenu
            position={context}
            hasSelection={selected.length > 0}
            onDuplicate={duplicateSelection}
            onDelete={removeSelection}
            onCopy={copySelection}
            onFront={() =>
              updateBoard((current) => ({
                ...current,
                objects: [
                  ...current.objects.filter((item) => !selected.includes(item.id)),
                  ...current.objects.filter((item) => selected.includes(item.id))
                ]
              }))
            }
          />
        )}
        {urlOpen && <UrlDialog onClose={() => setUrlOpen(false)} onSubmit={submitImageUrl} />}
        {toast && (
          <div className="toast">
            <Check size={14} /> {toast}
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          hidden
          multiple
          accept="image/*,video/*,.html,.md,.txt"
          onChange={(event) => {
            importFiles(event.target.files)
            event.target.value = ''
          }}
        />
        <input
          ref={boardFileRef}
          type="file"
          hidden
          accept="application/json,application/zip,.json,.brainshake,.brainshake.json"
          onChange={(event) => {
            if (event.target.files[0]) importBoard(event.target.files[0])
            event.target.value = ''
          }}
        />
      </main>
    </div>
  )
}

function CanvasObject({ item, selected, onSelect, onDrag, onResize, onChange, onRemove }) {
  const common = {
    className: `canvas-object ${selected ? 'selected' : ''}`,
    style: { left: item.x, top: item.y, width: item.w, height: item.h },
    onPointerDown: (event) => onSelect(event, item),
    onDoubleClick: (event) => {
      event.stopPropagation()
      onChange(item.id, { editing: true })
    }
  }
  const resize = selected && (
    <div className="resize-handle" onPointerDown={(event) => onResize(event, item)} />
  )
  let content
  if (item.type === 'shape')
    content = (
      <div
        className={`widget-body shape-card ${item.shape || 'square'} fill-${item.fill || 'solid'}`}
        style={{ '--shape-fill': item.fillColor || 'var(--accent)' }}
      >
        {item.shape === 'circle' ? <Circle /> : <Square />}
      </div>
    )
  if (item.type === 'shape')
    return (
      <div
        {...common}
        className={`canvas-object shape-object ${selected ? 'selected' : ''}`}
        onPointerDown={(event) => {
          common.onPointerDown(event)
          onDrag(event, item)
        }}
      >
        <svg className="shape-svg" viewBox="0 0 100 100" aria-label={item.name || item.shape}>
          <rect
            x="8"
            y="8"
            width="84"
            height="84"
            rx="4"
            fill={
              item.shape === 'square' && item.fill !== 'outline'
                ? item.fillColor || 'var(--accent)'
                : 'none'
            }
            stroke="var(--accent)"
            strokeWidth="4"
          />
          {item.shape === 'circle' && (
            <circle
              cx="50"
              cy="50"
              r="42"
              fill={item.fill !== 'outline' ? item.fillColor || 'var(--accent)' : 'none'}
              stroke="var(--accent)"
              strokeWidth="4"
            />
          )}
          {item.shape === 'triangle' && (
            <polygon
              points="50,8 92,90 8,90"
              fill={item.fill !== 'outline' ? item.fillColor || 'var(--accent)' : 'none'}
              stroke="var(--accent)"
              strokeWidth="4"
              strokeLinejoin="round"
            />
          )}
          {item.shape === 'diamond' && (
            <polygon
              points="50,6 94,50 50,94 6,50"
              fill={item.fill !== 'outline' ? item.fillColor || 'var(--accent)' : 'none'}
              stroke="var(--accent)"
              strokeWidth="4"
              strokeLinejoin="round"
            />
          )}
          {item.shape === 'hexagon' && (
            <polygon
              points="25,8 75,8 96,50 75,92 25,92 4,50"
              fill={item.fill !== 'outline' ? item.fillColor || 'var(--accent)' : 'none'}
              stroke="var(--accent)"
              strokeWidth="4"
              strokeLinejoin="round"
            />
          )}
        </svg>
        {resize}
      </div>
    )
  const markdown = DOMPurify.sanitize(marked.parse(item.text || ''))
  const markdownContent = (
    <div className="markdown-content" dangerouslySetInnerHTML={{ __html: markdown }} />
  )
  const markdownEditor = (className, placeholder) =>
    item.editing ? (
      <textarea
        className={className}
        value={item.text}
        placeholder={placeholder}
        autoFocus
        onBlur={() => onChange(item.id, { editing: false }, false)}
        onChange={(event) => onChange(item.id, { text: event.target.value })}
      />
    ) : (
      <button
        type="button"
        className="markdown-preview"
        onClick={() => onChange(item.id, { editing: true }, false)}
      >
        {markdownContent}
      </button>
    )
  if (item.type === 'sticky')
    content = (
      <div
        className={`widget-body sticky ${item.color || 'yellow'}`}
        style={{ background: colors[item.color] }}
      >
        <h3>{item.title || 'Note'}</h3>
        {markdownEditor('sticky-text', 'Write a note in Markdown...')}
      </div>
    )
  if (item.type === 'text')
    content = (
      <div className="widget-body text-card">
        {markdownEditor('', 'Write your idea in Markdown...')}
      </div>
    )
  if (item.type === 'image')
    content = (
      <div className="widget-body image-card">
        <img src={item.src} alt={item.name || 'Imported image'} />
      </div>
    )
  if (item.type === 'video')
    content = (
      <div className="widget-body video-card">
        <video src={item.src} controls />
      </div>
    )
  if (item.type === 'html')
    content = (
      <div className="widget-body html-card">
        <div className="html-label">
          <FileCode2 size={12} /> {item.name}
        </div>
        <iframe title={item.name} src={item.src} sandbox="allow-scripts" />
      </div>
    )
  if (item.type === 'stroke')
    return (
      <div
        {...common}
        className={`canvas-object stroke-object ${selected ? 'selected' : ''}`}
        onPointerDown={(event) => {
          common.onPointerDown(event)
          onDrag(event, item)
        }}
      >
        <svg className="stroke" viewBox={`0 0 ${item.w} ${item.h}`}>
          <path
            style={{ strokeWidth: item.strokeWidth || 4 }}
            d={item.points
              .map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`)
              .join(' ')}
          />
        </svg>
        {resize}
      </div>
    )
  return (
    <div
      {...common}
      onPointerDown={(event) => {
        common.onPointerDown(event)
        onDrag(event, item)
      }}
    >
      <div className="object-card">
        <div className="widget-titlebar" onPointerDown={(event) => onDrag(event, item)}>
          <span>{item.name || item.title || item.type}</span>
          <button
            type="button"
            aria-label="Close widget"
            title="Close widget"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation()
              onRemove(item.id)
            }}
          >
            <X size={13} />
          </button>
        </div>
        {content}
      </div>
      {resize}
    </div>
  )
}

function LegacyToolbar({
  tool,
  setTool,
  strokeWidth,
  setStrokeWidth,
  undo,
  redo,
  canUndo,
  canRedo
}) {
  const tools = [
    { id: 'select', icon: BoxSelect, label: 'Select (V)' },
    { id: 'hand', icon: Hand, label: 'Pan canvas (H)' },
    { id: 'text', icon: Type, label: 'Text (T)' },
    { id: 'sticky', icon: StickyNote, label: 'Sticky note (N)' },
    { id: 'pen', icon: Pencil, label: 'Pen (P)' },
    { id: 'connector', icon: Link2, label: 'Connect (L)' }
  ]
  return (
    <div className="toolbar">
      {tools.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          className={`tool-button ${tool === id ? 'active' : ''}`}
          title={label}
          onClick={() => setTool(id)}
        >
          <Icon size={17} />
        </button>
      ))}
      <label className="stroke-control" title="Stroke width">
        <Pencil size={14} />
        <select
          value={strokeWidth}
          onChange={(event) => setStrokeWidth(Number(event.target.value))}
        >
          <option value="2">Fine</option>
          <option value="4">Regular</option>
          <option value="7">Bold</option>
          <option value="11">Heavy</option>
        </select>
      </label>
      <div className="toolbar-divider" />
      <button
        className="tool-button"
        title="Import image, video, or file"
        onClick={() => setTool('image')}
      >
        <ImagePlus size={17} />
      </button>
      <button className="tool-button" title="Undo" disabled={!canUndo} onClick={undo}>
        <Undo2 size={17} />
      </button>
      <button className="tool-button" title="Redo" disabled={!canRedo} onClick={redo}>
        <Redo2 size={17} />
      </button>
    </div>
  )
}

function DockDropZones({ onDrop }) {
  const drop = (position) => (event) => {
    event.preventDefault()
    if (event.dataTransfer.getData('text/plain') === 'toolbar-dock') onDrop(position)
  }
  return (
    <div className="dock-drop-zones">
      <div
        className="dock-drop-zone dock-drop-top"
        onDragOver={(event) => event.preventDefault()}
        onDrop={drop('top')}
      >
        Top
      </div>
      <div
        className="dock-drop-zone dock-drop-right"
        onDragOver={(event) => event.preventDefault()}
        onDrop={drop('right')}
      >
        Right
      </div>
      <div
        className="dock-drop-zone dock-drop-bottom"
        onDragOver={(event) => event.preventDefault()}
        onDrop={drop('bottom')}
      >
        Bottom
      </div>
      <div
        className="dock-drop-zone dock-drop-left"
        onDragOver={(event) => event.preventDefault()}
        onDrop={drop('left')}
      >
        Left
      </div>
    </div>
  )
}

function Toolbar({
  dockPosition,
  onDockDragStart,
  onDockDragEnd,
  tool,
  setTool,
  strokeWidth,
  setStrokeWidth,
  undo,
  redo,
  canUndo,
  canRedo,
  addObject
}) {
  const [shapeOpen, setShapeOpen] = useState(false)
  const [strokeOpen, setStrokeOpen] = useState(false)
  const shapes = [
    { id: 'square', label: 'Square', icon: Square },
    { id: 'circle', label: 'Circle', icon: Circle },
    { id: 'triangle', label: 'Triangle', icon: Triangle },
    { id: 'hexagon', label: 'Hexagon', icon: Hexagon },
    { id: 'diamond', label: 'Diamond', icon: Diamond }
  ]
  return (
    <div className={'toolbar dock-' + dockPosition}>
      <button
        className="dock-handle"
        draggable="true"
        title="Drag to move dock"
        onDragStart={(event) => {
          event.dataTransfer.setData('text/plain', 'toolbar-dock')
          onDockDragStart()
        }}
        onDragEnd={onDockDragEnd}
      >
        <span aria-hidden="true">::</span>
      </button>
      <button
        className={`tool-button ${tool === 'select' ? 'active' : ''}`}
        title="Select (V)"
        onClick={() => setTool('select')}
      >
        <BoxSelect size={17} />
      </button>
      <button
        className={`tool-button ${tool === 'hand' ? 'active' : ''}`}
        title="Pan canvas (H)"
        onClick={() => setTool('hand')}
      >
        <Hand size={17} />
      </button>
      <button
        className={`tool-button ${tool === 'text' ? 'active' : ''}`}
        title="Text (T)"
        onClick={() => setTool('text')}
      >
        <Type size={17} />
      </button>
      <button
        className={`tool-button ${tool === 'sticky' ? 'active' : ''}`}
        title="Sticky note (N)"
        onClick={() => setTool('sticky')}
      >
        <StickyNote size={17} />
      </button>
      <button
        className={`tool-button ${tool === 'pen' ? 'active' : ''}`}
        title="Pen (P)"
        onClick={() => setTool('pen')}
      >
        <Pencil size={17} />
      </button>
      <div className="toolbar-menu">
        <button
          className="tool-button"
          title="Shapes"
          onClick={() => setShapeOpen((value) => !value)}
        >
          <Shapes size={17} />
        </button>
        {shapeOpen && (
          <div className="toolbar-menu-panel">
            {shapes.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  addObject('shape', { shape: id, fill: 'solid', name: label })
                  setShapeOpen(false)
                }}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="toolbar-menu">
        <button
          className="tool-button"
          title="Stroke width"
          onClick={() => setStrokeOpen((value) => !value)}
        >
          <Pencil size={17} />
        </button>
        {strokeOpen && (
          <div className="toolbar-menu-panel">
            <label>
              Stroke width
              <select
                className="menu-select"
                value={strokeWidth}
                onChange={(event) => {
                  setStrokeWidth(Number(event.target.value))
                  setStrokeOpen(false)
                }}
              >
                <option value="2">Fine</option>
                <option value="4">Regular</option>
                <option value="7">Bold</option>
                <option value="11">Heavy</option>
              </select>
            </label>
          </div>
        )}
      </div>
      <div className="toolbar-divider" />
      <button
        className="tool-button"
        title="Import image, video, or file"
        onClick={() => setTool('image')}
      >
        <ImagePlus size={17} />
      </button>
      <button className="tool-button" title="Undo" disabled={!canUndo} onClick={undo}>
        <Undo2 size={17} />
      </button>
      <button className="tool-button" title="Redo" disabled={!canRedo} onClick={redo}>
        <Redo2 size={17} />
      </button>
    </div>
  )
}

function ExportMenu({ onExport, onExportJson, compact = false }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  useEffect(() => {
    const close = (event) => {
      if (!menuRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])
  function choose(action) {
    setOpen(false)
    action()
  }
  return (
    <div
      ref={menuRef}
      className={`export-menu ${compact ? 'compact' : ''}`}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        className={compact ? 'icon-button' : 'nav-item'}
        title="Export board"
        onClick={() => setOpen((value) => !value)}
      >
        {compact ? (
          <Download size={17} />
        ) : (
          <>
            <Download size={16} />
            <span>Export</span>
          </>
        )}
      </button>
      {open && (
        <div className="export-popover">
          <button onClick={() => choose(onExport)}>
            <FileArchive size={16} />
            <span>
              <strong>.brainshake</strong>
              <small>Includes local media when supported</small>
            </span>
          </button>
          <div className="export-note">External URLs and non-base64 media may not be bundled.</div>
          <button onClick={() => choose(onExportJson)}>
            <FileText size={16} />
            <span>
              <strong>.json</strong>
              <small>Compact, without media</small>
            </span>
          </button>
        </div>
      )}
    </div>
  )
}

function LegacyProperties({
  item,
  accent,
  setAccent,
  theme,
  setTheme,
  grid,
  setGrid,
  onClose,
  onChange
}) {
  return (
    <div className="floating-panel">
      <div className="panel-heading">
        <span>
          <PanelRight size={14} /> Properties
        </span>
        <button className="icon-button" title="Close properties" onClick={onClose}>
          <X size={14} />
        </button>
      </div>
      {item ? (
        <>
          <div className="panel-row">
            <span>Type</span>
            <strong>{item.type}</strong>
          </div>
          <div className="panel-row">
            <span>Position</span>
            <span>
              {Math.round(item.x)} × {Math.round(item.y)}
            </span>
          </div>
          <div className="panel-row">
            <span>Size</span>
            <span>
              {Math.round(item.w)} × {Math.round(item.h)}
            </span>
          </div>
          {item.type === 'sticky' && (
            <div className="panel-row">
              <span>Note color</span>
              <div className="color-row">
                {Object.keys(colors).map((color) => (
                  <button
                    key={color}
                    className={`color-swatch ${item.color === color ? 'active' : ''}`}
                    style={{ background: colors[color] }}
                    onClick={() => onChange(item.id, { color })}
                    aria-label={`${color} color`}
                  />
                ))}
              </div>
            </div>
          )}
          <button
            className="nav-item"
            style={{ padding: 0, marginTop: 8, color: 'var(--accent)' }}
            onClick={() => onChange(item.id, { locked: !item.locked })}
          >
            {item.locked ? 'Unlock object' : 'Lock object'}
          </button>
        </>
      ) : (
        <p style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.5 }}>
          Select an item to edit its properties.
        </p>
      )}
      <div className="panel-row">
        <span>Dock position</span>
        <select
          className="menu-select"
          value={dockPosition}
          onChange={(event) => setDockPosition(event.target.value)}
        >
          <option value="top">Top</option>
          <option value="right">Right</option>
          <option value="bottom">Bottom</option>
          <option value="left">Left</option>
        </select>
      </div>
      <div className="panel-row" style={{ marginTop: 8 }}>
        <span>Grid</span>
        <button
          className="nav-item"
          style={{
            padding: '0 7px',
            minHeight: 25,
            background: grid ? 'var(--accent-soft)' : 'var(--line)'
          }}
          onClick={() => setGrid((value) => !value)}
        >
          {grid ? 'On' : 'Off'}
        </button>
      </div>
      <div className="panel-row">
        <span>Theme</span>
        <select value={theme} onChange={(event) => setTheme(event.target.value)}>
          <option value="light">Light</option>
          <option value="warm">Warm</option>
          <option value="mint">Mint</option>
          <option value="dark">Dark</option>
          <option value="oled">OLED</option>
        </select>
      </div>
      <div className="panel-row">
        <span>Accent</span>
        <div className="color-row">
          {['#d86e50', '#577d6a', '#50739a', '#8a6b9f', '#c58a44'].map((color) => (
            <button
              key={color}
              className={`color-swatch ${accent === color ? 'active' : ''}`}
              style={{ background: color }}
              onClick={() => setAccent(color)}
              aria-label="Choose accent color"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function Properties({
  item,
  accent,
  setAccent,
  theme,
  setTheme,
  grid,
  setGrid,
  dockPosition,
  setDockPosition,
  onClose,
  onChange
}) {
  const accents = [
    '#d86e50',
    '#577d6a',
    '#50739a',
    '#8a6b9f',
    '#c58a44',
    '#d1495b',
    '#2a9d8f',
    '#e76f51',
    '#264653',
    '#6c757d'
  ]
  const updateNumber = (key, event) => onChange(item.id, { [key]: Number(event.target.value) || 0 })
  return (
    <div className="floating-panel">
      <div className="panel-heading">
        <span>
          <PanelRight size={14} /> Properties
        </span>
        <button className="icon-button" title="Close properties" onClick={onClose}>
          <X size={14} />
        </button>
      </div>
      {item ? (
        <>
          <div className="panel-row">
            <span>Type</span>
            <strong>{item.type}</strong>
          </div>
          <div className="panel-row">
            <span>Position</span>
            <div className="property-pair">
              <input
                className="property-input"
                type="number"
                value={Math.round(item.x)}
                onChange={(event) => updateNumber('x', event)}
                aria-label="X position"
              />
              <input
                className="property-input"
                type="number"
                value={Math.round(item.y)}
                onChange={(event) => updateNumber('y', event)}
                aria-label="Y position"
              />
            </div>
          </div>
          <div className="panel-row">
            <span>Size</span>
            <div className="property-pair">
              <input
                className="property-input"
                type="number"
                value={Math.round(item.w)}
                onChange={(event) => updateNumber('w', event)}
                aria-label="Width"
              />
              <input
                className="property-input"
                type="number"
                value={Math.round(item.h)}
                onChange={(event) => updateNumber('h', event)}
                aria-label="Height"
              />
            </div>
          </div>
          {item.type === 'sticky' && (
            <div className="panel-row">
              <span>Note color</span>
              <div className="color-row">
                {Object.keys(colors).map((color) => (
                  <button
                    key={color}
                    className={`color-swatch ${item.color === color ? 'active' : ''}`}
                    style={{ background: colors[color] }}
                    onClick={() => onChange(item.id, { color })}
                    aria-label={`${color} color`}
                  />
                ))}
              </div>
            </div>
          )}
          {item.type === 'shape' && (
            <div className="panel-row">
              <span>Fill</span>
              <select
                className="menu-select"
                value={item.fill || 'solid'}
                onChange={(event) => onChange(item.id, { fill: event.target.value })}
              >
                <option value="solid">Solid</option>
                <option value="outline">Outline</option>
              </select>
            </div>
          )}
          <button
            className="nav-item"
            style={{ padding: 0, marginTop: 8, color: 'var(--accent)' }}
            onClick={() => onChange(item.id, { locked: !item.locked })}
          >
            {item.locked ? 'Unlock object' : 'Lock object'}
          </button>
        </>
      ) : (
        <p style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.5 }}>
          Select an item to edit its properties.
        </p>
      )}
      <div className="panel-row" style={{ marginTop: 8 }}>
        <span>Grid</span>
        <button
          className="nav-item"
          style={{
            padding: '0 7px',
            minHeight: 25,
            background: grid ? 'var(--accent-soft)' : 'var(--line)'
          }}
          onClick={() => setGrid((value) => !value)}
        >
          {grid ? 'On' : 'Off'}
        </button>
      </div>
      <div className="panel-row">
        <span>Theme</span>
        <select
          className="menu-select"
          value={theme}
          onChange={(event) => setTheme(event.target.value)}
        >
          <option value="light">Light</option>
          <option value="warm">Warm</option>
          <option value="mint">Mint</option>
          <option value="dark">Dark</option>
          <option value="oled">OLED</option>
        </select>
      </div>
      <div className="panel-row">
        <span>Accent</span>
        <div className="color-row accent-colors">
          {accents.map((color) => (
            <button
              key={color}
              className={`color-swatch ${accent === color ? 'active' : ''}`}
              style={{ background: color }}
              onClick={() => setAccent(color)}
              aria-label="Choose accent color"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function UrlDialog({ onClose, onSubmit }) {
  const [url, setUrl] = useState('')
  return (
    <div className="url-dialog" role="dialog" aria-label="Add image URL">
      <div className="panel-heading">
        <span>
          <Link2 size={14} /> Add image URL
        </span>
        <button className="icon-button" title="Close" onClick={onClose}>
          <X size={14} />
        </button>
      </div>
      <input
        className="url-input"
        autoFocus
        value={url}
        placeholder="https://example.com/image.jpg"
        onChange={(event) => setUrl(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onSubmit(url)
        }}
      />
      <div className="dialog-actions">
        <button className="dialog-button secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="dialog-button primary" onClick={() => onSubmit(url)}>
          Add image
        </button>
      </div>
    </div>
  )
}

function ContextMenu({ position, hasSelection, onDuplicate, onDelete, onCopy, onFront }) {
  if (!hasSelection) return null
  return (
    <div
      className="context-menu"
      style={{ left: position.x, top: position.y }}
      onClick={(event) => event.stopPropagation()}
    >
      <button onClick={onDuplicate}>
        <Copy size={14} /> Duplicate
      </button>
      <button onClick={onCopy}>
        <Copy size={14} /> Copy
      </button>
      <button onClick={onFront}>
        <ArrowUpToLine size={14} /> Bring to front
      </button>
      <button onClick={onDelete} style={{ color: '#b2553c' }}>
        <Trash2 size={14} /> Delete
      </button>
    </div>
  )
}

function MaximizeIcon() {
  return <span style={{ fontSize: 15, lineHeight: 1 }}>⛶</span>
}

export default App
