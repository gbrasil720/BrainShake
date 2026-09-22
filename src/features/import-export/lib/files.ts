import type { CanvasItem } from '@/features/board/types'

export function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function readFileAsText(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

// Checked in order: an .html file is imported as an html object, not as text.
const MEDIA_TYPES = [
  { type: 'image', match: (file: File) => file.type.startsWith('image/') },
  { type: 'video', match: (file: File) => file.type.startsWith('video/') },
  { type: 'html', match: (file: File) => file.name.toLowerCase().endsWith('.html') }
]

function isTextFile(file: File) {
  return file.type.startsWith('text/') || file.name.toLowerCase().endsWith('.md')
}

// Resolves to { type, data } for createObject, or null when the format is unsupported.
export async function fileToObject(
  file: File
): Promise<{ type: string; data: Partial<CanvasItem> } | null> {
  const media = MEDIA_TYPES.find((entry) => entry.match(file))
  if (media)
    return { type: media.type, data: { src: await readFileAsDataUrl(file), name: file.name } }
  if (isTextFile(file))
    return { type: 'text', data: { text: await readFileAsText(file), name: file.name } }
  return null
}
