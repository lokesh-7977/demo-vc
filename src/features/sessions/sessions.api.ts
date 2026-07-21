import { get, del } from '@/lib/api'
import type { Session } from './sessions.types'
import type { Page } from '@/types/common.types'

export const sessionApi = {
  list: () => get<Session[]>('/sessions/'),
  revoke: (id: string) => del(`/sessions/${id}`),
  revokeAll: () => del('/sessions/'),
}
