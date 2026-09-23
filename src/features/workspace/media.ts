import type { Board } from '@/features/board/types'

const MEDIA_OBJECT_TYPES = new Set(['image', 'video', 'html'])
const PORTABLE_MEDIA_SCHEMES = ['data:', 'blob:']
const MEDIA_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/svg+xml': 'svg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'text/html': 'html'
}

export type MediaAsset = { path: string; blob: Blob }

async function hasValidDigest(path: string, blob: Blob): Promise<boolean> {
  const match = /^media\/([a-f0-9]{64})\.[a-z0-9]+$/i.exec(path)
  if (!match) return true
  const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer())
  const hash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('')
  return hash === match[1].toLowerCase()
}

export async function validateMediaAssets(
  paths: string[],
  getAsset: (path: string) => Promise<Blob | undefined>
): Promise<void> {
  await Promise.all(
    paths.map(async (path) => {
      const blob = await getAsset(path)
      if (!blob) throw Error('Missing media asset')
      if (!(await hasValidDigest(path, blob))) throw Error('Invalid media asset')
    })
  )
}

function mediaReference(item: Board['objects'][number]): string | null {
  if (!MEDIA_OBJECT_TYPES.has(item.type) || !('src' in item) || !item.src?.startsWith('media/'))
    return null
  if (!/^media\/[a-z0-9_-]+\.[a-z0-9]+$/i.test(item.src) || !item.mediaType)
    throw Error('Invalid media reference')
  return item.src
}

export function referencedMediaPaths(boards: Board[]): string[] {
  const paths = new Set<string>()
  for (const board of boards) {
    for (const item of board.objects) {
      const path = mediaReference(item)
      if (path) paths.add(path)
    }
  }
  return [...paths]
}

// The same asset path is reused by the working copy and every snapshot.
export async function extractMedia(
  boards: Board[],
  assets: Map<string, Blob>,
  cache = new Map<string, Promise<{ path: string; mediaType: string }>>()
): Promise<Board[]> {
  return Promise.all(
    boards.map(async (board) => ({
      ...board,
      objects: await Promise.all(
        board.objects.map(async (item) => {
          if (
            !MEDIA_OBJECT_TYPES.has(item.type) ||
            !('src' in item) ||
            !item.src ||
            !PORTABLE_MEDIA_SCHEMES.some((scheme) => item.src?.startsWith(scheme))
          )
            return { ...item }

          const source = item.src
          let path = cache.get(source)
          if (!path) {
            path = (async () => {
              const blob = await (await fetch(source)).blob()
              const mediaType = (
                blob.type ||
                /^data:([^;,]+)/.exec(source)?.[1] ||
                'application/octet-stream'
              )
                .split(';', 1)[0]
                .trim()
                .toLowerCase()
              const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer())
              const hash = Array.from(new Uint8Array(digest), (byte) =>
                byte.toString(16).padStart(2, '0')
              ).join('')
              const assetPath = `media/${hash}.${MEDIA_EXTENSIONS[mediaType] || 'bin'}`
              assets.set(assetPath, blob)
              return { path: assetPath, mediaType }
            })()
            cache.set(source, path)
          }
          const asset = await path
          return { ...item, src: asset.path, mediaType: asset.mediaType }
        })
      )
    }))
  )
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export async function restoreMedia(
  boards: Board[],
  getAsset: (path: string) => Promise<Blob | undefined>
): Promise<Board[]> {
  const cache = new Map<string, Promise<string>>()
  return Promise.all(
    boards.map(async (board) => ({
      ...board,
      objects: await Promise.all(
        board.objects.map(async (item) => {
          const path = mediaReference(item)
          if (!path || !('mediaType' in item)) return { ...item }
          const cacheKey = `${path}:${item.mediaType}`
          let loaded = cache.get(cacheKey)
          if (!loaded) {
            loaded = getAsset(path).then((blob) => {
              if (!blob) throw Error('Missing media asset')
              return hasValidDigest(path, blob).then((valid) => {
                if (!valid) throw Error('Invalid media asset')
                return blobToDataUrl(new Blob([blob], { type: item.mediaType }))
              })
            })
            cache.set(cacheKey, loaded)
          }
          return { ...item, src: await loaded }
        })
      )
    }))
  )
}
