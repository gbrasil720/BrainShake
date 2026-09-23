import { ContextMenuContent, ContextMenuItem } from '@/components/ui/context-menu'
import { ArrowUpToLine, Copy, Link2, Trash2, Unlink } from 'lucide-react'

export function ContextMenu({
  onDuplicate,
  onDelete,
  onCopy,
  onFront,
  onLink,
  onUnlink,
  canUnlink
}: {
  onDuplicate: () => void
  onDelete: () => void
  onCopy: () => void
  onFront: () => void
  onLink: () => void
  onUnlink: () => void
  canUnlink: boolean
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
      <ContextMenuItem onSelect={onLink}>
        <Link2 size={14} /> Link elements
      </ContextMenuItem>
      <ContextMenuItem disabled={!canUnlink} onSelect={onUnlink}>
        <Unlink size={14} /> Unlink elements
      </ContextMenuItem>
      <ContextMenuItem variant="destructive" onSelect={onDelete}>
        <Trash2 size={14} /> Delete
      </ContextMenuItem>
    </ContextMenuContent>
  )
}
