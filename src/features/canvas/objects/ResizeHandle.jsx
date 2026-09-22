export function ResizeHandle({ item, onResize }) {
  return <div className="resize-handle" onPointerDown={(event) => onResize(event, item)} />
}
