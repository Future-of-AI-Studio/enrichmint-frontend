import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isPublicPath, LOGIN_PATH } from '@/app/lib/utils/authRouting'

/**
 * Route guard plus a per-request CSP nonce (Next 16's renamed middleware).
 * It only routes; it never authorizes. The API enforces every permission.
 */

const PAYPAL_ORIGINS = [
  'https://www.paypal.com',
  'https://www.sandbox.paypal.com',
  'https://*.paypal.com',
  'https://*.paypalobjects.com'
]

function buildCsp(nonce: string, isDev: boolean): string {
  let apiOrigin = ''
  try {
    apiOrigin = process.env.API_URL ? new URL(process.env.API_URL).origin : ''
  } catch {
    // Ignore an invalid API_URL and keep CSP strict.
  }
  const paypal = PAYPAL_ORIGINS.join(' ')

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    `form-action 'self' ${paypal}`,
    `img-src 'self' data: blob: ${paypal}`,
    // data: covers the icon font AG Studio embeds for the admin dashboard.
    "font-src 'self' data:",
    `style-src 'self' 'unsafe-inline' ${paypal}`,
    // strict-dynamic lets the nonced bundle load the PayPal SDK script.
    isDev
      ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
      : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    `frame-src ${paypal}`,
    `connect-src 'self' ${paypal} ${isDev ? 'http: ws:' : ''} ${apiOrigin}`.trim()
  ].join('; ')
}

export default function proxy(request: NextRequest): NextResponse {
  const isDev = process.env.ENV === 'development'
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = buildCsp(nonce, isDev)
  const pathname = request.nextUrl.pathname
  const token = request.cookies.get(process.env.TOKEN_NAME as string)?.value

  if (!token && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = LOGIN_PATH
    url.search = ''
    url.searchParams.set('next', `${pathname}${request.nextUrl.search}`)
    return NextResponse.redirect(url)
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('x-pathname', pathname)
  requestHeaders.set('Content-Security-Policy', csp)
  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('Content-Security-Policy', csp)
  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|ico|webp|js|css|woff2?|ttf)).*)'
  ]
}
