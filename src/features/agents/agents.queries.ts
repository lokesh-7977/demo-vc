/** Agents React Query hooks. */

import { useMutation, useQuery } from '@tanstack/react-query'

import { queryClient } from '@/lib/query-client'
import { agentApi } from './agents.api'
import { agentKeys } from './agents.keys'
import type {
  CreateAgentPayload,
  TestConversationPayload,
  UpdateAgentPayload,
} from './agents.types'

export * from './agents.types'
export { agentKeys } from './agents.keys'
export { agentApi } from './agents.api'

const invalidateAgents = () =>
  queryClient.invalidateQueries({ queryKey: agentKeys.all })

export function useAgents() {
  return useQuery({
    queryKey: agentKeys.list(),
    queryFn: agentApi.list,
  })
}

export function useCreateAgent() {
  return useMutation({
    mutationFn: (payload: CreateAgentPayload) => agentApi.create(payload),
    onSuccess: invalidateAgents,
  })
}

export function useUpdateAgent() {
  return useMutation({
    mutationFn: (payload: UpdateAgentPayload) => agentApi.update(payload),
    onSuccess: invalidateAgents,
  })
}

export function useDeleteAgent() {
  return useMutation({
    mutationFn: (id: string) => agentApi.remove(id),
    onSuccess: invalidateAgents,
  })
}

export function useDeployAgent() {
  return useMutation({
    mutationFn: (id: string) => agentApi.deploy(id),
    onSuccess: invalidateAgents,
  })
}

export function useTestConversation(agentId: string) {
  return useMutation({
    mutationFn: (payload: TestConversationPayload) =>
      agentApi.testConversation(agentId, payload),
  })
}
