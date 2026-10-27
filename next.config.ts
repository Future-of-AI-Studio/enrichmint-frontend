import type { NextConfig } from 'next'

const isDev = process.env.ENV === 'development'

// Content-Security-Policy is set per request in proxy.ts (nonce-based).
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  // allow-popups: the PayPal checkout window must be able to talk back to this page.
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },

  ...(!isDev
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload'
        }
      ]
    : [])
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders
      }
    ]
  }
}

export default nextConfig
