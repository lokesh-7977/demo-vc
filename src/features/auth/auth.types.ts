/** Auth domain types — request payloads and response shapes. */

import type { AuthUser } from '@/stores/auth-store'

export type { AuthUser }

/** Login response — access token in body, refresh token in httpOnly cookie. */
export type AuthPayload = {
  user: AuthUser & Record<string, unknown>
  tokens: {
    access_token: string
    expires_in: number
  }
}

export type LoginPayload = {
  email: string
  password: string
}
