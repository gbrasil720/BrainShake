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
import { ACCENTS, THEMES } from '@/features/board/lib/constants'

const VISIBLE_ACCENTS = 4

export function AppearanceSettings({
  preferences
}: {
  preferences: ReturnType<typeof usePreferences>
}) {
  const [showAllAccents, setShowAllAccents] = useState(false)
  const { grid, setGrid, theme, setTheme, accent, setAccent } = preferences
  const accents = showAllAccents ? ACCENTS : ACCENTS.slice(0, VISIBLE_ACCENTS)

  return (
    <>
      <section className="customize-section" aria-labelledby="appearance-heading">
        <h2 id="appearance-heading" className="customize-section-title">
          Appearance
        </h2>
        <div className="customize-row">
          <label htmlFor="theme-select">Theme</label>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger id="theme-select" className="customize-select" aria-label="Theme">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THEMES.map(({ id, label }) => (
                <SelectItem key={id} value={id}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="customize-row customize-accent-row">
          <span>Accent</span>
          <div className="customize-accent-controls">
            <div className="accent-swatches" role="group" aria-label="Accent color">
              {accents.map((color) => (
                <Button
                  variant="ghost"
                  key={color}
                  className={`color-swatch ${accent === color ? 'active' : ''}`}
                  style={{ background: color }}
                  onClick={() => setAccent(color)}
                  aria-label={`Choose ${color} accent color`}
                  aria-pressed={accent === color}
                />
              ))}
              <label className="custom-accent-picker" title="Choose a custom accent color">
                <span aria-hidden="true">+</span>
                <input
                  type="color"
                  value={accent}
                  aria-label="Choose custom accent color"
                  onChange={(event) => setAccent(event.target.value)}
                />
              </label>
            </div>
            {ACCENTS.length > VISIBLE_ACCENTS && (
              <Button
                variant="ghost"
                className="text-button customize-more-colors"
                onClick={() => setShowAllAccents((current) => !current)}
                aria-expanded={showAllAccents}
              >
                {showAllAccents ? 'Less' : 'More'}
              </Button>
            )}
          </div>
        </div>
        <div className="customize-row">
          <span>Show grid</span>
          <Button
            variant="ghost"
            className={`switch-control ${grid ? 'on' : ''}`}
            aria-label="Show grid"
            aria-pressed={grid}
            onClick={() => setGrid((value) => !value)}
          >
            <span />
          </Button>
        </div>
      </section>
    </>
  )
}
