import { NextRequest, NextResponse } from 'next/server'

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
    const buffer = Buffer.from(arrayBuffer)

    // pdf-parse handles Node.js compatibility (no browser APIs required)
    const pdfParse = (await import('pdf-parse')).default
    const result = await pdfParse(buffer)

    return NextResponse.json({ text: result.text })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[parse-pdf]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
