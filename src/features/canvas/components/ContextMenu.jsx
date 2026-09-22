import { ArrowUpToLine, Copy, Trash2 } from 'lucide-react'

export function ContextMenu({ position, onDuplicate, onDelete, onCopy, onFront }) {
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
