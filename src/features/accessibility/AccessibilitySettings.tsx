import type { usePreferences } from '@/features/preferences/usePreferences'
import { Minus, Plus, RotateCcw } from 'lucide-react'
import { FONT_SIZES, normalizeColorVision, normalizeFontSize } from './accessibility'

const fontLabels = {
  small: 'Small',
  default: 'Default',
  large: 'Large',
  'extra-large': 'Extra Large'
} as const

export function AccessibilitySettings({
  preferences,
  onOpenTour
}: {
  preferences: ReturnType<typeof usePreferences>
  onOpenTour: () => void
}) {
  const fontSize = normalizeFontSize(preferences.fontSize)
  const fontIndex = FONT_SIZES.indexOf(fontSize)
  const setFontAt = (index: number) => preferences.setFontSize(FONT_SIZES[index])

  return (
    <section className="accessibility-settings" aria-labelledby="accessibility-heading">
      <div className="settings-section-heading">
        <h2 id="accessibility-heading">Accessibility</h2>
        <button className="text-button" onClick={onOpenTour}>
          Accessibility Tour
        </button>
      </div>
      <div className="settings-group">
        <p className="settings-group-label">Text</p>
        <div className="accessibility-row">
          <div>
            <strong>Font Size</strong>
            <span>Adjust text across the workspace.</span>
          </div>
          <div className="font-size-control">
            <button
              className="icon-button"
              title="Decrease font size"
              aria-label="Decrease font size"
              disabled={fontIndex === 0}
              onClick={() => setFontAt(fontIndex - 1)}
            >
              <Minus size={14} />
            </button>
            <span aria-live="polite">{fontLabels[fontSize]}</span>
            <button
              className="icon-button"
              title="Increase font size"
              aria-label="Increase font size"
              disabled={fontIndex === FONT_SIZES.length - 1}
              onClick={() => setFontAt(fontIndex + 1)}
            >
              <Plus size={14} />
            </button>
            <button
              className="icon-button"
              title="Reset font size"
              aria-label="Reset font size"
              onClick={() => preferences.setFontSize('default')}
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      </div>
      <div className="settings-group">
        <p className="settings-group-label">Visual</p>
        <ToggleRow
          label="High Contrast"
          description="Increase contrast between text and surfaces."
          value={preferences.highContrast}
          onChange={() => preferences.setHighContrast((value) => !value)}
        />
        <div className="accessibility-row">
          <div>
            <strong>Color Vision</strong>
            <span>Preview color differences more clearly.</span>
          </div>
          <select
            className="menu-select"
            aria-label="Color vision mode"
            value={normalizeColorVision(preferences.colorVision)}
            onChange={(event) =>
              preferences.setColorVision(normalizeColorVision(event.target.value))
            }
          >
            <option value="none">Off</option>
            <option value="protanopia">Protanopia</option>
            <option value="deuteranopia">Deuteranopia</option>
            <option value="tritanopia">Tritanopia</option>
            <option value="achromatopsia">Achromatopsia</option>
          </select>
        </div>
        <ToggleRow
          label="Reduce Motion"
          description="Reduce animation and transition intensity."
          value={preferences.reduceMotion}
          onChange={() => preferences.setReduceMotion((value) => !value)}
        />
      </div>
      <div className="settings-group">
        <p className="settings-group-label">Navigation</p>
        <ToggleRow
          label="Keyboard Navigation"
          description="Enable keyboard shortcuts and tool switching."
          value={preferences.keyboardNavigation}
          onChange={() => preferences.setKeyboardNavigation((value) => !value)}
        />
        <ToggleRow
          label="Enhanced Focus"
          description="Make the active keyboard focus easier to see."
          value={preferences.enhancedFocus}
          onChange={() => preferences.setEnhancedFocus((value) => !value)}
        />
      </div>
      {preferences.tutorialCompleted && (
        <button className="accessibility-tour-link" onClick={onOpenTour}>
          Replay Tutorial
        </button>
      )}
    </section>
  )
}

function ToggleRow({
  label,
  description,
  value,
  onChange
}: {
  label: string
  description: string
  value: boolean
  onChange: () => void
}) {
  return (
    <div className="accessibility-row">
      <div>
        <strong>{label}</strong>
        <span>{description}</span>
      </div>
      <button
        className={`segmented-toggle ${value ? 'on' : ''}`}
        aria-pressed={value}
        onClick={onChange}
      >
        {value ? 'On' : 'Off'}
      </button>
    </div>
  )
}
