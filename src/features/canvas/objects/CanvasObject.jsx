import { getObjectType } from './registry.js'
import { ResizeHandle } from './ResizeHandle.jsx'
import { WidgetFrame } from './WidgetFrame.jsx'

// Positions an object on the board and wires selection, drag and resize.
// The object body comes from the registry.
export function CanvasObject({ item, selected, onSelect, onDrag, onResize, onChange, onRemove }) {
  const { Component, framed, className } = getObjectType(item.type)
  const content = Component && <Component item={item} onChange={onChange} />
  return (
    <div
      className={['canvas-object', className, selected ? 'selected' : ''].filter(Boolean).join(' ')}
      style={{ left: item.x, top: item.y, width: item.w, height: item.h }}
      onPointerDown={(event) => {
        onSelect(event, item)
        onDrag(event, item)
      }}
      onDoubleClick={(event) => {
        event.stopPropagation()
        onChange(item.id, { editing: true })
      }}
    >
      {framed ? (
        <WidgetFrame item={item} onDrag={onDrag} onRemove={onRemove}>
          {content}
        </WidgetFrame>
      ) : (
        content
      )}
      {selected && <ResizeHandle item={item} onResize={onResize} />}
    </div>
  )
}
