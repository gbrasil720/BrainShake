import type { ReactNode } from 'react'
import type { usePreferences } from '@/features/preferences/usePreferences'
import {
  Accessibility,
  Eye,
  Keyboard,
  MousePointerClick,
  Sparkles,
  Type
} from 'lucide-react'
import {
  COLOR_VISION_OPTIONS,
  FONT_SIZE_OPTIONS,
  getFontScale,
  normalizeColorVisionMode
} from './accessibility'

const FONT_LABELS: Record<string, string> = {
  small: 'Small',
  default: 'Default',
  large: 'Large',
  'extra-large': 'Extra Large'
}

const COLOR_VISION_LABELS: Record<string, string> = {
  none: 'None',
  protanopia: 'Protanopia',
  deuteranopia: 'Deuteranopia',
  tritanopia: 'Tritanopia',
  achromatopsia: 'Achromatopsia'
}

function SettingGroup({
  title,
  icon: Icon,
  children
}: {
  title: string
  icon: typeof Type
  children: ReactNode
}) {
  return (
    <div className="accessibility-group">
      <div className="accessibility-group-label">
        <Icon size={12} />
        <span>{title}</span>
      </div>
      {children}
    </div>
  )
}

export function AccessibilitySettings({
  preferences,
  onOpenAccessibilityTour
}: {
  preferences: ReturnType<typeof usePreferences>
  onOpenAccessibilityTour: () => void
}) {
  const {
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    colorVision,
    setColorVision,
    reduceMotion,
    setReduceMotion,
    keyboardNavigation,
    setKeyboardNavigation,
    enhancedFocus,
    setEnhancedFocus,
    tutorialCompleted
  } = preferences

  const currentScale = getFontScale(fontSize)
  const fontOrder = [...FONT_SIZE_OPTIONS]
  const currentIndex = fontOrder.indexOf(fontSize as (typeof FONT_SIZE_OPTIONS)[number])
  const decrementFontSize = () => {
    const nextIndex = Math.max(currentIndex - 1, 0)
    setFontSize(fontOrder[nextIndex])
  }
  const incrementFontSize = () => {
    const nextIndex = Math.min(currentIndex + 1, fontOrder.length - 1)
    setFontSize(fontOrder[nextIndex])
  }

  return (
    <div className="accessibility-settings">
      <div className="panel-section">
        <div className="panel-section-title">
          <Accessibility size={12} />
          <span>Accessibility</span>
        </div>
        <div className="accessibility-group">
          <div className="accessibility-group-label">
            <Type size={12} />
            <span>Text</span>
          </div>
          <div className="font-size-controls">
            <button
              type="button"
              className="font-stepper"
              onClick={decrementFontSize}
              aria-label="Decrease font size"
            >
              A−
            </button>
            <div className="font-size-indicator" aria-live="polite">
              {FONT_LABELS[fontSize] ?? 'Default'}
            </div>
            <button
              type="button"
              className="font-stepper"
              onClick={incrementFontSize}
              aria-label="Increase font size"
            >
              A+
            </button>
            <button
              type="button"
              className="font-reset"
              onClick={() => setFontSize('default')}
            >
              Reset
            </button>
          </div>
          <div className="accessibility-description">
            Scale: {currentScale.toFixed(2)}× · Text, labels, and controls resize together.
          </div>
        </div>

        <SettingGroup title="Visual" icon={Sparkles}>
          <div className="accessibility-option">
            <div>
              <strong>High Contrast</strong>
              <small>Increase visual contrast between interface elements and text.</small>
            </div>
            <button
              type="button"
              className={`segmented-toggle ${highContrast ? 'on' : ''}`}
              onClick={() => setHighContrast((value) => !value)}
              aria-pressed={highContrast}
            >
              {highContrast ? 'On' : 'Off'}
            </button>
          </div>

          <div className="accessibility-option stacked">
            <div>
              <strong>Color Vision</strong>
              <small>Adjust for protanopia, deuteranopia, tritanopia, or achromatopsia.</small>
            </div>
            <select
              className="menu-select accessibility-select"
              value={normalizeColorVisionMode(colorVision)}
              onChange={(event) => setColorVision(normalizeColorVisionMode(event.target.value))}
            >
              {COLOR_VISION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {COLOR_VISION_LABELS[option]}
                </option>
              ))}
            </select>
          </div>

          <div className="accessibility-option">
            <div>
              <strong>Reduce Motion</strong>
              <small>Limit animation, transforms, and transition intensity.</small>
            </div>
            <button
              type="button"
              className={`segmented-toggle ${reduceMotion ? 'on' : ''}`}
              onClick={() => setReduceMotion((value) => !value)}
              aria-pressed={reduceMotion}
            >
              {reduceMotion ? 'On' : 'Off'}
            </button>
          </div>
        </SettingGroup>

        <SettingGroup title="Navigation" icon={Keyboard}>
          <div className="accessibility-option">
            <div>
              <strong>Keyboard Navigation</strong>
              <small>Keep focus order logical and controls usable without a mouse.</small>
            </div>
            <button
              type="button"
              className={`segmented-toggle ${keyboardNavigation ? 'on' : ''}`}
              onClick={() => setKeyboardNavigation((value) => !value)}
              aria-pressed={keyboardNavigation}
            >
              {keyboardNavigation ? 'On' : 'Off'}
            </button>
          </div>

          <div className="accessibility-option">
            <div>
              <strong>Enhanced Focus</strong>
              <small>Use stronger focus states and clearer keyboard cues.</small>
            </div>
            <button
              type="button"
              className={`segmented-toggle ${enhancedFocus ? 'on' : ''}`}
              onClick={() => setEnhancedFocus((value) => !value)}
              aria-pressed={enhancedFocus}
            >
              {enhancedFocus ? 'On' : 'Off'}
            </button>
          </div>
        </SettingGroup>
      </div>

      <div className="accessibility-actions">
        <button className="nav-item accessibility-tour-button" onClick={onOpenAccessibilityTour}>
          <Eye size={14} />
          <span>Learn about accessibility</span>
        </button>
        {tutorialCompleted && (
          <button
            className="nav-item accessibility-tour-button alt"
            onClick={onOpenAccessibilityTour}
          >
            <MousePointerClick size={14} />
            <span>Replay Tutorial</span>
          </button>
        )}
      </div>
    </div>
  )
}
