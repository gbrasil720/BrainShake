import type { usePreferences } from '@/features/preferences/usePreferences'
import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

const STEPS = [
  'Font Size',
  'High Contrast',
  'Reduce Motion',
  'Keyboard Navigation',
  'Customize & Present'
]

export function AccessibilityTour({
  isOpen,
  preferences,
  onClose
}: {
  isOpen: boolean
  preferences: ReturnType<typeof usePreferences>
  onClose: () => void
}) {
  const [step, setStep] = useState(0)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    dialogRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button, select, input')
        if (!focusable?.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null
  const isLast = step === STEPS.length - 1

  return (
    <div
      className="tour-backdrop"
      role="presentation"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className="tour-dialog"
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
      >
        <div className="tour-heading">
          <div>
            <span className="tour-progress">
              Accessibility · {step + 1} / {STEPS.length}
            </span>
            <h2 id="tour-title">{STEPS[step]}</h2>
          </div>
          <button
            className="icon-button"
            title="Close accessibility tour"
            aria-label="Close accessibility tour"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>
        <div className="tour-content">
          {step === 0 && <FontStep preferences={preferences} />}
          {step === 1 && <ContrastStep preferences={preferences} />}
          {step === 2 && <MotionStep preferences={preferences} />}
          {step === 3 && <KeyboardStep preferences={preferences} />}
          {step === 4 && <CustomizeStep />}
        </div>
        <div className="tour-actions">
          <button
            className="nav-item"
            disabled={step === 0}
            onClick={() => setStep((value) => value - 1)}
          >
            Back
          </button>
          <button
            className="nav-item active"
            onClick={() =>
              isLast
                ? (preferences.setTutorialCompleted(true), onClose())
                : setStep((value) => value + 1)
            }
          >
            {isLast ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}

function FontStep({ preferences }: { preferences: ReturnType<typeof usePreferences> }) {
  return (
    <div className="tour-demo-card">
      <p>Adjust the text scale and see the interface respond immediately.</p>
      <div className="tour-font-actions">
        <button className="nav-item" onClick={() => preferences.setFontSize('small')}>
          A−
        </button>
        <button className="nav-item active" onClick={() => preferences.setFontSize('default')}>
          Default
        </button>
        <button className="nav-item" onClick={() => preferences.setFontSize('large')}>
          A+
        </button>
      </div>
      <strong className="tour-sample-text">Readable workspace text</strong>
    </div>
  )
}

function ContrastStep({ preferences }: { preferences: ReturnType<typeof usePreferences> }) {
  return (
    <div className="tour-demo-card">
      <p>Increase separation between surfaces, borders and text.</p>
      <button
        className="segmented-toggle"
        aria-pressed={preferences.highContrast}
        onClick={() => preferences.setHighContrast((value) => !value)}
      >
        {preferences.highContrast ? 'High contrast on' : 'Turn on high contrast'}
      </button>
      <div className="tour-contrast-sample">
        <span>Selected item</span>
        <span>Secondary label</span>
      </div>
    </div>
  )
}

function MotionStep({ preferences }: { preferences: ReturnType<typeof usePreferences> }) {
  return (
    <div className="tour-demo-card">
      <p>Reduce Motion keeps feedback visible while removing distracting movement.</p>
      <button
        className="segmented-toggle"
        aria-pressed={preferences.reduceMotion}
        onClick={() => preferences.setReduceMotion((value) => !value)}
      >
        {preferences.reduceMotion ? 'Reduce motion on' : 'Reduce motion off'}
      </button>
      <div className={`tour-motion-sample ${preferences.reduceMotion ? 'reduced' : ''}`} />
    </div>
  )
}

function KeyboardStep({ preferences }: { preferences: ReturnType<typeof usePreferences> }) {
  return (
    <div className="tour-demo-card">
      <p>Use Tab to reach controls, Enter to activate them and Escape to leave an overlay.</p>
      <button
        className="segmented-toggle"
        aria-pressed={preferences.keyboardNavigation}
        onClick={() => preferences.setKeyboardNavigation((value) => !value)}
      >
        {preferences.keyboardNavigation ? 'Keyboard navigation on' : 'Keyboard navigation off'}
      </button>
      <div className="tour-keyboard-hint">
        <kbd>Tab</kbd>
        <span>→</span>
        <kbd>Enter</kbd>
        <span>→</span>
        <kbd>Escape</kbd>
      </div>
    </div>
  )
}

function CustomizeStep() {
  return (
    <div className="tour-demo-card">
      <p>
        Use the Customize tab in the sidebar to change themes, accent colors, auto-hide and each
        interface surface.
      </p>
      <p>
        Mark selected objects as slides from the dock, then open Presentation mode from the header.
        Marked widgets show an asterisk.
      </p>
    </div>
  )
}
