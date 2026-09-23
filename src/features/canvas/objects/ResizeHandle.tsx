import type React from 'react'
import type { CanvasItem } from '@/features/board/types'
export function ResizeHandle({
  item,
  onResize
}: {
  item: CanvasItem
  onResize: (event: React.PointerEvent<HTMLDivElement>, item: CanvasItem) => void
}) {
  const directions = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
  return (
    <>
      {directions.map((direction) => (
        <div
          key={direction}
          className={`resize-handle resize-${direction}`}
          data-direction={direction}
          onPointerDown={(event) => {
            event.stopPropagation()
            onResize(event, item)
          }}
        />
      ))}
    </>
  )
}
