import { Button } from '@/components/ui/button'
import type { useBoardEditor } from '@/features/board/hooks/useBoardEditor'
import type { useImportExport } from '@/features/import-export/hooks/useImportExport'
import { BoxSelect, Link2, Upload } from 'lucide-react'
import { BoardList } from '@/features/board/components/BoardList'
import { ExportMenu } from '@/features/import-export/components/ExportMenu'
import { SidebarFooter } from './SidebarFooter'
import { SidebarSettings } from './SidebarSettings'
import { useState } from 'react'
import type { usePreferences } from '@/features/preferences/usePreferences'
import { SnapshotList } from '@/features/workspace/SnapshotList'
import type { useSnapshots } from '@/features/workspace/useSnapshots'

export function Sidebar({
  editor,
  transfer,
  snapshots,
  onImportFiles,
  autoHide,
  preferences,
  onOpenTour
}: {
  editor: ReturnType<typeof useBoardEditor>
  transfer: ReturnType<typeof useImportExport>
  snapshots: ReturnType<typeof useSnapshots>
  onImportFiles: () => void
  autoHide: boolean
  preferences: ReturnType<typeof usePreferences>
  onOpenTour: () => void
}) {
  const [page, setPage] = useState<'workspace' | 'customize'>('workspace')
  return (
    <aside className={`sidebar ${autoHide ? 'sidebar-auto-hide' : ''}`}>
      <div className="sidebar-tabs" role="tablist" aria-label="Sidebar pages">
        <Button
          variant="ghost"
          className={`sidebar-tab ${page === 'workspace' ? 'active' : ''}`}
          onClick={() => setPage('workspace')}
        >
          Workspace
        </Button>
        <Button
          variant="ghost"
          className={`sidebar-tab ${page === 'customize' ? 'active' : ''}`}
          onClick={() => setPage('customize')}
        >
          Customize
        </Button>
      </div>
      {page === 'workspace' ? (
        <>
          <div className="sidebar-section">
            <div className="section-label">Workspace</div>
            <Button variant="ghost" className="nav-item active">
              <BoxSelect size={16} />
              <span>Canvas</span>
            </Button>
            <Button variant="ghost" className="nav-item" onClick={onImportFiles}>
              <Upload size={16} />
              <span>Import</span>
            </Button>
            <Button variant="ghost" className="nav-item" onClick={transfer.openUrlDialog}>
              <Link2 size={16} />
              <span>Import image URL</span>
            </Button>
            <ExportMenu
              onExport={transfer.exportAsBrainshake}
              onExportJson={transfer.exportAsJson}
            />
          </div>
          <BoardList
            boards={editor.boards}
            activeId={editor.board.id}
            onCreate={editor.createBoard}
            onSwitch={editor.switchBoard}
            onDelete={editor.deleteBoard}
            onToggleLink={editor.toggleBoardLink}
          />
          <SnapshotList snapshots={snapshots} />
          <SidebarFooter />
        </>
      ) : (
        <SidebarSettings preferences={preferences} onOpenTour={onOpenTour} />
      )}
    </aside>
  )
}
