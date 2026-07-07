import { NextRequest, NextResponse } from 'next/server'
import { put, list } from '@vercel/blob'

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

    const res = await fetch(blobs[0].url, { cache: 'no-store' })
    const projects = await res.json()
    return NextResponse.json({ projects })
  } catch {
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
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
    })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
