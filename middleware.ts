import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/login', '/_next', '/api', '/favicon.ico']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Let public paths through
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const auth = req.cookies.get('portal_auth')?.value
  const password = process.env.PORTAL_PASSWORD

  // If no password is configured, allow through (dev fallback)
  if (!password) return NextResponse.next()

  if (auth === password) return NextResponse.next()

  const loginUrl = req.nextUrl.clone()
  loginUrl.pathname = '/login'
  loginUrl.searchParams.set('from', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
