// AI-assisted: Next.js middleware pattern aided by Claude (Anthropic)
import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_PREFIXES = ['/api/bookings', '/api/dashboard']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  )

  if (!isProtected) return NextResponse.next()

  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify the token has 3 parts (basic JWT structure check)
  // Full verification happens in the route handler via getAuthUser()
  const parts = token.split('.')
  if (parts.length !== 3) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/bookings/:path*', '/api/dashboard/:path*'],
}