import { Button } from '@/components/ui/button'
import type { usePreferences } from '@/features/preferences/usePreferences'
import { AccessibilitySettings } from '@/features/accessibility/AccessibilitySettings'
import { AppearanceSettings } from '@/features/properties/AppearanceSettings'

export function SidebarSettings({
  preferences,
  onOpenTour
}: {
  preferences: ReturnType<typeof usePreferences>
  onOpenTour: () => void
}) {
  return (
    <div className="sidebar-settings">
      <div className="sidebar-settings-heading">
        <span className="section-label">Customize</span>
        <span className="sidebar-settings-note">Interface</span>
      </div>
      <AppearanceSettings preferences={preferences} />
      <div className="custom-colors">
        <p className="settings-group-label">Interface colors</p>
        <ColorRow
          label="Header"
          value={preferences.headerColor}
          fallback="var(--paper)"
          onChange={preferences.setHeaderColor}
        />
        <ColorRow
          label="Sidebar"
          value={preferences.sidebarColor}
          fallback="var(--paper)"
          onChange={preferences.setSidebarColor}
        />
        <ColorRow
          label="Canvas"
          value={preferences.canvasColor}
          fallback="var(--surface)"
          onChange={preferences.setCanvasColor}
        />
        <ColorRow
          label="Panels"
          value={preferences.panelColor}
          fallback="var(--paper)"
          onChange={preferences.setPanelColor}
        />
      </div>
      <AccessibilitySettings preferences={preferences} onOpenTour={onOpenTour} />
    </div>
  )
}

function ColorRow({
  label,
  value,
  fallback,
  onChange
}: {
  label: string
  value: string
  fallback: string
  onChange: (value: string) => void
}) {
  return (
    <label className="custom-color-row">
      <span>{label}</span>
      <input
        type="color"
        value={value || '#ffffff'}
        onChange={(event) => onChange(event.target.value)}
      />
      <code style={{ color: value || fallback }}>{value || 'Theme default'}</code>
      {value && (
        <Button variant="ghost" type="button" onClick={() => onChange('')}>
          Reset
        </Button>
      )}
    </label>
  )
}
