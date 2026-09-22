import { useState } from 'react'
import { Shapes } from 'lucide-react'
import { SHAPES } from '@/features/board/lib/constants.js'

export function ShapeMenu({ onPick }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="toolbar-menu">
      <button className="tool-button" title="Shapes" onClick={() => setOpen((value) => !value)}>
        <Shapes size={17} />
      </button>
      {open && (
        <div className="toolbar-menu-panel">
          {SHAPES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                onPick(id, label)
                setOpen(false)
              }}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
