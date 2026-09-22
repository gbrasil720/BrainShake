import { useState } from 'react'
import { Link2, X } from 'lucide-react'

export function ImageUrlDialog({
  onClose,
  onSubmit
}: {
  onClose: () => void
  onSubmit: (url: string) => void
}) {
  const [url, setUrl] = useState('')
  return (
    <div className="url-dialog" role="dialog" aria-label="Add image URL">
      <div className="panel-heading">
        <span>
          <Link2 size={14} /> Add image URL
        </span>
        <button className="icon-button" title="Close" onClick={onClose}>
          <X size={14} />
        </button>
      </div>
      <input
        className="url-input"
        autoFocus
        value={url}
        placeholder="https://example.com/image.jpg"
        onChange={(event) => setUrl(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onSubmit(url)
        }}
      />
      <div className="dialog-actions">
        <button className="dialog-button secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="dialog-button primary" onClick={() => onSubmit(url)}>
          Add image
        </button>
      </div>
    </div>
  )
}
