import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { usePreferences } from '@/features/preferences/usePreferences'
import { AccessibilitySettings, ToggleRow } from '@/features/accessibility/AccessibilitySettings'
import { AppearanceSettings } from '@/features/properties/AppearanceSettings'

const DOCK_POSITIONS = [
  { id: 'bottom', label: 'Bottom' },
  { id: 'top', label: 'Top' },
  { id: 'left', label: 'Left' },
  { id: 'right', label: 'Right' }
]

export function SidebarSettings({
  preferences,
  onOpenTour
}: {
  preferences: ReturnType<typeof usePreferences>
  onOpenTour: () => void
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false)

  return (
    <div className="sidebar-settings">
      <div className="sidebar-settings-heading">
        <div>
          <h1>Customize</h1>
          <p>Make the workspace feel like yours.</p>
        </div>
      </div>

      <AppearanceSettings preferences={preferences} />

      <section className="customize-section" aria-labelledby="drawing-heading">
        <h2 id="drawing-heading" className="customize-section-title">
          Drawing
        </h2>
        <ToggleRow
          label="Auto-correct shapes"
          description="Smooth hand-drawn shapes and arrows."
          value={preferences.autoSnapShapes}
          onChange={() => preferences.setAutoSnapShapes((value) => !value)}
        />
      </section>

      <AccessibilitySettings preferences={preferences} onOpenTour={onOpenTour} />

      <section className="customize-section advanced-settings">
        <Button
          variant="ghost"
          className="advanced-settings-trigger"
          aria-expanded={advancedOpen}
          onClick={() => setAdvancedOpen((current) => !current)}
        >
          <span>Advanced appearance</span>
          <span aria-hidden="true" className={`disclosure-chevron ${advancedOpen ? 'open' : ''}`} />
        </Button>
        {advancedOpen && (
          <div className="advanced-settings-content">
            <div className="customize-row">
              <label htmlFor="dock-position">Toolbar position</label>
              <Select value={preferences.dockPosition} onValueChange={preferences.setDockPosition}>
                <SelectTrigger
                  id="dock-position"
                  className="customize-select"
                  aria-label="Toolbar position"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOCK_POSITIONS.map(({ id, label }) => (
                    <SelectItem key={id} value={id}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ToggleRow
              label="Auto-hide sidebar"
              value={preferences.sidebarAutoHide}
              onChange={() => preferences.setSidebarAutoHide((value) => !value)}
            />
            <p className="customize-subheading">Interface colors</p>
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
        )}
      </section>
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
    <div className="custom-color-row">
      <span>{label}</span>
      <input
        type="color"
        value={value || '#ffffff'}
        onChange={(event) => onChange(event.target.value)}
        aria-label={`${label} color`}
      />
      <code style={{ color: value || fallback }}>{value || 'Theme default'}</code>
      {value && (
        <Button variant="ghost" type="button" onClick={() => onChange('')}>
          Reset
        </Button>
      )}
    </div>
  )
}
