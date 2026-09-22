import JSZip from 'jszip'
import { boardFilename, downloadBlob } from './download.js'

const MEDIA_OBJECT_TYPES = ['image', 'video', 'html']

const MEDIA_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/svg+xml': 'svg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'text/html': 'html'
}

export function dataUrlInfo(src, id) {
  // eslint-disable-next-line no-control-regex
  const match = /^data:([^;,]+)?((?:;[^,]*)?),([\x00-\x7f]*)$/s.exec(src)
  if (!match) return null
  const mediaType = match[1] || 'application/octet-stream'
  const metadata = match[2] || ''
  return {
    mediaType,
    extension: MEDIA_EXTENSIONS[mediaType] || 'bin',
    data: match[3],
    base64: metadata.includes(';base64'),
    id: id.replace(/[^a-z0-9_-]/gi, '-')
  }
}

export async function exportBrainshake(board) {
  const zip = new JSZip()
  const media = []
  const objects = board.objects.map((item) => {
    if (!MEDIA_OBJECT_TYPES.includes(item.type) || !item.src?.startsWith('data:'))
      return { ...item }
    const info = dataUrlInfo(item.src, item.id)
    if (!info) return { ...item }
    const path = `media/${info.id}.${info.extension}`
    const content = info.base64 ? info.data : decodeURIComponent(info.data)
    media.push({ path, content, base64: info.base64 })
    return { ...item, src: path, mediaType: info.mediaType }
  })
  zip.file('board.json', JSON.stringify({ name: board.name, objects }, null, 2))
  media.forEach((item) => zip.file(item.path, item.content, { base64: item.base64 }))
  downloadBlob(await zip.generateAsync({ type: 'blob' }), boardFilename(board.name, 'brainshake'))
}

export function exportJson(board) {
  const objects = board.objects.map((item) => {
    if (!MEDIA_OBJECT_TYPES.includes(item.type)) return { ...item }
    const { src, ...withoutSrc } = item
    return { ...withoutSrc, mediaOmitted: true }
  })
  downloadBlob(
    new Blob([JSON.stringify({ name: board.name, objects }, null, 2)], {
      type: 'application/json'
    }),
    boardFilename(board.name, 'json')
  )
}

// Reads a .brainshake (zip) or .json file. Throws when the file is not a valid board.
export async function importBoard(file) {
  const buffer = await file.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let data
  if (bytes[0] === 0x50 && bytes[1] === 0x4b) {
    const zip = await JSZip.loadAsync(buffer)
    const manifest = zip.file('board.json')
    if (!manifest) throw Error()
    data = JSON.parse(await manifest.async('text'))
    for (const item of data.objects || []) {
      if (!item.src?.startsWith('media/')) continue
      const mediaFile = zip.file(item.src.replace(/^\.\//, ''))
      if (!mediaFile || !item.mediaType) throw Error()
      item.src = `data:${item.mediaType};base64,${await mediaFile.async('base64')}`
    }
  } else data = JSON.parse(new TextDecoder().decode(bytes))
  if (!data || typeof data.name !== 'string' || !Array.isArray(data.objects)) throw Error()
  return data
}
