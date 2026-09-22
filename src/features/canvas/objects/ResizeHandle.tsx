import type React from 'react'
import type { CanvasItem } from '@/features/board/types'
export function ResizeHandle({
  item,
  onResize
}: {
  item: CanvasItem
  onResize: (event: React.PointerEvent<HTMLDivElement>, item: CanvasItem) => void
}) {
  return <div className="resize-handle" onPointerDown={(event) => onResize(event, item)} />
}
