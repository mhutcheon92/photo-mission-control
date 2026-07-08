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

// Vercel serverless functions cap request bodies at ~4.5MB.
// Files under 4MB go through the server-side Claude parser (better quality).
// Larger files fall back to client-side pdfjs running on the main thread.
const SERVER_PARSE_LIMIT = 4 * 1024 * 1024

async function extractPdfText(file: File): Promise<string> {
  if (file.size < SERVER_PARSE_LIMIT) {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/parse-pdf', { method: 'POST', body: form })
    if (res.ok) {
      const json = await res.json()
      return (json.text as string) ?? ''
    }
    // Fall through to client-side on any server error
  }
  return extractPdfTextClientSide(file)
}

async function extractPdfTextClientSide(file: File): Promise<string> {
  const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })

  // Dynamic import — handle both ESM default and CJS-wrapped exports
  const mod = await import('pdfjs-dist')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfjsLib = ((mod as any).default ?? mod) as typeof import('pdfjs-dist')

  // Point the worker at the CDN copy matching the installed version — avoids
  // needing a worker file in /public and sidesteps Turbopack bundling quirks.
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pages: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items
      .map((item: unknown) => (item as { str: string }).str)
      .join(' ')
    pages.push(pageText)
  }
  return pages.join('\n\n')
}
