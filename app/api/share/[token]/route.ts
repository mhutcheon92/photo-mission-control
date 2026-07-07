import { NextRequest, NextResponse } from 'next/server'
import { get, list } from '@vercel/blob'

export const dynamic = 'force-dynamic'

// Public endpoint — no isAuthorized check. The shareToken is the access control.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  if (!token || token.length < 8) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  try {
    const { blobs } = await list({ prefix: 'projects.json' })
    if (blobs.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const result = await get(blobs[0].url, { access: 'private' })
    if (!result) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const text = await new Response(result.stream).text()
    const projects = JSON.parse(text) as Array<{ shareToken?: string; sharedSections?: string[] }>

    const project = projects.find(p => p.shareToken === token)
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ project })
  } catch (e: unknown) {
    console.error('[share GET]', e instanceof Error ? e.message : String(e))
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
