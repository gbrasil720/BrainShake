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
        fontSize: item.fontSize ? `${item.fontSize}px` : undefined
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
          value={item.textColor || '#242a28'}
          aria-label="Text color"
          onChange={(event) => onChange(item.id, { textColor: event.target.value })}
        />
      </label>
      <input
        className="text-font-input"
        list={`text-font-options-${item.id}`}
        value={item.fontFamily || 'DM Sans'}
        aria-label="Font family"
        onChange={(event) => onChange(item.id, { fontFamily: event.target.value })}
      />
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
      <datalist id={`text-font-options-${item.id}`}>
        <option value="DM Sans" />
        <option value="Space Grotesk" />
        <option value="Georgia" />
        <option value="Courier New" />
        <option value="Arial" />
      </datalist>
    </div>
  )
}
