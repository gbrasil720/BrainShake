import type { useBoardEditor } from '@/features/board/hooks/useBoardEditor'
import { useState } from 'react'
import { BoxSelect, Hand, ImagePlus, Pencil, Redo2, StickyNote, Type, Undo2 } from 'lucide-react'
import { DOCK_DRAG_TYPE, DockDropZones } from './DockDropZones'
import { ShapeMenu } from './ShapeMenu'
import { StrokeMenu } from './StrokeMenu'

const TOOLS = [
  { id: 'select', icon: BoxSelect, label: 'Select (V)' },
  { id: 'hand', icon: Hand, label: 'Pan canvas (H)' },
  { id: 'text', icon: Type, label: 'Text (T)' },
  { id: 'sticky', icon: StickyNote, label: 'Sticky note (N)' },
  { id: 'pen', icon: Pencil, label: 'Pen (P)' }
]

export function Toolbar({
  editor,
  dockPosition,
  onDockChange,
  onImportFiles
}: {
  editor: ReturnType<typeof useBoardEditor>
  dockPosition: string
  onDockChange: (position: string) => void
  onImportFiles: () => void
}) {
  const [dockDragging, setDockDragging] = useState(false)
  const { tool, setTool } = editor
  return (
    <>
      {dockDragging && (
        <DockDropZones
          onDrop={(position) => {
            onDockChange(position)
            setDockDragging(false)
          }}
        />
      )}
      <div className={'toolbar dock-' + dockPosition}>
        <button
          className="dock-handle"
          draggable="true"
          title="Drag to move dock"
          onDragStart={(event) => {
            event.dataTransfer.setData('text/plain', DOCK_DRAG_TYPE)
            setDockDragging(true)
          }}
          onDragEnd={() => setDockDragging(false)}
        >
          <span aria-hidden="true">::</span>
        </button>
        {TOOLS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className={`tool-button ${tool === id ? 'active' : ''}`}
            title={label}
            onClick={() => setTool(id)}
          >
            <Icon size={17} />
          </button>
        ))}
        <ShapeMenu
          onPick={(shape, label) =>
            editor.addObject('shape', { shape, fill: 'solid', name: label })
          }
        />
        <StrokeMenu value={editor.strokeWidth} onChange={editor.setStrokeWidth} />
        <div className="toolbar-divider" />
        <button
          className="tool-button"
          title="Import image, video, or file"
          onClick={onImportFiles}
        >
          <ImagePlus size={17} />
        </button>
        <button
          className="tool-button"
          title="Undo"
          disabled={!editor.canUndo}
          onClick={editor.undo}
        >
          <Undo2 size={17} />
        </button>
        <button
          className="tool-button"
          title="Redo"
          disabled={!editor.canRedo}
          onClick={editor.redo}
        >
          <Redo2 size={17} />
        </button>
      </div>
    </>
  )
}
