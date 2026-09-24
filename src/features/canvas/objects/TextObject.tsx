import type { BoardPatch, CanvasItem } from '@/features/board/types'
import { MarkdownEditor } from './MarkdownEditor'

export function TextObject({
  item,
  onChange,
  selected
}: {
  item: CanvasItem
  onChange: (id: string, patch: BoardPatch, saveHistory?: boolean) => void
  selected?: boolean
}) {
  return (
    <div
      className="text-object-content"
      style={{
        color: item.textColor,
        fontFamily: item.fontFamily || undefined,
        fontSize: `${item.fontSize || 18}px`
      }}
    >
      <MarkdownEditor
        item={item}
        className="text-object-editor"
        placeholder="Write your idea in Markdown..."
        onChange={onChange}
      />
      {selected && <TextFormatTooltip item={item} onChange={onChange} />}
    </div>
  )
}

function TextFormatTooltip({
  item,
  onChange
}: {
  item: CanvasItem
  onChange: (id: string, patch: BoardPatch, saveHistory?: boolean) => void
}) {
  return (
    <div className="text-format-tooltip" onPointerDown={(event) => event.stopPropagation()}>
      <label title="Text color">
        <input
          type="color"
          value={item.textColor || '#1d1d1f'}
          aria-label="Text color"
          onChange={(event) => onChange(item.id, { textColor: event.target.value })}
        />
      </label>
      <select
        className="text-font-input"
        value={item.fontFamily || 'Lexend'}
        aria-label="Font family"
        onChange={(event) => onChange(item.id, { fontFamily: event.target.value })}
      >
        <option value="Lexend">Lexend</option>
        <option value="DM Sans">DM Sans</option>
        <option value="Space Grotesk">Space Grotesk</option>
        <option value="JetBrains Mono NF">JetBrains Mono NF</option>
        <option value="Comic Sans MS">Comic Sans MS</option>
        <option value="Text">Text</option>
        <option value="Papirus">Papirus</option>
        <option value="Georgia">Georgia</option>
        <option value="Courier New">Courier New</option>
        <option value="Arial">Arial</option>
      </select>
      <input
        className="text-size-input"
        type="number"
        min="8"
        max="160"
        value={item.fontSize || 18}
        aria-label="Font size in pixels"
        onChange={(event) =>
          onChange(item.id, {
            fontSize: Math.min(160, Math.max(8, Number(event.target.value) || 8))
          })
        }
      />
    </div>
  )
}
