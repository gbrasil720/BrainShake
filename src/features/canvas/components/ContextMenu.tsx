import { ContextMenuContent, ContextMenuItem } from '@/components/ui/context-menu'
import { ArrowUpToLine, Copy, Trash2 } from 'lucide-react'

export function ContextMenu({
  onDuplicate,
  onDelete,
  onCopy,
  onFront
}: {
  onDuplicate: () => void
  onDelete: () => void
  onCopy: () => void
  onFront: () => void
}) {
  return (
    <ContextMenuContent className="context-menu">
      <ContextMenuItem onSelect={onDuplicate}>
        <Copy size={14} /> Duplicate
      </ContextMenuItem>
      <ContextMenuItem onSelect={onCopy}>
        <Copy size={14} /> Copy
      </ContextMenuItem>
      <ContextMenuItem onSelect={onFront}>
        <ArrowUpToLine size={14} /> Bring to front
      </ContextMenuItem>
      <ContextMenuItem variant="destructive" onSelect={onDelete}>
        <Trash2 size={14} /> Delete
      </ContextMenuItem>
    </ContextMenuContent>
  )
}
