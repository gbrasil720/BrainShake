import { Button } from '@/components/ui/button'
import type { useBoardEditor } from '@/features/board/hooks/useBoardEditor'
import { useState } from 'react'
import {
  BoxSelect,
  Hand,
  ImagePlus,
  Palette,
  Pencil,
  PaintBucket,
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
  { id: 'pen', icon: Pencil, label: 'Pen (P)' },
  { id: 'fill', icon: PaintBucket, label: 'Bucket fill' }
]

export function Toolbar({
  editor,
  dockPosition,
  onDockChange,
  onImportFiles,
  onToggleSlides,
  fillColor,
  strokeColor,
  onFillColorChange,
  onStrokeColorChange
}: {
  editor: ReturnType<typeof useBoardEditor>
  dockPosition: string
  onDockChange: (position: string) => void
  onImportFiles: () => void
  onToggleSlides: () => void
  fillColor: string
  strokeColor: string
  onFillColorChange: (color: string) => void
  onStrokeColorChange: (color: string) => void
}) {
  const [dockDragging, setDockDragging] = useState(false)
  const [openMenu, setOpenMenu] = useState<'shape' | 'stroke' | null>(null)
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
      <div className={`toolbar dock-${dockPosition}`}>
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
          open={openMenu === 'shape'}
          onOpenChange={(open) => setOpenMenu(open ? 'shape' : null)}
          onPick={(shape, label) =>
            editor.addObject('shape', { shape, fill: 'solid', name: label })
          }
        />
        <StrokeMenu
          value={editor.strokeWidth}
          onChange={editor.setStrokeWidth}
          dockPosition={dockPosition}
          open={openMenu === 'stroke'}
          onOpenChange={(open) => setOpenMenu(open ? 'stroke' : null)}
        />
        <label className="dock-color-picker" title="Stroke color">
          <Palette size={15} />
          <input
            type="color"
            value={strokeColor}
            aria-label="Stroke color"
            onChange={(event) => onStrokeColorChange(event.target.value)}
          />
        </label>
        <label className="dock-color-picker" title="Bucket fill color">
          <PaintBucket size={15} />
          <input
            type="color"
            value={fillColor}
            aria-label="Bucket fill color"
            onChange={(event) => onFillColorChange(event.target.value)}
          />
        </label>
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
