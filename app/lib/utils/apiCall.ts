import 'server-only'
import { cookies } from 'next/headers'
import { http, HttpMethod } from '@/http'
import type { ActionResult } from '../types/utils.type'
import { toActionError, toErrorCode } from './actionError'

const url = process.env.API_URL

/** Server-only: the session token from the httpOnly cookie. */
export const getToken = async (): Promise<string | undefined> => {
  const cookieStore = await cookies()
  return cookieStore.get(process.env.TOKEN_NAME as string)?.value
}

/**
 * One authenticated call to enrichmint-api from a 'use server' service.
 * Per-user data is never cached; every result is an ActionResult.
 */
export async function apiCall<T, B = undefined>(
  path: string,
  context: string,
  options: { method?: HttpMethod; body?: B; auth?: boolean } = {}
): Promise<ActionResult<T>> {
  const token = options.auth === false ? undefined : await getToken()
  try {
    const data = await http<T, B>(`${url}${path}`, {
      method: options.method ?? 'GET',
      body: options.body,
      cache: 'no-store',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    })
    return { data, error: null }
  } catch (e) {
    return {
      data: null,
      error: toActionError(e, context),
      code: toErrorCode(e)
    }
  }
}
