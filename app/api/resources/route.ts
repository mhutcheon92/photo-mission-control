import { NextRequest, NextResponse } from 'next/server'
import { put, get, list } from '@vercel/blob'

export const dynamic = 'force-dynamic'

const BLOB_PATH = 'resources.json'

function isAuthorized(req: NextRequest): boolean {
  const auth = req.cookies.get('portal_auth')?.value
  const password = process.env.PORTAL_PASSWORD
  if (!password) return true
  return auth === password
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { blobs } = await list({ prefix: BLOB_PATH })
    if (blobs.length === 0) return NextResponse.json({ resources: [] })
    const result = await get(blobs[0].url, { access: 'private' })
    if (!result) return NextResponse.json({ resources: [] })
    const text = await new Response(result.stream).text()
    const resources = JSON.parse(text)
    return NextResponse.json({ resources })
  } catch (e: unknown) {
    console.error('[resources GET]', e instanceof Error ? e.message : String(e))
    return NextResponse.json({ resources: [] })
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { resources } = await req.json()
    await put(BLOB_PATH, JSON.stringify(resources), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    })
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[resources POST]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
