/** Routes reachable without a session. Everything else requires the cookie. */
export const PUBLIC_PATHS = ['/', '/login', '/signup', '/guides'] as const

export const LOGIN_PATH = '/login'

/** Landing page after sign-in. */
export const HOME_PATH = '/steward'

export function isPathWithin(pathname: string, route: string): boolean {
  if (route === '/') return pathname === route
  return pathname === route || pathname.startsWith(`${route}/`)
}

export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((route) => isPathWithin(pathname, route))
}

/** Only allow same-origin relative redirects (blocks `//evil.com` and absolute URLs). */
export function sanitizeRedirectPath(
  redirectTo: string | null | undefined,
  fallback = HOME_PATH
): string {
  if (
    !redirectTo ||
    !redirectTo.startsWith('/') ||
    redirectTo.startsWith('//') ||
    redirectTo.startsWith('/\\')
  ) {
    return fallback
  }
  return redirectTo
}
