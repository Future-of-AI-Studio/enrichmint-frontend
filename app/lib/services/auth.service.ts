'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { http, HttpError } from '@/http'
import type { ActionResult } from '../types/utils.type'
import type {
  CurrentUser,
  LoginRes,
  LoginVars,
  SessionResult,
  SignUpVars
} from '../types/user.type'
import { getToken } from '../utils/apiCall'

const url = process.env.API_URL
const UNREACHABLE = 'Can’t reach the server. Try again in a moment.'

/** The one place the session cookie is written: httpOnly, maxAge equal to the token lifetime. */
const setSessionCookie = async (session: LoginRes): Promise<void> => {
  const cookieStore = await cookies()
  cookieStore.set(process.env.TOKEN_NAME as string, session.accessToken, {
    httpOnly: true,
    secure: process.env.ENV !== 'development',
    sameSite: 'lax',
    path: '/',
    maxAge: session.expiresIn
  })
}

const authenticate = async (
  path: 'login' | 'signup',
  body: LoginVars | SignUpVars
): Promise<ActionResult<CurrentUser>> => {
  try {
    const response = await http<LoginRes, LoginVars | SignUpVars>(
      `${url}/auth/${path}`,
      {
        method: 'POST',
        body,
        cache: 'no-store'
      }
    )
    await setSessionCookie(response)
    return { data: response.user, error: null }
  } catch (e) {
    if (e instanceof HttpError) return { data: null, error: e.message }
    console.error(`Auth ${path} failed:`, (e as Error).message)
    return { data: null, error: UNREACHABLE }
  }
}

export const login = async (
  params: LoginVars
): Promise<ActionResult<CurrentUser>> =>
  authenticate('login', { email: params.email, password: params.password })

export const signUp = async (
  params: SignUpVars
): Promise<ActionResult<CurrentUser>> =>
  authenticate('signup', {
    displayName: params.displayName,
    email: params.email,
    password: params.password
  })

/** Form action: the API revokes every session of this user, then the cookie is dropped. */
export const logout = async (): Promise<void> => {
  const token = await getToken()
  try {
    await http(`${url}/auth/logout`, {
      method: 'POST',
      cache: 'no-store',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    })
  } catch (e) {
    console.error('Logout request failed:', (e as Error).message)
  }
  const cookieStore = await cookies()
  cookieStore.delete(process.env.TOKEN_NAME as string)
  redirect('/')
}

/** Distinguishes an invalid session (sign in again) from an unreachable API (show a retry). */
export const getSession = async (): Promise<SessionResult> => {
  const token = await getToken()
  if (!token) return { user: null, reason: 'unauthenticated' }
  try {
    const user = await http<CurrentUser>(`${url}/auth/me`, {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000)
    })
    return { user, reason: null }
  } catch (e) {
    if (e instanceof HttpError && e.status === 401) {
      return { user: null, reason: 'unauthenticated' }
    }
    console.error('Session check failed:', (e as Error).message)
    return { user: null, reason: 'unavailable' }
  }
}
