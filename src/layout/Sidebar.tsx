import { Button } from '@/components/ui/button'
import type { useBoardEditor } from '@/features/board/hooks/useBoardEditor'
import type { useImportExport } from '@/features/import-export/hooks/useImportExport'
import { LayoutGrid, Link2, Menu, Plus, SlidersHorizontal, Upload, X } from 'lucide-react'
import { BoardList } from '@/features/board/components/BoardList'
import { SidebarFooter } from './SidebarFooter'
import { SidebarSettings } from './SidebarSettings'
import { useEffect, useState, type CSSProperties } from 'react'
import type { usePreferences } from '@/features/preferences/usePreferences'
import { SnapshotList } from '@/features/workspace/SnapshotList'
import type { useSnapshots } from '@/features/workspace/useSnapshots'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { STORAGE_KEYS } from '@/features/board/lib/storage'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const MIN_SIDEBAR_WIDTH = 220
const MAX_SIDEBAR_WIDTH = 560
const DEFAULT_SIDEBAR_WIDTH = 280
const MOBILE_SIDEBAR_BREAKPOINT = 820

function maxSidebarWidth() {
  return Math.max(MIN_SIDEBAR_WIDTH, Math.min(MAX_SIDEBAR_WIDTH, window.innerWidth - 320))
}

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
  const [expanded, setExpanded] = useState(false)
  const [width, setWidth] = useLocalStorage(STORAGE_KEYS.sidebarWidth, DEFAULT_SIDEBAR_WIDTH)
  const savedWidth = Math.min(
    MAX_SIDEBAR_WIDTH,
    Math.max(MIN_SIDEBAR_WIDTH, Number(width) || DEFAULT_SIDEBAR_WIDTH)
  )
  const visibleWidth = Math.min(maxSidebarWidth(), savedWidth)
  const resizeTo = (next: number) =>
    setWidth(Math.min(maxSidebarWidth(), Math.max(MIN_SIDEBAR_WIDTH, next)))

  useEffect(() => {
    if (!expanded) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpanded(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [expanded])

  return (
    <>
      {expanded && (
        <div className="sidebar-backdrop" onClick={() => setExpanded(false)} aria-hidden="true" />
      )}
      <aside
        className={`sidebar ${autoHide ? 'sidebar-auto-hide' : ''} ${expanded ? 'sidebar-expanded' : ''}`}
        style={{ '--sidebar-width': `${savedWidth}px` } as CSSProperties}
      >
        <Button
          variant="ghost"
          className="sidebar-mobile-toggle"
          title={expanded ? 'Close sidebar' : 'Open sidebar'}
          aria-label={expanded ? 'Close sidebar' : 'Open sidebar'}
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? <X size={18} /> : <Menu size={18} />}
        </Button>
        <div
          className="sidebar-resize-handle"
          role="separator"
          aria-label="Resize sidebar"
          aria-orientation="vertical"
          aria-valuemin={MIN_SIDEBAR_WIDTH}
          aria-valuemax={maxSidebarWidth()}
          aria-valuenow={visibleWidth}
          tabIndex={0}
          onPointerDown={(event) => {
            event.preventDefault()
            event.currentTarget.setPointerCapture(event.pointerId)
          }}
          onPointerMove={(event) => {
            if (!event.buttons) return
            const left = event.currentTarget.closest('.app')?.getBoundingClientRect().left
            if (left !== undefined) resizeTo(event.clientX - left)
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
              event.preventDefault()
              resizeTo(visibleWidth + (event.key === 'ArrowRight' ? 16 : -16))
            } else if (event.key === 'Home' || event.key === 'End') {
              event.preventDefault()
              resizeTo(event.key === 'Home' ? MIN_SIDEBAR_WIDTH : maxSidebarWidth())
            }
          }}
        />
        <div className="sidebar-tabs" role="tablist" aria-label="Sidebar pages">
          <Button
            variant="ghost"
            className={`sidebar-tab ${page === 'workspace' ? 'active' : ''}`}
            role="tab"
            aria-selected={page === 'workspace'}
            style={
              page === 'workspace'
                ? { background: 'var(--paper)', boxShadow: '0 1px 3px rgba(20, 24, 30, 0.08)' }
                : { background: 'transparent', boxShadow: 'none' }
            }
            title="Workspace"
            onClick={() => {
              setPage('workspace')
              if (window.innerWidth <= MOBILE_SIDEBAR_BREAKPOINT) setExpanded(true)
            }}
          >
            <LayoutGrid size={15} /> <span>Workspace</span>
          </Button>
          <Button
            variant="ghost"
            className={`sidebar-tab ${page === 'customize' ? 'active' : ''}`}
            role="tab"
            aria-selected={page === 'customize'}
            style={
              page === 'customize'
                ? { background: 'var(--paper)', boxShadow: '0 1px 3px rgba(20, 24, 30, 0.08)' }
                : { background: 'transparent', boxShadow: 'none' }
            }
            title="Customize"
            onClick={() => {
              setPage('customize')
              if (window.innerWidth <= MOBILE_SIDEBAR_BREAKPOINT) setExpanded(true)
            }}
          >
            <SlidersHorizontal size={15} /> <span>Customize</span>
          </Button>
        </div>
        {page === 'workspace' ? (
          <>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="workspace-add-button"
                  title="Add to canvas"
                  aria-label="Add to canvas"
                >
                  <Plus size={16} />
                  <span>Add to canvas</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={8} className="workspace-actions-menu">
                <DropdownMenuItem
                  onSelect={() => {
                    setExpanded(false)
                    onImportFiles()
                  }}
                >
                  <Upload size={15} /> Import files
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    setExpanded(false)
                    transfer.openUrlDialog()
                  }}
                >
                  <Link2 size={15} /> Add image from URL
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <BoardList
              boards={editor.boards}
              activeId={editor.board.id}
              onCreate={() => {
                editor.createBoard()
                setExpanded(false)
              }}
              onSwitch={(id) => {
                editor.switchBoard(id)
                setExpanded(false)
              }}
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
    </>
  )
}
