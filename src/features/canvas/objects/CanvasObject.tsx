import { memo } from 'react'
import type React from 'react'
import { getObjectType } from './registry'
import { ResizeHandle } from './ResizeHandle'
import { WidgetFrame } from './WidgetFrame'
import type { BoardPatch, CanvasItem } from '@/features/board/types'

// Positions an object on the board and wires selection, drag and resize.
// The object body comes from the registry.
export const CanvasObject = memo(function CanvasObject({
  item,
  selected,
  activeTool,
  presentingActive,
  onSelect,
  onDrag,
  onResize,
  onChange,
  onRemove
}: {
  item: CanvasItem
  selected: boolean
  activeTool: string
  presentingActive: boolean
  onSelect: (event: React.PointerEvent<HTMLDivElement>, item: CanvasItem) => void
  onDrag: (event: React.PointerEvent<HTMLDivElement>, item: CanvasItem) => void
  onResize: (event: React.PointerEvent<HTMLDivElement>, item: CanvasItem) => void
  onChange: (id: string, patch: BoardPatch, saveHistory?: boolean) => void
  onRemove: (id: string) => void
}) {
  const { Component, framed, className } = getObjectType(item.type)
  const content = Component && <Component item={item} onChange={onChange} selected={selected} />
  return (
    <div
      className={[
        'canvas-object',
        className,
        selected && activeTool !== 'pen' ? 'selected' : '',
        presentingActive ? 'is-presenting-active' : ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ left: item.x, top: item.y, width: item.w, height: item.h }}
      onPointerDown={(event) => {
        if (activeTool === 'pen') return
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
        <>
          {content}
          {item.slide && (
            <span className="slide-marker" aria-label="Included in presentation">
              {item.slideOrder}
            </span>
          )}
        </>
      )}
      {selected && activeTool === 'select' && !item.locked && (
        <ResizeHandle item={item} onResize={onResize} />
      )}
    </div>
  )
})
