import 'server-only'

/** The PayPal client id is public by design (the browser renders the button); the secret never leaves the API. */
export const paypalConfig = (): {
  clientId: string | undefined
  env: 'sandbox' | 'live'
} => ({
  clientId: process.env.PAYPAL_CLIENT_ID || undefined,
  env: process.env.PAYPAL_ENV === 'live' ? 'live' : 'sandbox'
})
