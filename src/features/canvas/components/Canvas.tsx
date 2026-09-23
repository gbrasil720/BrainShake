import type { useBoardEditor } from '@/features/board/hooks/useBoardEditor'
import type { useViewport } from '@/features/canvas/hooks/useViewport'
import type { useCanvasPointer } from '@/features/canvas/hooks/useCanvasPointer'
import type { BoardPatch } from '@/features/board/types'
import { isCanvasItem } from '@/features/board/types'
import { ContextMenu as ShadcnContextMenu, ContextMenuTrigger } from '@/components/ui/context-menu'
import { useState } from 'react'
import { CanvasObject } from '../objects/CanvasObject'
import { ConnectorLayer } from './ConnectorLayer'
import { DraftStroke } from './DraftStroke'
import { DropOverlay } from './DropOverlay'
import { EmptyState } from './EmptyState'
import { ContextMenu } from './ContextMenu'

export function Canvas({
  editor,
  viewport,
  pointer,
  grid,
  onImportFiles
}: {
  editor: ReturnType<typeof useBoardEditor>
  viewport: ReturnType<typeof useViewport>
  pointer: ReturnType<typeof useCanvasPointer>
  grid: boolean
  onImportFiles: (files: FileList | File[]) => void
}) {
  const [dropActive, setDropActive] = useState(false)
  const { board, selected, strokeWidth } = editor
  const { canvasRef, onWheel, zoom, pan } = viewport
  const contentObjects = board.objects.filter(isCanvasItem)
  return (
    <ShadcnContextMenu modal={false}>
      <ContextMenuTrigger asChild disabled={selected.length === 0}>
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
            if (!selected.length) event.preventDefault()
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
      </ContextMenuTrigger>
      {selected.length > 0 && (
        <ContextMenu
          onDuplicate={editor.duplicateSelection}
          onDelete={editor.removeSelection}
          onCopy={editor.copySelection}
          onFront={editor.bringSelectionToFront}
        />
      )}
    </ShadcnContextMenu>
  )
}
