import { NextRequest, NextResponse } from 'next/server'
import { put, get, list } from '@vercel/blob'

export const dynamic = 'force-dynamic'

const BLOB_PATH = 'projects.json'

function isAuthorized(req: NextRequest): boolean {
  const auth = req.cookies.get('portal_auth')?.value
  const password = process.env.PORTAL_PASSWORD
  if (!password) return true // dev fallback
  return auth === password
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { blobs } = await list({ prefix: BLOB_PATH })
    if (blobs.length === 0) return NextResponse.json({ projects: [] })
    const result = await get(blobs[0].url, { access: 'private' })
    if (!result) return NextResponse.json({ projects: [] })
    const text = await new Response(result.stream).text()
    const projects = JSON.parse(text)
    return NextResponse.json({ projects })
  } catch (e: unknown) {
    console.error('[projects GET]', e instanceof Error ? e.message : String(e))
    return NextResponse.json({ projects: [] })
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { projects } = await req.json()
    await put(BLOB_PATH, JSON.stringify(projects), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
    })
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[projects POST]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
