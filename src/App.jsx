import { useEffect, useRef, useState } from 'react'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { CoffeeIcon, GithubIcon } from './AnimatedIcons.jsx'
import {
  ACCENTS,
  SHAPES,
  STICKY_COLORS,
  STROKE_WIDTHS,
  THEMES
} from '@/features/board/lib/constants.js'
import { useBoardEditor } from '@/features/board/hooks/useBoardEditor.js'
import { useViewport } from '@/features/canvas/hooks/useViewport.js'
import { useCanvasPointer } from '@/features/canvas/hooks/useCanvasPointer.js'
import { useKeyboardShortcuts } from '@/features/canvas/hooks/useKeyboardShortcuts.js'
import { useImportExport } from '@/features/import-export/hooks/useImportExport.js'
import { usePreferences } from '@/features/preferences/usePreferences.js'
import { useToast } from '@/hooks/useToast.js'
import {
  ArrowUpToLine,
  BoxSelect,
  Check,
  Copy,
  Download,
  FileArchive,
  FileCode2,
  FileText,
  Hand,
  ImagePlus,
  Link2,
  Maximize,
  Minus,
  PanelRight,
  Pencil,
  Plus,
  Redo2,
  Settings2,
  Shapes,
  StickyNote,
  Trash2,
  Type,
  Undo2,
  Upload,
  X,
  Zap
} from 'lucide-react'

function App() {
  const [toast, setToast] = useToast()
  const { theme, setTheme, accent, setAccent, dockPosition, setDockPosition, grid, setGrid } =
    usePreferences()
  const viewport = useViewport()
  const { zoom, pan, canvasRef, onWheel, zoomIn, zoomOut } = viewport
  const editor = useBoardEditor({ viewport, showToast: setToast })
  const {
    boards,
    board,
    renameBoard,
    switchBoard,
    createBoard,
    deleteBoard,
    undo,
    redo,
    canUndo,
    canRedo,
    selected,
    setSelected,
    tool,
    setTool,
    strokeWidth,
    setStrokeWidth,
    addObject,
    updateObject,
    removeObject,
    removeSelection,
    duplicateSelection,
    copySelection,
    bringSelectionToFront
  } = editor
  const pointer = useCanvasPointer({ editor, viewport })
  const { dragging, drawing, selectObject, beginDrag, beginResize } = pointer
  const transfer = useImportExport({ editor, showToast: setToast })
  const [context, setContext] = useState(null)
  const [dropActive, setDropActive] = useState(false)
  const [showPanel, setShowPanel] = useState(true)
  const [dockDragging, setDockDragging] = useState(false)
  const fileRef = useRef(null)
  const boardFileRef = useRef(null)

  useKeyboardShortcuts({
    undo,
    redo,
    selectAll: editor.selectAll,
    copy: copySelection,
    paste: editor.pasteSelection,
    remove: removeSelection,
    cancel: () => {
      setSelected([])
      setTool('select')
      setContext(null)
    },
    setTool
  })

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
            onChange={(event) => renameBoard(event.target.value)}
          />
        </div>
        <div className="top-actions">
          <span className="save-state">
            <i className="save-dot" /> Saved locally
          </span>
          <ExportMenu
            onExport={transfer.exportAsBrainshake}
            onExportJson={transfer.exportAsJson}
            compact
          />
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
          <button className="nav-item" onClick={transfer.openUrlDialog}>
            <Link2 size={16} />
            <span>Import image URL</span>
          </button>
          <ExportMenu onExport={transfer.exportAsBrainshake} onExportJson={transfer.exportAsJson} />
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
          onPointerDown={pointer.onPointerDown}
          onPointerMove={pointer.onPointerMove}
          onPointerUp={pointer.onPointerUp}
          onPointerCancel={pointer.onPointerUp}
          onDragOver={(event) => {
            event.preventDefault()
            setDropActive(true)
          }}
          onDragLeave={() => setDropActive(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDropActive(false)
            transfer.importFiles(event.dataTransfer.files)
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
                onRemove={removeObject}
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
          canUndo={canUndo}
          canRedo={canRedo}
          addObject={addObject}
        />
        <div className="zoom-controls">
          <button className="icon-button" title="Zoom out" onClick={zoomOut}>
            <Minus size={15} />
          </button>
          <span className="zoom-value">{Math.round(zoom * 100)}%</span>
          <button className="icon-button" title="Zoom in" onClick={zoomIn}>
            <Plus size={15} />
          </button>
          <button
            className="icon-button"
            title="Fit content"
            onClick={() => viewport.fitContent(board.objects.length > 0)}
          >
            <Maximize size={15} />
          </button>
        </div>
        {showPanel && (
          <Properties
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
            onFront={bringSelectionToFront}
          />
        )}
        {transfer.urlOpen && (
          <UrlDialog onClose={transfer.closeUrlDialog} onSubmit={transfer.submitImageUrl} />
        )}
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
            transfer.importFiles(event.target.files)
            event.target.value = ''
          }}
        />
        <input
          ref={boardFileRef}
          type="file"
          hidden
          accept="application/json,application/zip,.json,.brainshake,.brainshake.json"
          onChange={(event) => {
            if (event.target.files[0]) transfer.importBoardFile(event.target.files[0])
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
        style={{ background: STICKY_COLORS[item.color] }}
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
            {SHAPES.map(({ id, label, icon: Icon }) => (
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
                {STROKE_WIDTHS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
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

function Properties({
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
                {Object.keys(STICKY_COLORS).map((color) => (
                  <button
                    key={color}
                    className={`color-swatch ${item.color === color ? 'active' : ''}`}
                    style={{ background: STICKY_COLORS[color] }}
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
          {THEMES.map(({ id, label }) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="panel-row">
        <span>Accent</span>
        <div className="color-row accent-colors">
          {ACCENTS.map((color) => (
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

export default App
