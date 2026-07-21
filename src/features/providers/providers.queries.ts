/** Providers (BYOK) feature: types + API + React Query hooks. */

import { useMutation, useQuery } from '@tanstack/react-query'

import { get, post } from '@/lib/api'
import { queryClient } from '@/lib/query-client'

export type Provider = {
  id: string
  providerType: string
  providerName: string
  verificationStatus: string
  verificationError?: string | null
}

export type CreateProviderPayload = {
  providerType: string
  providerName: string
  credentials: Record<string, string>
  config?: Record<string, unknown>
  label?: string
}

export const providerApi = {
  list: () => get<Provider[]>('/providers'),
  create: (payload: CreateProviderPayload) => post<Provider>('/providers', payload),
  verify: (id: string) => post<Provider>(`/providers/${id}/verify`),
}

const invalidateProviders = () =>
  queryClient.invalidateQueries({ queryKey: ['providers'] })

export function useProviders() {
  return useQuery({ queryKey: ['providers', 'list'], queryFn: providerApi.list })
}

export function useCreateProvider() {
  return useMutation({
    mutationFn: (payload: CreateProviderPayload) => providerApi.create(payload),
    onSuccess: invalidateProviders,
  })
}

export function useVerifyProvider() {
  return useMutation({
    mutationFn: (id: string) => providerApi.verify(id),
    onSuccess: invalidateProviders,
  })
}
