import type { usePreferences } from '@/features/preferences/usePreferences'
import { ACCENTS, THEMES } from '@/features/board/lib/constants'

export function AppearanceSettings({
  preferences
}: {
  preferences: ReturnType<typeof usePreferences>
}) {
  const { grid, setGrid, theme, setTheme, accent, setAccent } = preferences
  return (
    <>
      <div className="panel-row" style={{ marginTop: 8 }}>
        <span>Grid</span>
        <button
          className="nav-item"
          style={{
            padding: '0 7px',
            minHeight: 25,
            background: grid ? 'var(--primary-soft)' : 'var(--line)'
          }}
          onClick={() => setGrid((value) => !value)}
        >
          {grid ? 'On' : 'Off'}
        </button>
      </div>
      <div className="panel-row">
        <span>App dock</span>
        <select
          className="menu-select"
          value={preferences.dockPosition}
          onChange={(event) => preferences.setDockPosition(event.target.value)}
        >
          <option value="top">Top</option>
          <option value="right">Right</option>
          <option value="bottom">Bottom</option>
          <option value="left">Left</option>
        </select>
      </div>
      <div className="panel-row">
        <span>Dock auto-hide</span>
        <button
          className="nav-item"
          style={{
            padding: '0 7px',
            minHeight: 25,
            background: preferences.dockAutoHide ? 'var(--primary-soft)' : 'var(--line)'
          }}
          onClick={() => preferences.setDockAutoHide((value) => !value)}
        >
          {preferences.dockAutoHide ? 'On' : 'Off'}
        </button>
      </div>
      <div className="panel-row">
        <span>Sidebar auto-hide</span>
        <button
          className="nav-item"
          style={{
            padding: '0 7px',
            minHeight: 25,
            background: preferences.sidebarAutoHide ? 'var(--primary-soft)' : 'var(--line)'
          }}
          onClick={() => preferences.setSidebarAutoHide((value) => !value)}
        >
          {preferences.sidebarAutoHide ? 'On' : 'Off'}
        </button>
      </div>
      <div className="panel-row">
        <span>Theme</span>
        <select
          className="menu-select"
          value={theme}
          onChange={(event) => setTheme(event.target.value)}
        >
          {THEMES.map(({ id, label }) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="panel-row">
        <span>Accent</span>
        <div className="color-row accent-colors">
          {ACCENTS.map((color) => (
            <button
              key={color}
              className={`color-swatch ${accent === color ? 'active' : ''}`}
              style={{ background: color }}
              onClick={() => setAccent(color)}
              aria-label="Choose accent color"
            />
          ))}
          <label className="accent-picker" title="Choose custom accent color">
            <input
              type="color"
              value={accent}
              aria-label="Choose custom accent color"
              onChange={(event) => setAccent(event.target.value)}
            />
          </label>
          <input
            className="accent-hex-input"
            value={accent}
            aria-label="Accent HEX color"
            pattern="^#[0-9a-fA-F]{6}$"
            onChange={(event) => {
              const value = event.target.value
              if (/^#[0-9a-fA-F]{0,6}$/.test(value)) setAccent(value)
            }}
          />
        </div>
      </div>
    </>
  )
}
