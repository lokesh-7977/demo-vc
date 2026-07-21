/** Number → agent routing feature: types + API + React Query hooks.
 *  Backend routes live under /exotel/numbers. */

import { useMutation, useQuery } from '@tanstack/react-query'

import { del, get, post } from '@/lib/api'
import { queryClient } from '@/lib/query-client'

export type NumberMapping = {
  id: string
  phoneNumber: string
  agentId?: string | null
  language?: string | null
  isActive: boolean
}

export type CreateNumberPayload = {
  phoneNumber: string
  agentId?: string
  language?: string
}

export const numberApi = {
  list: () => get<NumberMapping[]>('/exotel/numbers'),
  create: (payload: CreateNumberPayload) =>
    post<NumberMapping>('/exotel/numbers', payload),
  remove: (id: string) => del(`/exotel/numbers/${id}`),
}

const invalidateNumbers = () =>
  queryClient.invalidateQueries({ queryKey: ['numbers'] })

export function useNumbers() {
  return useQuery({ queryKey: ['numbers', 'list'], queryFn: numberApi.list })
}

export function useCreateNumber() {
  return useMutation({
    mutationFn: (payload: CreateNumberPayload) => numberApi.create(payload),
    onSuccess: invalidateNumbers,
  })
}

export function useDeleteNumber() {
  return useMutation({
    mutationFn: (id: string) => numberApi.remove(id),
    onSuccess: invalidateNumbers,
  })
}
