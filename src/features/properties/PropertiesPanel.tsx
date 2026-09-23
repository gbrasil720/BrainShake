import { Button } from '@/components/ui/button'
import type { BoardPatch, BoardItem } from '@/features/board/types'
import { PanelRight, X } from 'lucide-react'
import { ObjectProperties } from './ObjectProperties'

export function PropertiesPanel({
  item,
  onChange,
  onClose
}: {
  item?: BoardItem
  onChange: (id: string, patch: BoardPatch, saveHistory?: boolean) => void
  onClose: () => void
}) {
  return (
    <div className="floating-panel">
      <div className="panel-heading">
        <span>
          <PanelRight size={14} /> Properties
        </span>
        <Button variant="ghost" className="icon-button" title="Close properties" onClick={onClose}>
          <X size={14} />
        </Button>
      </div>
      <ObjectProperties item={item} onChange={onChange} />
    </div>
  )
}
