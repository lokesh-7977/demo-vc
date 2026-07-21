import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { promptApi } from './prompts.api'
import { promptKeys } from './prompts.keys'

export * from './prompts.types'
export { promptKeys } from './prompts.keys'
export { promptApi } from './prompts.api'

const invalidatePrompts = () => queryClient.invalidateQueries({ queryKey: promptKeys.all })

export function usePrompts() {
  return useQuery({
    queryKey: promptKeys.list(),
    queryFn: promptApi.list,
  })
}

export function usePrompt(id: string) {
  return useQuery({
    queryKey: promptKeys.detail(id),
    queryFn: () => promptApi.get(id),
    enabled: !!id,
  })
}

export function useCreatePrompt() {
  return useMutation({
    mutationFn: promptApi.create,
    onSuccess: invalidatePrompts,
  })
}

export function useUpdatePrompt() {
  return useMutation({
    mutationFn: promptApi.update,
    onSuccess: invalidatePrompts,
  })
}

export function useDeletePrompt() {
  return useMutation({
    mutationFn: promptApi.remove,
    onSuccess: invalidatePrompts,
  })
}

export function usePublishPrompt() {
  return useMutation({
    mutationFn: (id: string) => promptApi.publish(id),
    onSuccess: invalidatePrompts,
  })
}

export function useRollbackPrompt() {
  return useMutation({
    mutationFn: ({ id, targetVersion }: { id: string; targetVersion: number }) =>
      promptApi.rollback(id, targetVersion),
    onSuccess: invalidatePrompts,
  })
}

export function usePromptVersions(id: string) {
  return useQuery({
    queryKey: promptKeys.versions(id),
    queryFn: () => promptApi.listVersions(id),
    enabled: !!id,
  })
}

export function usePromptPlayground() {
  return useMutation({
    mutationFn: ({ id, question, values }: { id: string; question: string; values?: Record<string, string> }) =>
      promptApi.playground(id, question, values),
  })
}
