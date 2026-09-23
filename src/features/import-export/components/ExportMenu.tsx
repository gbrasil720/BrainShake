import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
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
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={compact ? 'icon-button' : 'nav-item sidebar-export'}
          title="Export board"
        >
          <Download size={compact ? 17 : 16} />
          {!compact && <span>Export</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="export-popover">
        <DropdownMenuItem onSelect={onExport} className="export-option">
          <FileArchive size={16} />
          <span>
            <strong>.brainshake</strong>
            <small>Includes local media when supported</small>
          </span>
        </DropdownMenuItem>
        <div className="export-note">External URLs and non-base64 media may not be bundled.</div>
        <DropdownMenuItem onSelect={onExportJson} className="export-option">
          <FileText size={16} />
          <span>
            <strong>.json</strong>
            <small>Compact, without media</small>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
