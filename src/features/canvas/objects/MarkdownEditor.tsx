import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import type { BoardPatch, CanvasItem } from '@/features/board/types'

// Markdown text: a sanitized preview, or a textarea while `item.editing` is set.
export function MarkdownEditor({
  item,
  className,
  placeholder,
  onChange
}: {
  item: CanvasItem
  className?: string
  placeholder?: string
  onChange: (id: string, patch: BoardPatch, saveHistory?: boolean) => void
}) {
  if (item.editing)
    return (
      <Textarea
        className={className}
        value={item.text}
        placeholder={placeholder}
        autoFocus
        onBlur={() => onChange(item.id, { editing: false }, false)}
        onChange={(event) => onChange(item.id, { text: event.target.value })}
      />
    )
  const html = DOMPurify.sanitize(marked.parse(item.text || '', { async: false }))
  return (
    <Button
      variant="ghost"
      type="button"
      className="markdown-preview"
      onClick={() => onChange(item.id, { editing: true }, false)}
    >
      <div className="markdown-content" dangerouslySetInnerHTML={{ __html: html }} />
    </Button>
  )
}
