import { useState } from 'react'
import { CanvasObject } from '../objects/CanvasObject.jsx'
import { ConnectorLayer } from './ConnectorLayer.jsx'
import { DraftStroke } from './DraftStroke.jsx'
import { DropOverlay } from './DropOverlay.jsx'
import { EmptyState } from './EmptyState.jsx'

export function Canvas({ editor, viewport, pointer, grid, onImportFiles, onContextMenu }) {
  const [dropActive, setDropActive] = useState(false)
  const { board, selected, strokeWidth } = editor
  const { canvasRef, onWheel, zoom, pan } = viewport
  const contentObjects = board.objects.filter((item) => item.type !== 'connector')
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
            onChange={(id, patch) => editor.updateObject(id, patch, false)}
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
