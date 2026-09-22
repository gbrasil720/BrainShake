import type { BoardPatch, CanvasItem } from '@/features/board/types'
import { MarkdownEditor } from './MarkdownEditor'

export function TextObject({
  item,
  onChange
}: {
  item: CanvasItem
  onChange: (id: string, patch: BoardPatch, saveHistory?: boolean) => void
}) {
  return (
    <div className="widget-body text-card">
      <MarkdownEditor
        item={item}
        className=""
        placeholder="Write your idea in Markdown..."
        onChange={onChange}
      />
    </div>
  )
}
