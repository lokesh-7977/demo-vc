import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { promptLayerApi } from './prompt-layers.api'

export * from './prompt-layers.types'
export { promptLayerApi } from './prompt-layers.api'

const invalidateLayers = () => queryClient.invalidateQueries({ queryKey: ['prompt-layers'] })

export function usePromptLayers() {
  return useQuery({
    queryKey: ['prompt-layers'],
    queryFn: promptLayerApi.list,
  })
}

export function useCreatePromptLayer() {
  return useMutation({
    mutationFn: promptLayerApi.create,
    onSuccess: invalidateLayers,
  })
}

export function useUpdatePromptLayer() {
  return useMutation({
    mutationFn: promptLayerApi.update,
    onSuccess: invalidateLayers,
  })
}

export function useDeletePromptLayer() {
  return useMutation({
    mutationFn: promptLayerApi.remove,
    onSuccess: invalidateLayers,
  })
}

export function useComposePreview() {
  return useMutation({
    mutationFn: promptLayerApi.composePreview,
  })
}
