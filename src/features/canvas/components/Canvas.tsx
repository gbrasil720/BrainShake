import type { useBoardEditor } from '@/features/board/hooks/useBoardEditor'
import type { useViewport } from '@/features/canvas/hooks/useViewport'
import type { useCanvasPointer } from '@/features/canvas/hooks/useCanvasPointer'
import type { BoardPatch, Point } from '@/features/board/types'
import { isCanvasItem } from '@/features/board/types'
import { useState } from 'react'
import { CanvasObject } from '../objects/CanvasObject'
import { ConnectorLayer } from './ConnectorLayer'
import { DraftStroke } from './DraftStroke'
import { DropOverlay } from './DropOverlay'
import { EmptyState } from './EmptyState'

export function Canvas({
  editor,
  viewport,
  pointer,
  grid,
  onImportFiles,
  onContextMenu
}: {
  editor: ReturnType<typeof useBoardEditor>
  viewport: ReturnType<typeof useViewport>
  pointer: ReturnType<typeof useCanvasPointer>
  grid: boolean
  onImportFiles: (files: FileList | File[]) => void
  onContextMenu: (point: Point) => void
}) {
  const [dropActive, setDropActive] = useState(false)
  const { board, selected, strokeWidth } = editor
  const { canvasRef, onWheel, zoom, pan } = viewport
  const contentObjects = board.objects.filter(isCanvasItem)
  return (
    <div
      ref={canvasRef}
      className={`canvas-shell ${grid ? '' : 'grid-off'} ${pointer.isPanning ? 'is-panning' : ''}`}
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
        onImportFiles(event.dataTransfer.files)
      }}
      onContextMenu={(event) => {
        event.preventDefault()
        onContextMenu({ x: event.clientX, y: event.clientY })
      }}
    >
      <div
        className="canvas-world"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transition: pointer.isPanning ? 'none' : 'transform 140ms cubic-bezier(.2,.75,.25,1)'
        }}
      >
        <ConnectorLayer objects={board.objects} />
        {contentObjects.map((item) => (
          <CanvasObject
            key={item.id}
            item={item}
            selected={selected.includes(item.id)}
            onSelect={pointer.selectObject}
            onDrag={pointer.beginDrag}
            onResize={pointer.beginResize}
            onChange={(id: string, patch: BoardPatch) => editor.updateObject(id, patch, false)}
            onRemove={editor.removeObject}
          />
        ))}
        {pointer.drawing && <DraftStroke drawing={pointer.drawing} strokeWidth={strokeWidth} />}
      </div>
      {!board.objects.length && <EmptyState />}
      {dropActive && <DropOverlay />}
    </div>
  )
}
