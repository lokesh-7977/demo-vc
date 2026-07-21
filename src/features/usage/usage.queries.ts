/** Usage/billing feature: types + API + React Query hooks. */

import { useQuery } from '@tanstack/react-query'

import { get } from '@/lib/api'

export type UsageSummary = {
  callsCount: number
  callMinutes: number
  ttsCharacters: number
  llmTokens: number
  periodStart: string
  periodEnd: string
  amountDue: number
}

export type UsagePeriod = {
  periodStart: string
  periodEnd?: string
  callsCount: number
  callMinutes: number
}

export const usageApi = {
  current: () => get<UsageSummary>('/usage/current'),
  history: () => get<UsagePeriod[]>('/usage/history'),
}

export function useUsage() {
  return useQuery({ queryKey: ['usage', 'current'], queryFn: usageApi.current })
}

export function useUsageHistory() {
  return useQuery({ queryKey: ['usage', 'history'], queryFn: usageApi.history })
}
