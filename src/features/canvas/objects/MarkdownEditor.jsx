import DOMPurify from 'dompurify'
import { marked } from 'marked'

// Markdown text: a sanitized preview, or a textarea while `item.editing` is set.
export function MarkdownEditor({ item, className, placeholder, onChange }) {
  if (item.editing)
    return (
      <textarea
        className={className}
        value={item.text}
        placeholder={placeholder}
        autoFocus
        onBlur={() => onChange(item.id, { editing: false }, false)}
        onChange={(event) => onChange(item.id, { text: event.target.value })}
      />
    )
  const html = DOMPurify.sanitize(marked.parse(item.text || ''))
  return (
    <button
      type="button"
      className="markdown-preview"
      onClick={() => onChange(item.id, { editing: true }, false)}
    >
      <div className="markdown-content" dangerouslySetInnerHTML={{ __html: html }} />
    </button>
  )
}
