const POSITIONS = [
  { id: 'top', label: 'Top' },
  { id: 'right', label: 'Right' },
  { id: 'bottom', label: 'Bottom' },
  { id: 'left', label: 'Left' }
]

export const DOCK_DRAG_TYPE = 'toolbar-dock'

export function DockDropZones({ onDrop }) {
  const drop = (position) => (event) => {
    event.preventDefault()
    if (event.dataTransfer.getData('text/plain') === DOCK_DRAG_TYPE) onDrop(position)
  }
  return (
    <div className="dock-drop-zones">
      {POSITIONS.map(({ id, label }) => (
        <div
          key={id}
          className={`dock-drop-zone dock-drop-${id}`}
          onDragOver={(event) => event.preventDefault()}
          onDrop={drop(id)}
        >
          {label}
        </div>
      ))}
    </div>
  )
}
