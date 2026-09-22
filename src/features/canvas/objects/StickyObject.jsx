import { STICKY_COLORS } from '@/features/board/lib/constants.js'
import { MarkdownEditor } from './MarkdownEditor.jsx'

export function StickyObject({ item, onChange }) {
  return (
    <div
      className={`widget-body sticky ${item.color || 'yellow'}`}
      style={{ background: STICKY_COLORS[item.color] }}
    >
      <h3>{item.title || 'Note'}</h3>
      <MarkdownEditor
        item={item}
        className="sticky-text"
        placeholder="Write a note in Markdown..."
        onChange={onChange}
      />
    </div>
  )
}
