// ~150k chars ≈ ~37k tokens, leaves headroom for system prompt + brief
const MAX_TEXT_CHARS = 150_000

export interface Attachment {
  name: string
  type: 'text' | 'image'
  // text attachments: extracted content
  content?: string
  truncated?: boolean
  // image attachments: base64 data + media type
  base64?: string
  mediaType?: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
  sizeKB: number
}

export async function parseFile(file: File): Promise<Attachment> {
  const sizeKB = Math.round(file.size / 1024)

  if (file.type === 'application/pdf') {
    const raw = await extractPdfText(file)
    const truncated = raw.length > MAX_TEXT_CHARS
    const content = truncated ? raw.slice(0, MAX_TEXT_CHARS) + '\n\n[Content truncated — file too large]' : raw
    return { name: file.name, type: 'text', content, truncated, sizeKB }
  }

  if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
    const raw = await readAsText(file)
    const truncated = raw.length > MAX_TEXT_CHARS
    const content = truncated ? raw.slice(0, MAX_TEXT_CHARS) + '\n\n[Content truncated — file too large]' : raw
    return { name: file.name, type: 'text', content, truncated, sizeKB }
  }

  if (file.type.startsWith('image/')) {
    const { base64, mediaType } = await readAsBase64(file)
    return { name: file.name, type: 'image', base64, mediaType, sizeKB }
  }

  // Fallback: try reading as text
  try {
    const content = await readAsText(file)
    return { name: file.name, type: 'text', content, sizeKB }
  } catch {
    throw new Error(`Unsupported file type: ${file.type || file.name}`)
  }
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

function readAsBase64(file: File): Promise<{ base64: string; mediaType: Attachment['mediaType'] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      // Strip the data:image/...;base64, prefix
      const base64 = dataUrl.split(',')[1]
      const mediaType = (file.type as Attachment['mediaType']) ?? 'image/jpeg'
      resolve({ base64, mediaType })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function extractPdfText(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch('/api/parse-pdf', { method: 'POST', body: form })
  if (!res.ok) {
    let detail = `PDF parsing failed (${res.status})`
    try { const j = await res.json(); if (j.error) detail = j.error } catch { /* non-JSON body */ }
    if (res.status === 413) throw new Error(
      'This PDF is too large to process (limit ~4MB). Save a smaller version or paste the brief text directly into the field.'
    )
    throw new Error(detail)
  }
  const json = await res.json()
  return (json.text as string) ?? ''
}
