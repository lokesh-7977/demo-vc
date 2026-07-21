import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { personalityApi } from './personalities.api'

export * from './personalities.types'
export { personalityApi } from './personalities.api'

const invalidatePersonalities = () => queryClient.invalidateQueries({ queryKey: ['personalities'] })

export function usePersonalities() {
  return useQuery({
    queryKey: ['personalities'],
    queryFn: personalityApi.list,
  })
}

export function useCreatePersonality() {
  return useMutation({
    mutationFn: personalityApi.create,
    onSuccess: invalidatePersonalities,
  })
}

export function useDeletePersonality() {
  return useMutation({
    mutationFn: personalityApi.remove,
    onSuccess: invalidatePersonalities,
  })
}
