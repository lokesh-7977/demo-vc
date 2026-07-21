/** Auth React Query hooks — reads (useQuery) and writes (useMutation). */

import { useMutation, useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { queryClient } from '@/lib/query-client'
import { useAuth, type AuthUser } from '@/stores/auth-store'
import { authApi } from './auth.api'
import { authKeys } from './auth.keys'
import type { LoginPayload } from './auth.types'

export * from './auth.types'
export { authKeys } from './auth.keys'
export { authApi } from './auth.api'

export function useLogin() {
  const setSession = useAuth((s) => s.setSession)
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (data) => {
      setSession(data.user, data.tokens.access_token)
    },
  })
}

export function useMe(options?: Partial<UseQueryOptions<AuthUser>>) {
  const user = useAuth((s) => s.user)
  const accessToken = useAuth((s) => s.accessToken)
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authApi.me(),
    enabled: !user && !!accessToken,
    ...options,
  })
}

export function useLogout() {
  const logout = useAuth((s) => s.logout)
  return () => {
    authApi.logout().catch(() => {})
    logout()
    queryClient.clear()
  }
}
