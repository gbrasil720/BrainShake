import { ACCENTS, THEMES } from '@/features/board/lib/constants.js'

export function AppearanceSettings({ preferences }) {
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
        </div>
      </div>
    </>
  )
}
