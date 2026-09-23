import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { useSnapshots } from './useSnapshots'

export function SnapshotList({ snapshots }: { snapshots: ReturnType<typeof useSnapshots> }) {
  const [label, setLabel] = useState('')

  return (
    <section className="sidebar-section snapshot-section" aria-label="Snapshots">
      <div className="section-label">Snapshots</div>
      <form
        className="snapshot-form"
        onSubmit={(event) => {
          event.preventDefault()
          if (!label.trim()) return
          void snapshots.create(label).then((saved) => {
            if (saved) setLabel('')
          })
        }}
      >
        <Input
          aria-label="Snapshot name"
          placeholder="Name this checkpoint"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
        />
        <Button type="submit" disabled={snapshots.busy || !label.trim()}>
          Save
        </Button>
      </form>
      {snapshots.items.length ? (
        <div className="snapshot-list">
          {snapshots.items.map((item) => (
            <div className="snapshot-item" key={item.id}>
              <div>
                <strong>{item.label}</strong>
                <time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString()}</time>
                <span className="snapshot-parent">
                  {item.id === snapshots.headId
                    ? 'Current base'
                    : item.parentId
                      ? `From ${snapshots.items.find((parent) => parent.id === item.parentId)?.label || 'earlier checkpoint'}`
                      : 'First checkpoint'}
                </span>
              </div>
              <Button
                variant="ghost"
                disabled={snapshots.busy}
                title={`Restore ${item.label}`}
                onClick={() => void snapshots.restore(item.id)}
              >
                Restore
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="snapshot-empty">Save a checkpoint to revisit this workspace later.</p>
      )}
    </section>
  )
}
