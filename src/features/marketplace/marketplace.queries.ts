/** Agent marketplace feature: types + API + React Query hooks. */

import { useMutation, useQuery } from '@tanstack/react-query'

import { get, post } from '@/lib/api'
import { queryClient } from '@/lib/query-client'
import type { Agent } from '@/features/agents/agents.types'

export type AgentTemplate = {
  id: string
  name: string
  description?: string | null
  industry: string
  category: string
  installCount: number
}

export type InstantiateTemplatePayload = { id: string; agentName: string }

export const marketplaceApi = {
  list: () => get<AgentTemplate[]>('/agent-templates/'),
  instantiate: ({ id, agentName }: InstantiateTemplatePayload) =>
    post<Agent>(`/agent-templates/${id}/instantiate`, { agentName }),
}

export function useAgentTemplates() {
  return useQuery({
    queryKey: ['agent-templates', 'list'],
    queryFn: marketplaceApi.list,
  })
}

export function useInstantiateTemplate() {
  return useMutation({
    mutationFn: (payload: InstantiateTemplatePayload) =>
      marketplaceApi.instantiate(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['agents'] }),
  })
}
