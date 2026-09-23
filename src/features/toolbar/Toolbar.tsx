import { Button } from '@/components/ui/button'
import type { useBoardEditor } from '@/features/board/hooks/useBoardEditor'
import { useState } from 'react'
import {
  BoxSelect,
  Hand,
  ImagePlus,
  Pencil,
  Presentation,
  Redo2,
  StickyNote,
  Type,
  Undo2
} from 'lucide-react'
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
  onImportFiles,
  autoHide,
  onToggleSlides
}: {
  editor: ReturnType<typeof useBoardEditor>
  dockPosition: string
  onDockChange: (position: string) => void
  onImportFiles: () => void
  autoHide: boolean
  onToggleSlides: () => void
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
      <div className={`toolbar dock-${dockPosition} ${autoHide ? 'toolbar-auto-hide' : ''}`}>
        <Button
          variant="ghost"
          className="dock-handle"
          draggable="true"
          title="Drag to move dock"
          onDragStart={(event) => {
            event.dataTransfer.setData('text/plain', DOCK_DRAG_TYPE)
            event.dataTransfer.effectAllowed = 'move'
            setDockDragging(true)
          }}
          onDragEnd={() => setDockDragging(false)}
        >
          <span aria-hidden="true">::</span>
        </Button>
        {TOOLS.map(({ id, icon: Icon, label }) => (
          <Button
            variant="ghost"
            key={id}
            className={`tool-button ${tool === id ? 'active' : ''}`}
            title={label}
            onClick={() => setTool(id)}
          >
            <Icon size={17} />
          </Button>
        ))}
        <ShapeMenu
          dockPosition={dockPosition}
          onPick={(shape, label) =>
            editor.addObject('shape', { shape, fill: 'solid', name: label })
          }
        />
        <StrokeMenu
          value={editor.strokeWidth}
          onChange={editor.setStrokeWidth}
          dockPosition={dockPosition}
        />
        <Button
          variant="ghost"
          className={`tool-button ${editor.selected.length ? '' : 'disabled'}`}
          title="Add or remove selected items from presentation"
          aria-label="Add or remove selected items from presentation"
          disabled={!editor.selected.length}
          onClick={onToggleSlides}
        >
          <Presentation size={17} />
        </Button>
        <div className="toolbar-divider" />
        <Button
          variant="ghost"
          className="tool-button"
          title="Import image, video, or file"
          onClick={onImportFiles}
        >
          <ImagePlus size={17} />
        </Button>
        <Button
          variant="ghost"
          className="tool-button"
          title="Undo"
          disabled={!editor.canUndo}
          onClick={editor.undo}
        >
          <Undo2 size={17} />
        </Button>
        <Button
          variant="ghost"
          className="tool-button"
          title="Redo"
          disabled={!editor.canRedo}
          onClick={editor.redo}
        >
          <Redo2 size={17} />
        </Button>
      </div>
    </>
  )
}
