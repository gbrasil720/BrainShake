import type { BoardPatch, BoardItem } from '@/features/board/types'
import type { usePreferences } from '@/features/preferences/usePreferences'
import { PanelRight, X } from 'lucide-react'
import { AppearanceSettings } from './AppearanceSettings'
import { ObjectProperties } from './ObjectProperties'

export function PropertiesPanel({
  item,
  onChange,
  preferences,
  onClose
}: {
  item?: BoardItem
  onChange: (id: string, patch: BoardPatch, saveHistory?: boolean) => void
  preferences: ReturnType<typeof usePreferences>
  onClose: () => void
}) {
  return (
    <div className="floating-panel">
      <div className="panel-heading">
        <span>
          <PanelRight size={14} /> Properties
        </span>
        <button className="icon-button" title="Close properties" onClick={onClose}>
          <X size={14} />
        </button>
      </div>
      <ObjectProperties item={item} onChange={onChange} />
      <AppearanceSettings preferences={preferences} />
    </div>
  )
}
