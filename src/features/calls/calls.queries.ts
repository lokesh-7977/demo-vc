/** Calls feature: types + API + React Query hooks. */

import { useQuery } from '@tanstack/react-query'

import { get } from '@/lib/api'
import type { Page } from '@/types/common.types'

export type CallTurn = {
  turnIndex: number
  role: string
  text: string
  totalLatencyMs?: number | null
}

export type CallRecord = {
  id: string
  direction: string
  status: string
  toNumber?: string | null
  fromNumber?: string | null
  durationSeconds: number
  disposition?: string | null
  startedAt?: string | null
  provider?: string | null
  language?: string | null
  isTest?: boolean
  turns?: CallTurn[]
}

export type CallFilters = { direction?: string }

/** One point in the dashboard's daily-calls series. */
export type DailyCallStat = { date: string; count: number }

export const callApi = {
  list: (filters?: CallFilters) =>
    get<Page<CallRecord>>(
      `/calls/${filters?.direction ? `?direction=${filters.direction}` : ''}`,
    ),
  get: (id: string) => get<CallRecord>(`/calls/${id}`),
  dailyStats: (days = 7) => get<DailyCallStat[]>(`/calls/stats/daily?days=${days}`),
}

export function useCalls(filters?: CallFilters) {
  return useQuery({
    queryKey: ['calls', 'list', filters ?? {}],
    queryFn: () => callApi.list(filters),
  })
}

export function useCall(id?: string) {
  return useQuery({
    queryKey: ['calls', 'detail', id],
    queryFn: () => callApi.get(id as string),
    enabled: !!id,
  })
}

export function useDailyCallStats(days = 7) {
  return useQuery({
    queryKey: ['calls', 'daily-stats', days],
    queryFn: () => callApi.dailyStats(days),
  })
}
