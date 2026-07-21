/** Auth API layer — typed functions that hit the backend. No React here. */

import { get, post } from '@/lib/api'
import type { AuthUser } from '@/stores/auth-store'
import type { AuthPayload, LoginPayload } from './auth.types'

export const authApi = {
  login: (payload: LoginPayload) => post<AuthPayload>('/auth/login', payload),

  me: () => get<AuthUser>('/auth/me'),

  logout: () => post('/auth/logout'),
}
