import { strokePath } from '../objects/StrokeObject.jsx'

// Pen stroke being drawn, before it is committed to the board.
export function DraftStroke({ drawing, strokeWidth }) {
  return (
    <svg
      className="stroke"
      style={{ position: 'absolute', left: drawing.x, top: drawing.y, width: 500, height: 500 }}
    >
      <path style={{ strokeWidth }} d={strokePath(drawing.points)} />
    </svg>
  )
}
