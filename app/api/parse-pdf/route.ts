import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

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
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    // Use Claude's native PDF understanding — no pdfjs or native modules needed
    const client = new Anthropic()
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: base64 },
          },
          {
            type: 'text',
            text: 'Extract all text content from this document. Output only the text, preserving structure. No commentary or explanation.',
          },
        ],
      }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ text })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[parse-pdf]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
