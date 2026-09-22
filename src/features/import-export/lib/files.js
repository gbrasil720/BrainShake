export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

// Checked in order: an .html file is imported as an html object, not as text.
const MEDIA_TYPES = [
  { type: 'image', match: (file) => file.type.startsWith('image/') },
  { type: 'video', match: (file) => file.type.startsWith('video/') },
  { type: 'html', match: (file) => file.name.toLowerCase().endsWith('.html') }
]

function isTextFile(file) {
  return file.type.startsWith('text/') || file.name.toLowerCase().endsWith('.md')
}

// Resolves to { type, data } for createObject, or null when the format is unsupported.
export async function fileToObject(file) {
  const media = MEDIA_TYPES.find((entry) => entry.match(file))
  if (media)
    return { type: media.type, data: { src: await readFileAsDataUrl(file), name: file.name } }
  if (isTextFile(file))
    return { type: 'text', data: { text: await readFileAsText(file), name: file.name } }
  return null
}
