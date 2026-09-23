import { describe, expect, it } from 'vitest'
import { STORAGE_KEYS } from '@/features/board/lib/storage'
import { loadDockPosition } from './dockPosition'

const MIGRATION_KEY = `${STORAGE_KEYS.dock}-default-top-v1`

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial))
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    get: (key: string) => values.get(key) ?? null
  }
}

describe('loadDockPosition', () => {
  it('migrates every pre-existing dock choice to top once', () => {
    const storage = memoryStorage({ [STORAGE_KEYS.dock]: JSON.stringify('left') })

    expect(loadDockPosition(storage)).toBe('top')
    expect(storage.get(STORAGE_KEYS.dock)).toBe(JSON.stringify('top'))
    expect(storage.get(MIGRATION_KEY)).toBe('done')
  })

  it('preserves a position selected after the migration', () => {
    const storage = memoryStorage({
      [STORAGE_KEYS.dock]: JSON.stringify('right'),
      [MIGRATION_KEY]: 'done'
    })

    expect(loadDockPosition(storage)).toBe('right')
  })

  it('defaults to top for missing or invalid stored positions', () => {
    expect(loadDockPosition(memoryStorage())).toBe('top')
    expect(
      loadDockPosition(
        memoryStorage({ [STORAGE_KEYS.dock]: JSON.stringify('diagonal'), [MIGRATION_KEY]: 'done' })
      )
    ).toBe('top')
  })
})
