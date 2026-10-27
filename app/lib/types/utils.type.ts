/** Result of every 'use server' service call. Services never throw to the UI. */
export type ActionResult<T> =
  | { data: T; error: null }
  | {
      data: null
      error: string
      /** The API's machine-readable code when it sent one, e.g. `budget_exceeded`. */
      code?: string
    }

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type Paginated<T> = {
  data: T[]
  meta: PaginationMeta
}
