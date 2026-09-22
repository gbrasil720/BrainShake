import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { STROKE_WIDTHS } from '@/features/board/lib/constants.js'

export function StrokeMenu({ value, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="toolbar-menu">
      <button
        className="tool-button"
        title="Stroke width"
        onClick={() => setOpen((current) => !current)}
      >
        <Pencil size={17} />
      </button>
      {open && (
        <div className="toolbar-menu-panel">
          <label>
            Stroke width
            <select
              className="menu-select"
              value={value}
              onChange={(event) => {
                onChange(Number(event.target.value))
                setOpen(false)
              }}
            >
              {STROKE_WIDTHS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  )
}
