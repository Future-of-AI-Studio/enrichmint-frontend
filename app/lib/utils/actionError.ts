import { unstable_rethrow } from 'next/navigation'
import { HttpError } from '@/http'

const UNREACHABLE = 'Can’t reach the server. Try again in a moment.'

/** The API's snake_case error code (e.g. `budget_exceeded`), if the body had one. */
export const toErrorCode = (e: unknown): string | undefined => {
  if (!(e instanceof HttpError)) return undefined
  const data = e.data as { error?: unknown } | null
  const code = typeof data?.error === 'string' ? data.error : undefined
  return code && /^[a-z]+(_[a-z]+)*$/.test(code) ? code : undefined
}

/**
 * The message a service returns in `ActionResult.error`. API errors carry a
 * short, user-safe sentence; anything else is logged and replaced with a
 * generic one so internals never reach the UI.
 */
export const toActionError = (e: unknown, context: string): string => {
  // Next.js signals (redirect, notFound, dynamic rendering) must propagate.
  unstable_rethrow(e)
  if (e instanceof HttpError) return e.message
  console.error(`${context} failed:`, (e as Error).message)
  return UNREACHABLE
}
