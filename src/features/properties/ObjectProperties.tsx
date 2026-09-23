import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
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
        <Input
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
              <Button
                variant="ghost"
                key={color}
                className={`color-swatch ${item.color === color ? 'active' : ''}`}
                style={{ background: (STICKY_COLORS as Record<string, string>)[color] }}
                onClick={() => onChange(item.id, { color, fillColor: undefined })}
                aria-label={`${color} color`}
              />
            ))}
          </div>
        </div>
      )}
      {(item.type === 'shape' || item.type === 'sticky') && (
        <div className="panel-row">
          <span>{item.type === 'sticky' ? 'Note fill' : 'Fill'}</span>
          <div className="property-color-control">
            <input
              type="color"
              value={item.fillColor || '#ffffff'}
              aria-label="Fill HEX color"
              onChange={(event) => onChange(item.id, { fillColor: event.target.value })}
            />
            <Input
              className="property-color-hex"
              value={item.fillColor || ''}
              placeholder="#HEX"
              pattern="^#[0-9a-fA-F]{6}$"
              aria-label="Fill HEX color"
              onChange={(event) => {
                const value = event.target.value
                if (/^#[0-9a-fA-F]{0,6}$/.test(value)) onChange(item.id, { fillColor: value })
              }}
            />
          </div>
          {item.type === 'shape' && (
            <Select
              value={item.fill || 'solid'}
              onValueChange={(fill) => onChange(item.id, { fill })}
            >
              <SelectTrigger className="menu-select" aria-label="Fill style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="outline">Outline</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      )}
      {item.type === 'stroke' && (
        <div className="panel-row">
          <span>Stroke color</span>
          <div className="property-color-control">
            <input
              type="color"
              value={item.strokeColor || '#536b5d'}
              aria-label="Stroke HEX color"
              onChange={(event) => onChange(item.id, { strokeColor: event.target.value })}
            />
            <Input
              className="property-color-hex"
              value={item.strokeColor || ''}
              placeholder="#HEX"
              pattern="^#[0-9a-fA-F]{6}$"
              aria-label="Stroke HEX color"
              onChange={(event) => {
                const value = event.target.value
                if (/^#[0-9a-fA-F]{0,6}$/.test(value)) onChange(item.id, { strokeColor: value })
              }}
            />
          </div>
        </div>
      )}
      <Button
        variant="ghost"
        className="nav-item"
        style={{ padding: 0, marginTop: 8, color: 'var(--primary)' }}
        onClick={() => onChange(item.id, { locked: !item.locked })}
      >
        {item.locked ? 'Unlock object' : 'Lock object'}
      </Button>
    </>
  )
}
