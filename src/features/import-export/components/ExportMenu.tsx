import { useEffect, useRef, useState } from 'react'
import { Download, FileArchive, FileText } from 'lucide-react'

export function ExportMenu({
  onExport,
  onExportJson,
  compact = false
}: {
  onExport: () => void | Promise<void>
  onExportJson: () => void
  compact?: boolean
}) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])
  function choose(action: () => void | Promise<void>) {
    setOpen(false)
    action()
  }
  return (
    <div
      ref={menuRef}
      className={`export-menu ${compact ? 'compact' : ''}`}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        className={compact ? 'icon-button' : 'nav-item'}
        title="Export board"
        onClick={() => setOpen((value) => !value)}
      >
        {compact ? (
          <Download size={17} />
        ) : (
          <>
            <Download size={16} />
            <span>Export</span>
          </>
        )}
      </button>
      {open && (
        <div className="export-popover">
          <button onClick={() => choose(onExport)}>
            <FileArchive size={16} />
            <span>
              <strong>.brainshake</strong>
              <small>Includes local media when supported</small>
            </span>
          </button>
          <div className="export-note">External URLs and non-base64 media may not be bundled.</div>
          <button onClick={() => choose(onExportJson)}>
            <FileText size={16} />
            <span>
              <strong>.json</strong>
              <small>Compact, without media</small>
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
