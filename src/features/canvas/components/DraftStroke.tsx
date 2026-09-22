import type { CanvasItem, Point } from '@/features/board/types'
import { strokePath } from '../objects/StrokeObject'

// Pen stroke being drawn, before it is committed to the board.
export function DraftStroke({
  drawing,
  strokeWidth
}: {
  drawing: CanvasItem & { points: Point[] }
  strokeWidth: number
}) {
  return (
    <svg
      className="stroke"
      style={{ position: 'absolute', left: drawing.x, top: drawing.y, width: 500, height: 500 }}
    >
      <path style={{ strokeWidth }} d={strokePath(drawing.points)} />
    </svg>
  )
}
