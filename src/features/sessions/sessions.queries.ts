import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { sessionApi } from './sessions.api'

export * from './sessions.types'
export { sessionApi } from './sessions.api'

const invalidateSessions = () => queryClient.invalidateQueries({ queryKey: ['sessions'] })

export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: sessionApi.list,
  })
}

export function useRevokeSession() {
  return useMutation({
    mutationFn: sessionApi.revoke,
    onSuccess: invalidateSessions,
  })
}

export function useRevokeAllSessions() {
  return useMutation({
    mutationFn: sessionApi.revokeAll,
    onSuccess: invalidateSessions,
  })
}
