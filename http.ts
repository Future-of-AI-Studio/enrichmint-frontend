export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

/** enrichmint-api error body: { statusCode, message, error, ...extra }. */
export interface ApiErrorResponse {
  statusCode?: number
  message?: string
  error?: string
  [key: string]: unknown
}

export class HttpError<T = unknown> extends Error {
  public readonly status: number
  public readonly data: T | null

  constructor(message: string, status: number, data: T | null) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.data = data
  }
}

interface RequestOptions<TBody> extends Omit<RequestInit, 'body' | 'method'> {
  method?: HttpMethod
  body?: TBody
}

async function parseResponse<TResponse, TError>(
  response: Response
): Promise<TResponse> {
  const contentType = response.headers.get('content-type')

  let parsed: unknown = null

  if (contentType?.includes('application/json')) {
    parsed = await response.json()
  } else {
    parsed = await response.text()
  }

  if (!response.ok) {
    const errorData = parsed as TError
    const message =
      typeof parsed === 'object' &&
      parsed !== null &&
      'message' in parsed &&
      typeof (parsed as { message?: unknown }).message === 'string'
        ? (parsed as { message: string }).message
        : response.statusText

    throw new HttpError<TError>(message, response.status, errorData)
  }

  return parsed as TResponse
}

/**
 * The one HTTP path to enrichmint-api. Call it only from 'use server' services
 * or app/api route handlers.
 */
export async function http<
  TResponse,
  TBody = undefined,
  TError = ApiErrorResponse
>(url: string, options?: RequestOptions<TBody>): Promise<TResponse> {
  const { body, headers, method = 'GET', ...rest } = options ?? {}

  const isFormData = body instanceof FormData

  const response = await fetch(url, {
    method,
    headers: {
      ...(body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...headers
    },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    credentials: 'include',
    ...rest
  })

  return parseResponse<TResponse, TError>(response)
}
