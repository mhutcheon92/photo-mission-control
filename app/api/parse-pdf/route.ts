import { NextRequest, NextResponse } from 'next/server'
import { createRequire } from 'node:module'

export const dynamic = 'force-dynamic'

function isAuthorized(req: NextRequest): boolean {
  const auth = req.cookies.get('portal_auth')?.value
  const password = process.env.PORTAL_PASSWORD
  if (!password) return true
  return auth === password
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const data = new Uint8Array(arrayBuffer)

    // Use legacy build — designed for Node.js environments
    const { getDocument, GlobalWorkerOptions } = await import(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore — pdfjs-dist legacy is not typed separately
      'pdfjs-dist/legacy/build/pdf.mjs'
    )

    // Resolve the worker from node_modules using createRequire so the path
    // works in both local dev and Vercel's compiled serverless bundle
    const _require = createRequire(import.meta.url)
    const workerPath = _require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs')
    GlobalWorkerOptions.workerSrc = `file://${workerPath}`

    const pdf = await getDocument({ data }).promise
    const pages: string[] = []

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = (textContent.items as unknown[])
        .filter((item) => typeof item === 'object' && item !== null && 'str' in item)
        .map((item) => (item as { str: string }).str)
        .join(' ')
      pages.push(pageText)
    }

    return NextResponse.json({ text: pages.join('\n\n') })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[parse-pdf]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
