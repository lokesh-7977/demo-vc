/**
 * Auth/session store (Zustand).
 *
 * Access token is kept in memory only.
 * Refresh token lives in an httpOnly cookie the browser sends automatically.
 */

import { create } from 'zustand'

const LEGACY_ACCESS_TOKEN_KEY = 'voiceai_access_token'

export type AuthUser = {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
  fullName?: string | null
  phone?: string | null
  organizationId?: string | null
  role?: string | null
  permissions?: string[]
  emailVerified?: boolean | null
}

type AuthState = {
  user: AuthUser | null
  accessToken: string | null
  /** True while restoring session on page reload. */
  isRestoring: boolean

  setSession: (user: AuthUser, accessToken: string) => void
  setUser: (user: AuthUser) => void
  setAccessToken: (token: string) => void
  setRestoring: (v: boolean) => void
  logout: () => void
}

function clearLegacyStoredToken() {
  try {
    localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY)
  } catch {
    // localStorage unavailable (SSR / private browsing) - ignore
  }
}

clearLegacyStoredToken()

export const useAuth = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  isRestoring: true,

  setSession: (user, accessToken) => {
    set({ user, accessToken })
  },
  setUser: (user) => set({ user }),
  setAccessToken: (accessToken) => {
    set({ accessToken })
  },
  setRestoring: (isRestoring) => set({ isRestoring }),
  logout: () => {
    clearLegacyStoredToken()
    set({ user: null, accessToken: null, isRestoring: false })
  },
}))
