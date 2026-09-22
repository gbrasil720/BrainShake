import { PanelRight, X } from 'lucide-react'
import { AppearanceSettings } from './AppearanceSettings.jsx'
import { ObjectProperties } from './ObjectProperties.jsx'

export function PropertiesPanel({ item, onChange, preferences, onClose }) {
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
