/** Cross-feature shared types. */

/** Standard paginated list envelope returned by the backend. */
export type Page<T> = {
  items: T[]
  total: number
  skip?: number
  limit?: number
}

/** Backend response envelope `{ success, data, message }` (unwrapped by the
 *  api client, declared here for the rare raw consumer). */
export type Envelope<T> = {
  success: boolean
  data: T
  message?: string
}
