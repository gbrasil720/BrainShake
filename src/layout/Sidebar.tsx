import type { useBoardEditor } from '@/features/board/hooks/useBoardEditor'
import type { useImportExport } from '@/features/import-export/hooks/useImportExport'
import { BoxSelect, Link2, Upload } from 'lucide-react'
import { BoardList } from '@/features/board/components/BoardList'
import { ExportMenu } from '@/features/import-export/components/ExportMenu'
import { SidebarFooter } from './SidebarFooter'
import { SidebarSettings } from './SidebarSettings'
import { useState } from 'react'
import type { usePreferences } from '@/features/preferences/usePreferences'

export function Sidebar({
  editor,
  transfer,
  onImportFiles,
  autoHide,
  preferences,
  onOpenTour
}: {
  editor: ReturnType<typeof useBoardEditor>
  transfer: ReturnType<typeof useImportExport>
  onImportFiles: () => void
  autoHide: boolean
  preferences: ReturnType<typeof usePreferences>
  onOpenTour: () => void
}) {
  const [page, setPage] = useState<'workspace' | 'customize'>('workspace')
  return (
    <aside className={`sidebar ${autoHide ? 'sidebar-auto-hide' : ''}`}>
      <div className="sidebar-tabs" role="tablist" aria-label="Sidebar pages">
        <button
          className={`sidebar-tab ${page === 'workspace' ? 'active' : ''}`}
          onClick={() => setPage('workspace')}
        >
          Workspace
        </button>
        <button
          className={`sidebar-tab ${page === 'customize' ? 'active' : ''}`}
          onClick={() => setPage('customize')}
        >
          Customize
        </button>
      </div>
      {page === 'workspace' ? (
        <>
          <div className="sidebar-section">
            <div className="section-label">Workspace</div>
            <button className="nav-item active">
              <BoxSelect size={16} />
              <span>Canvas</span>
            </button>
            <button className="nav-item" onClick={onImportFiles}>
              <Upload size={16} />
              <span>Import</span>
            </button>
            <button className="nav-item" onClick={transfer.openUrlDialog}>
              <Link2 size={16} />
              <span>Import image URL</span>
            </button>
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
          />
          <SidebarFooter />
        </>
      ) : (
        <SidebarSettings preferences={preferences} onOpenTour={onOpenTour} />
      )}
    </aside>
  )
}
