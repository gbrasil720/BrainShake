import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Pencil } from 'lucide-react'
import { STROKE_WIDTHS } from '@/features/board/lib/constants'
import { useState } from 'react'

export function StrokeMenu({
  value,
  onChange,
  dockPosition
}: {
  value: number
  onChange: (value: number) => void
  dockPosition: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="tool-button" title="Stroke width">
          <Pencil size={17} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side={dockPosition === 'top' ? 'bottom' : dockPosition === 'bottom' ? 'top' : 'right'}
        sideOffset={10}
        className="toolbar-menu-panel"
      >
        <label>
          Stroke width
          <Select
            value={String(value)}
            onValueChange={(next) => {
              onChange(Number(next))
              setOpen(false)
            }}
          >
            <SelectTrigger className="menu-select" aria-label="Stroke width">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STROKE_WIDTHS.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </PopoverContent>
    </Popover>
  )
}
