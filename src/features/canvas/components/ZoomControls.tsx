import { Maximize, Minus, Plus } from 'lucide-react'

export function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onFit
}: {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onFit: () => void
}) {
  return (
    <div className="zoom-controls">
      <button className="icon-button" title="Zoom out" onClick={onZoomOut}>
        <Minus size={15} />
      </button>
      <span className="zoom-value">{Math.round(zoom * 100)}%</span>
      <button className="icon-button" title="Zoom in" onClick={onZoomIn}>
        <Plus size={15} />
      </button>
      <button className="icon-button" title="Fit content" onClick={onFit}>
        <Maximize size={15} />
      </button>
    </div>
  )
}
