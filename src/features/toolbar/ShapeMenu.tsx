import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Shapes } from 'lucide-react'
import { SHAPES } from '@/features/board/lib/constants'

export function ShapeMenu({
  onPick,
  dockPosition
}: {
  onPick: (shape: string, label: string) => void
  dockPosition: string
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="tool-button" title="Shapes">
          <Shapes size={17} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={dockPosition === 'top' ? 'bottom' : dockPosition === 'bottom' ? 'top' : 'right'}
        sideOffset={10}
        className="toolbar-menu-panel"
      >
        {SHAPES.map(({ id, label, icon: Icon }) => (
          <DropdownMenuItem key={id} onSelect={() => onPick(id, label)}>
            <Icon size={15} /> {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
