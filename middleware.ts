import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = process.env.AUTH_SECRET || 'cake-shop-super-secret-jwt-key-2026-production-ready'
const key = new TextEncoder().encode(secretKey)

interface DecryptedSession {
  id: string
  email: string
  role: 'CUSTOMER' | 'ADMIN'
  name?: string
}

async function verifySessionToken(token: string | undefined): Promise<DecryptedSession | null> {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] })
    return payload as unknown as DecryptedSession
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const sessionCookie = req.cookies.get('session')?.value
  const session = await verifySessionToken(sessionCookie)

  const isAdminRoute = pathname.startsWith('/admin')
  const isAccountRoute = pathname.startsWith('/account')
  const isAuthRoute = pathname === '/login' || pathname === '/register'

  // 1. Protect Admin Routes
  if (isAdminRoute) {
    if (!session) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirect', pathname + search)
      return NextResponse.redirect(loginUrl)
    }

    if (session.role !== 'ADMIN') {
      // Forbidden: Customers cannot access admin routes
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // 2. Protect Customer Account Routes
  if (isAccountRoute) {
    if (!session) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirect', pathname + search)
      return NextResponse.redirect(loginUrl)
    }
  }

  // 3. Prevent Auth Loops on /login & /register for already authenticated users
  if (isAuthRoute && session) {
    const redirectParam = req.nextUrl.searchParams.get('redirect')

    if (session.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', req.url))
    } else {
      const target = redirectParam && !redirectParam.startsWith('/admin') ? redirectParam : '/account'
      return NextResponse.redirect(new URL(target, req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
    '/login',
    '/register',
  ],
}
