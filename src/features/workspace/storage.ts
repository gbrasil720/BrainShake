import type { WorkspaceSnapshot, SnapshotSummary } from './model'
import { isWorkspaceSnapshot } from './model'
import { extractMedia, referencedMediaPaths, restoreMedia } from './media'

const DATABASE_NAME = 'brainshake-workspace-v2'
const SNAPSHOTS = 'snapshots'
const ASSETS = 'assets'

function request<T>(value: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    value.onsuccess = () => resolve(value.result)
    value.onerror = () => reject(value.error)
  })
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onabort = () => reject(transaction.error || Error('Storage transaction aborted'))
    transaction.onerror = () => reject(transaction.error || Error('Storage transaction failed'))
  })
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const opening = indexedDB.open(DATABASE_NAME, 1)
    opening.onupgradeneeded = () => {
      const db = opening.result
      db.createObjectStore(SNAPSHOTS, { keyPath: 'id' })
      db.createObjectStore(ASSETS)
    }
    opening.onsuccess = () => resolve(opening.result)
    opening.onerror = () => reject(opening.error)
  })
}

async function storedSnapshots(): Promise<WorkspaceSnapshot[]> {
  const db = await openDatabase()
  try {
    const values: unknown[] = await request(
      db.transaction(SNAPSHOTS, 'readonly').objectStore(SNAPSHOTS).getAll()
    )
    if (!values.every(isWorkspaceSnapshot)) throw Error('Invalid saved snapshots')
    return values
  } finally {
    db.close()
  }
}

export async function listSnapshots(): Promise<SnapshotSummary[]> {
  const snapshots = await storedSnapshots()
  return snapshots
    .map(({ id, parentId, label, createdAt }) => ({ id, parentId, label, createdAt }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

async function getAsset(path: string): Promise<Blob | undefined> {
  const db = await openDatabase()
  try {
    return await request<Blob | undefined>(
      db.transaction(ASSETS, 'readonly').objectStore(ASSETS).get(path)
    )
  } finally {
    db.close()
  }
}

async function hydrateSnapshot(snapshot: WorkspaceSnapshot): Promise<WorkspaceSnapshot> {
  return { ...snapshot, boards: await restoreMedia(snapshot.boards, getAsset) }
}

export async function loadSnapshot(id: string): Promise<WorkspaceSnapshot> {
  const db = await openDatabase()
  let value: unknown
  try {
    value = await request(db.transaction(SNAPSHOTS, 'readonly').objectStore(SNAPSHOTS).get(id))
  } finally {
    db.close()
  }
  if (!isWorkspaceSnapshot(value)) throw Error('Snapshot not found')
  return hydrateSnapshot(value)
}

export async function loadArchiveSnapshots(): Promise<{
  snapshots: WorkspaceSnapshot[]
  assets: Map<string, Blob>
}> {
  const snapshots = await storedSnapshots()
  const paths = [...new Set(snapshots.flatMap((snapshot) => referencedMediaPaths(snapshot.boards)))]
  const assets = new Map<string, Blob>()
  const db = await openDatabase()
  try {
    const store = db.transaction(ASSETS, 'readonly').objectStore(ASSETS)
    const found = await Promise.all(paths.map((path) => request<Blob | undefined>(store.get(path))))
    paths.forEach((path, index) => {
      const blob = found[index]
      if (!blob) throw Error('Missing saved media asset')
      assets.set(path, blob)
    })
  } finally {
    db.close()
  }
  return { snapshots, assets }
}

export async function saveSnapshot(snapshot: WorkspaceSnapshot): Promise<void> {
  const assets = new Map<string, Blob>()
  const stored = { ...snapshot, boards: await extractMedia(snapshot.boards, assets) }
  const db = await openDatabase()
  try {
    const tx = db.transaction([SNAPSHOTS, ASSETS], 'readwrite')
    const done = transactionDone(tx)
    for (const [path, blob] of assets) tx.objectStore(ASSETS).put(blob, path)
    tx.objectStore(SNAPSHOTS).put(stored)
    await done
  } finally {
    db.close()
  }
}

// Importing a workspace swaps its revision store in one transaction.
export async function replaceSnapshots(
  snapshots: WorkspaceSnapshot[],
  archiveAssets = new Map<string, Blob>()
): Promise<void> {
  const assets = new Map(archiveAssets)
  const cache = new Map<string, Promise<string>>()
  const stored = await Promise.all(
    snapshots.map(async (snapshot) => ({
      ...snapshot,
      boards: await extractMedia(snapshot.boards, assets, cache)
    }))
  )
  for (const snapshot of stored)
    for (const path of referencedMediaPaths(snapshot.boards))
      if (!assets.has(path)) throw Error('Missing snapshot media asset')
  const db = await openDatabase()
  try {
    const tx = db.transaction([SNAPSHOTS, ASSETS], 'readwrite')
    const done = transactionDone(tx)
    tx.objectStore(SNAPSHOTS).clear()
    tx.objectStore(ASSETS).clear()
    for (const [path, blob] of assets) tx.objectStore(ASSETS).put(blob, path)
    for (const snapshot of stored) tx.objectStore(SNAPSHOTS).put(snapshot)
    await done
  } finally {
    db.close()
  }
}
