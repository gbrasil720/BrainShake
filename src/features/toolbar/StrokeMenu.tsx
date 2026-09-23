import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { PencilLine } from 'lucide-react'
import { STROKE_WIDTHS } from '@/features/board/lib/constants'

export function StrokeMenu({
  value,
  onChange,
  autoSnap,
  onAutoSnapChange,
  dockPosition,
  open,
  onOpenChange
}: {
  value: number
  onChange: (value: number) => void
  autoSnap: boolean
  onAutoSnapChange: (value: boolean) => void
  dockPosition: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="tool-button" title="Stroke width">
          <PencilLine size={17} />
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
              onOpenChange(false)
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
        <div className="stroke-menu-toggle">
          <span>Auto-correct shapes</span>
          <Button
            variant="ghost"
            className={`segmented-toggle ${autoSnap ? 'on' : ''}`}
            aria-pressed={autoSnap}
            onClick={() => onAutoSnapChange(!autoSnap)}
          >
            {autoSnap ? 'On' : 'Off'}
          </Button>
        </div>
        <p className="stroke-menu-hint">
          {autoSnap
            ? 'Strokes that look like a shape are cleaned up.'
            : 'Hold the pen still at the end of a stroke to clean it up.'}
        </p>
      </PopoverContent>
    </Popover>
  )
}
