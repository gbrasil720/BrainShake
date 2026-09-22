import { MarkdownEditor } from './MarkdownEditor.jsx'

export function TextObject({ item, onChange }) {
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
