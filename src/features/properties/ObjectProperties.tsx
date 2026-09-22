import { STICKY_COLORS } from '@/features/board/lib/constants'
import type { BoardItem, BoardPatch, CanvasItem } from '@/features/board/types'
import { isCanvasItem } from '@/features/board/types'

type OnChange = (id: string, patch: BoardPatch, saveHistory?: boolean) => void

function NumberPair({
  item,
  keys,
  labels,
  onChange
}: {
  item: CanvasItem
  keys: ('x' | 'y' | 'w' | 'h')[]
  labels: string[]
  onChange: OnChange
}) {
  return (
    <div className="property-pair">
      {keys.map((key, index) => (
        <input
          key={key}
          className="property-input"
          type="number"
          value={Math.round(item[key])}
          onChange={(event) => onChange(item.id, { [key]: Number(event.target.value) || 0 })}
          aria-label={labels[index]}
        />
      ))}
    </div>
  )
}

export function ObjectProperties({ item, onChange }: { item?: BoardItem; onChange: OnChange }) {
  if (!item || !isCanvasItem(item))
    return (
      <p style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.5 }}>
        Select an item to edit its properties.
      </p>
    )
  return (
    <>
      <div className="panel-row">
        <span>Type</span>
        <strong>{item.type}</strong>
      </div>
      <div className="panel-row">
        <span>Position</span>
        <NumberPair
          item={item}
          keys={['x', 'y']}
          labels={['X position', 'Y position']}
          onChange={onChange}
        />
      </div>
      <div className="panel-row">
        <span>Size</span>
        <NumberPair
          item={item}
          keys={['w', 'h']}
          labels={['Width', 'Height']}
          onChange={onChange}
        />
      </div>
      {item.type === 'sticky' && (
        <div className="panel-row">
          <span>Note color</span>
          <div className="color-row">
            {Object.keys(STICKY_COLORS).map((color) => (
              <button
                key={color}
                className={`color-swatch ${item.color === color ? 'active' : ''}`}
                style={{ background: (STICKY_COLORS as Record<string, string>)[color] }}
                onClick={() => onChange(item.id, { color })}
                aria-label={`${color} color`}
              />
            ))}
          </div>
        </div>
      )}
      {item.type === 'shape' && (
        <div className="panel-row">
          <span>Fill</span>
          <select
            className="menu-select"
            value={item.fill || 'solid'}
            onChange={(event) => onChange(item.id, { fill: event.target.value })}
          >
            <option value="solid">Solid</option>
            <option value="outline">Outline</option>
          </select>
        </div>
      )}
      <button
        className="nav-item"
        style={{ padding: 0, marginTop: 8, color: 'var(--primary)' }}
        onClick={() => onChange(item.id, { locked: !item.locked })}
      >
        {item.locked ? 'Unlock object' : 'Lock object'}
      </button>
    </>
  )
}
