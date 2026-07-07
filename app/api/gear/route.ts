import { NextRequest, NextResponse } from 'next/server'
import { put, get, list } from '@vercel/blob'

export const dynamic = 'force-dynamic'

const BLOB_PATH = 'gear.json'

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
    if (blobs.length === 0) return NextResponse.json({ inventory: [] })
    const result = await get(blobs[0].url, { access: 'private' })
    if (!result) return NextResponse.json({ inventory: [] })
    const text = await new Response(result.stream).text()
    const inventory = JSON.parse(text)
    return NextResponse.json({ inventory })
  } catch (e: unknown) {
    console.error('[gear GET]', e instanceof Error ? e.message : String(e))
    return NextResponse.json({ inventory: [] })
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { inventory } = await req.json()
    await put(BLOB_PATH, JSON.stringify(inventory), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    })
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[gear POST]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
