import { useMutation, useQuery } from '@tanstack/react-query'
import { voiceApi } from './voices.api'
import type { VoiceSearchPayload, VoiceRecommendPayload } from './voices.types'

export * from './voices.types'
export { voiceApi } from './voices.api'

export function useVoices() {
  return useQuery({
    queryKey: ['voices'],
    queryFn: voiceApi.list,
  })
}

export function useVoiceSearch(filters: VoiceSearchPayload) {
  return useQuery({
    queryKey: ['voices', 'search', filters],
    queryFn: () => voiceApi.search(filters),
  })
}

export function useVoiceRecommend() {
  return useMutation({
    mutationFn: voiceApi.recommend,
  })
}

export function useVoiceDefaultConfig() {
  return useQuery({
    queryKey: ['voices', 'default-config'],
    queryFn: voiceApi.getDefaultConfig,
  })
}
