/**
 * Axios API client - cookie-backed auth.
 *
 * Access token: kept in Zustand memory only, sent via Authorization header.
 * Refresh token: httpOnly cookie, sent automatically by the browser.
 *
 * On 401 the interceptor silently calls POST /auth/refresh, stores the new
 * access token in memory, then replays the failed request. If refresh fails,
 * the user is redirected to login.
 *
 * Thin `get/post/put/patch/del/postForm` helpers unwrap the backend envelope
 * `{ success, data, message }` and return the inner `data` typed as `T`.
 */

import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import { toast } from 'sonner'

import { env } from '@/env'
import { LOGIN_PATH } from '@/utils/constants'
import { toCamelCase, toSnakeCase } from '@/utils/data-transformers'
import { useAuth } from '@/stores/auth-store'

export const API_URL = env.VITE_API_URL

/** Backend response envelope. */
type Envelope<T> = { success: boolean; data: T; message?: string }

/** FastAPI HTTPException shape. */
type HttpDetail = { detail?: string }

/** Normalized error thrown by the helpers so callers get a stable shape. */
export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,

  transformRequest: [
    (data: unknown): unknown => {
      if (data && typeof data === 'object') {
        return toSnakeCase<unknown>(data)
      }
      return data
    },
    ...(axios.defaults.transformRequest as Array<(data: unknown) => unknown>),
  ],

  transformResponse: [
    ...(axios.defaults.transformResponse as Array<(data: unknown) => unknown>),
    (data: unknown): unknown => {
      if (data && typeof data === 'object') {
        return toCamelCase<unknown>(data)
      }
      return data
    },
  ],
})

/**
 * Raw axios instance used by restoreSession so reload auth checks do not trigger
 * the global 401 -> refresh -> redirect interceptor.
 */
const raw = axios.create({ baseURL: API_URL, withCredentials: true })

api.interceptors.request.use((config) => {
  const token = useAuth.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise: Promise<boolean> | null = null

/**
 * Exchange the httpOnly refresh cookie for a fresh in-memory access token.
 * Single-flight: concurrent 401s share one in-flight refresh request.
 */
function silentRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${API_URL}/auth/refresh`, null, { withCredentials: true })
      .then((res) => {
        const envelope = res.data as Envelope<{ access_token: string }>
        const newToken = envelope?.data?.access_token
        if (newToken) {
          useAuth.getState().setAccessToken(newToken)
          return true
        }
        return false
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  async (error: AxiosError): Promise<unknown> => {
    const status = error.response?.status
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined

    const isRefreshCall = original?.url?.includes('/auth/refresh')
    if (status === 401 && original && !original._retry && !isRefreshCall) {
      original._retry = true
      const ok = await silentRefresh()
      if (ok) {
        return api(original)
      }

      useAuth.getState().logout()
      if (window.location.pathname !== LOGIN_PATH) {
        window.location.href = LOGIN_PATH
      }
    }

    if (status === 500) {
      const body = error.response?.data as (Envelope<unknown> & HttpDetail) | undefined
      const msg = body?.message || body?.detail || 'Internal Server Error - Please try again later.'
      toast.error(msg)
    }

    return Promise.reject(error)
  },
)

/**
 * Restore the session after a full page reload.
 *
 * Access tokens are not persisted. On reload, use only the httpOnly refresh
 * cookie to mint a new in-memory access token, then fetch the current user.
 */
export async function restoreSession(): Promise<boolean> {
  try {
    const ok = await silentRefresh()
    if (!ok) return false

    const newToken = useAuth.getState().accessToken
    if (!newToken) return false

    const { data: envelope } = await raw.get<Envelope<Record<string, unknown>>>(
      '/auth/me',
      {
        headers: { Authorization: `Bearer ${newToken}` },
        signal: AbortSignal.timeout(10_000),
      },
    )

    if (envelope.data) {
      const user = toCamelCase<import('@/stores/auth-store').AuthUser>(envelope.data)
      useAuth.getState().setUser(user)
      return true
    }
    return false
  } catch {
    return false
  }
}

/** Unwrap `{ success, data }` envelope and surface a normalized ApiError. */
async function request<T>(p: Promise<AxiosResponse<Envelope<T>>>): Promise<T> {
  try {
    const res = await p
    const body = res.data
    return (body && typeof body === 'object' && 'data' in body
      ? body.data
      : (body as unknown as T)) as T
  } catch (err) {
    if (err instanceof AxiosError) {
      const respData = err.response?.data as (Envelope<unknown> & HttpDetail) | undefined
      const message =
        respData?.message || respData?.detail || err.message || 'Request failed'
      throw new ApiError(message, err.response?.status ?? 0, respData?.data)
    }
    throw err
  }
}

export const get = <T>(url: string, config?: InternalAxiosRequestConfig) =>
  request<T>(api.get(url, config))

export const post = <T>(url: string, body?: unknown) =>
  request<T>(api.post(url, body))

export const put = <T>(url: string, body?: unknown) =>
  request<T>(api.put(url, body))

export const patch = <T>(url: string, body?: unknown) =>
  request<T>(api.patch(url, body))

export const del = <T = void>(url: string) =>
  request<T>(api.delete(url))

/** Multipart upload - skips JSON body transform. */
export const postForm = <T>(url: string, form: FormData) =>
  request<T>(
    api.post(url, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  )
