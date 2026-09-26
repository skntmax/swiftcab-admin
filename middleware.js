import { NextResponse } from 'next/server'
import { SWC_KEYS, USER_ROLES } from './constants/index'

const ROLE_SLUGS = new Set(Object.values(USER_ROLES))
const STATIC_EXT =
  /\.(?:js|css|map|json|png|jpe?g|gif|svg|ico|webp|woff2?|txt|html)$/i

function isPublicPath(pathname) {
  return (
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/.well-known') ||
    STATIC_EXT.test(pathname)
  )
}

function isDashboardPath(pathname) {
  const segments = pathname.split('/').filter(Boolean)
  const userType = segments[0]
  return segments.length >= 2 && Boolean(userType) && ROLE_SLUGS.has(userType)
}

export async function middleware(request) {
  const { pathname } = request.nextUrl

  if (isPublicPath(pathname) || !isDashboardPath(pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get(SWC_KEYS.SWC_TOKEN)?.value
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const [userType, userName] = pathname.split('/').filter(Boolean)
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')
  if (!apiBase || !userType || !userName) {
    return NextResponse.next()
  }

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${apiBase}/v1/auth/is-valid-user-with-role`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username: userName, userType }),
      signal: controller.signal,
    })
    clearTimeout(timer)

    const payload = await res.json().catch(() => null)
    const isValid =
      res.ok &&
      payload !== null &&
      typeof payload === 'object' &&
      'data' in payload &&
      Boolean(payload.data) &&
      !payload.error

    if (!isValid) {
      return NextResponse.next()
    }

    if (userType === USER_ROLES.customer) {
      const portal = process.env.NEXT_PUBLIC_CLIENT_PORTAL_URL
      if (portal) {
        return NextResponse.redirect(new URL(portal, request.url))
      }
    }
  } catch {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/data|_next/webpack-hmr|favicon.ico).*)',
  ],
}
