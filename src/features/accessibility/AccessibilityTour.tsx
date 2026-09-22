import { useMemo, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, MoveRight, Sparkles, X } from 'lucide-react'
import type { usePreferences } from '@/features/preferences/usePreferences'

const TOUR_STEPS = [
  {
    id: 'font',
    title: 'Font Size',
    description: 'Resize BrainShake text and interface controls without breaking the layout.'
  },
  {
    id: 'contrast',
    title: 'High Contrast',
    description: 'Increase separation between text, panels, controls, and focus states.'
  },
  {
    id: 'color',
    title: 'Color Vision',
    description: 'Use simulation modes while keeping status information clear with text and icons.'
  },
  {
    id: 'motion',
    title: 'Reduce Motion',
    description: 'Minimize animation and transitions while preserving essential feedback.'
  },
  {
    id: 'keyboard',
    title: 'Keyboard Navigation',
    description: 'Use Tab, Enter, and Escape to move, activate, and close interface overlays.'
  }
] as const

export function AccessibilityTour({
  isOpen,
  preferences,
  onClose
}: {
  isOpen: boolean
  preferences: ReturnType<typeof usePreferences>
  onClose: () => void
}) {
  if (!isOpen) return null

  return <AccessibilityTourContent preferences={preferences} onClose={onClose} />
}

function AccessibilityTourContent({
  preferences,
  onClose
}: {
  preferences: ReturnType<typeof usePreferences>
  onClose: () => void
}) {
  const [stepIndex, setStepIndex] = useState(0)
  const { setTutorialCompleted } = preferences

  const currentStep = TOUR_STEPS[stepIndex]
  const progress = useMemo(
    () => ((stepIndex + 1) / TOUR_STEPS.length) * 100,
    [stepIndex]
  )

  function nextStep() {
    if (stepIndex === TOUR_STEPS.length - 1) {
      setTutorialCompleted(true)
      onClose()
      return
    }
    setStepIndex((index) => index + 1)
  }

  function previousStep() {
    setStepIndex((index) => Math.max(index - 1, 0))
  }

  function finishTour() {
    setTutorialCompleted(true)
    onClose()
  }

  return (
    <div className="tour-backdrop" role="dialog" aria-modal="true" aria-label="Accessibility tour">
      <div className="tour-panel" onClick={(event) => event.stopPropagation()}>
        <div className="tour-panel-header">
          <div>
            <div className="tour-kicker">Accessibility</div>
            <div className="tour-title">
              {currentStep.title} · {stepIndex + 1}/{TOUR_STEPS.length}
            </div>
          </div>
          <button className="icon-button" title="Close accessibility tour" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className="tour-progress">
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className="tour-demo">
          {currentStep.id === 'font' && (
            <div className="tour-demo-card">
              <div className="tour-demo-toolbar">
                <button className="tour-mini-button" onClick={() => preferences.setFontSize('small')}>
                  A−
                </button>
                <button
                  className="tour-mini-button active"
                  onClick={() => preferences.setFontSize('default')}
                >
                  Default
                </button>
                <button className="tour-mini-button" onClick={() => preferences.setFontSize('large')}>
                  A+
                </button>
              </div>
              <div className="tour-font-sample">
                <strong>BrainShake</strong>
                <span>{preferences.fontSize === 'default' ? 'Default view' : preferences.fontSize}</span>
              </div>
            </div>
          )}

          {currentStep.id === 'contrast' && (
            <div className="tour-demo-state">
              <div className={`tour-demo-card ${preferences.highContrast ? 'high-contrast' : ''}`}>
                <span className="tour-demo-label">Before</span>
                <div className="tour-status-row">
                  <span className="tour-state">✓ Ready</span>
                  <span className="tour-state ghost">Needs review</span>
                </div>
              </div>
              <div className="tour-demo-toggle">
                <button
                  className="segmented-toggle on"
                  onClick={() => preferences.setHighContrast((value) => !value)}
                >
                  {preferences.highContrast ? 'High Contrast On' : 'Turn on contrast'}
                </button>
              </div>
            </div>
          )}

          {currentStep.id === 'color' && (
            <div className="tour-demo-card color-demo">
              <span className="tour-demo-label">Status cues</span>
              <div className="tour-status-row">
                <span className="tour-state success">
                  <Check size={12} /> Success
                </span>
                <span className="tour-state warning">
                  <Sparkles size={12} /> Warning
                </span>
                <span className="tour-state danger">
                  <X size={12} /> Error
                </span>
              </div>
              <div className="tour-color-select">
                <label>
                  Mode
                  <select
                    className="menu-select"
                    value={preferences.colorVision}
                    onChange={(event) => preferences.setColorVision(event.target.value)}
                  >
                    <option value="none">None</option>
                    <option value="protanopia">Protanopia</option>
                    <option value="deuteranopia">Deuteranopia</option>
                    <option value="tritanopia">Tritanopia</option>
                    <option value="achromatopsia">Achromatopsia</option>
                  </select>
                </label>
              </div>
            </div>
          )}

          {currentStep.id === 'motion' && (
            <div className="tour-demo-card motion-demo">
              <span className="tour-demo-label">Motion</span>
              <button
                className={`segmented-toggle ${preferences.reduceMotion ? 'on' : ''}`}
                onClick={() => preferences.setReduceMotion((value) => !value)}
              >
                {preferences.reduceMotion ? 'Reduce motion on' : 'Reduce motion off'}
              </button>
              <div className={`pulse-demo ${preferences.reduceMotion ? 'reduced' : ''}`} />
            </div>
          )}

          {currentStep.id === 'keyboard' && (
            <div className="tour-demo-card keyboard-demo">
              <span className="tour-demo-label">Keyboard flow</span>
              <div className="tour-key-list">
                <button className="tour-key" aria-label="Tab button">
                  Tab
                </button>
                <MoveRight size={14} />
                <button className="tour-key" aria-label="Enter button">
                  Enter
                </button>
                <MoveRight size={14} />
                <button className="tour-key" aria-label="Escape button">
                  Esc
                </button>
              </div>
              <div className="tour-helper">
                Focus moves logically, opens actions, and closes overlays with Escape.
              </div>
            </div>
          )}
        </div>

        <p className="tour-copy">{currentStep.description}</p>

        <div className="tour-actions">
          <button className="dialog-button secondary" onClick={previousStep} disabled={stepIndex === 0}>
            <ChevronLeft size={14} /> Back
          </button>
          <button
            className="dialog-button primary"
            onClick={stepIndex === TOUR_STEPS.length - 1 ? finishTour : nextStep}
          >
            {stepIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
            {stepIndex !== TOUR_STEPS.length - 1 && <ChevronRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  )
}
