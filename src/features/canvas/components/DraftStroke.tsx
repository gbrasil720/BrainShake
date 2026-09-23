import type { Drawing } from '../hooks/useCanvasPointer'
import { strokePath } from '../objects/StrokeObject'

// Pen stroke being drawn, before it is committed to the board. Once it snaps to a
// shape, the shape is drawn over a faded copy of the freehand stroke.
export function DraftStroke({ drawing, strokeWidth }: { drawing: Drawing; strokeWidth: number }) {
  const { snapped } = drawing
  return (
    <svg
      className="stroke"
      style={{ position: 'absolute', left: drawing.x, top: drawing.y, width: 1, height: 1 }}
    >
      <path
        style={{ strokeWidth, opacity: snapped ? 0.25 : undefined }}
        d={strokePath(drawing.points)}
      />
      {snapped && <path style={{ strokeWidth }} d={strokePath(snapped.points)} />}
    </svg>
  )
}
