/** Flows feature: types + API + React Query hooks.
 *
 * Graph node/edge fields are camelCase on the client; the axios request
 * transform converts them to snake_case (node_type, position_x, source_node…)
 * for the backend flow engine, and the response transform converts back.
 */

import { useMutation, useQuery } from '@tanstack/react-query'

import { get, post, put } from '@/lib/api'
import { queryClient } from '@/lib/query-client'

export type Flow = {
  id: string
  name: string
  version: number
  status: string
}

export type GraphNode = {
  id: string
  nodeType: string
  configuration: Record<string, unknown>
  positionX: number
  positionY: number
}

export type GraphEdge = {
  sourceNode: string
  targetNode: string
  condition?: Record<string, unknown> | null
}

export type FlowGraph = { nodes: GraphNode[]; edges: GraphEdge[] }

export type ValidateReport = { valid: boolean; errors: string[] }

export type CreateFlowPayload = { name: string; agentId?: string }

export type ExecuteFlowPayload = {
  conversationId: string
  userInput?: string
  language?: string
}

export type ExecuteFlowResult = { outputs: string[]; isComplete: boolean }

export const flowApi = {
  list: (agentId?: string) =>
    get<Flow[]>(`/flows/${agentId ? `?agent_id=${agentId}` : ''}`),
  create: (payload: CreateFlowPayload) => post<Flow>('/flows/', payload),
  graph: (flowId: string) => get<FlowGraph>(`/flows/${flowId}/graph`),
  saveGraph: (flowId: string, graph: FlowGraph) =>
    put<FlowGraph>(`/flows/${flowId}/graph`, graph),
  validate: (flowId: string) =>
    post<ValidateReport>(`/flows/${flowId}/validate`),
  publish: (flowId: string) => post<Flow>(`/flows/${flowId}/publish`),
  execute: (flowId: string, payload: ExecuteFlowPayload) =>
    post<ExecuteFlowResult>(`/flows/${flowId}/execute`, payload),
}

const invalidateFlows = () =>
  queryClient.invalidateQueries({ queryKey: ['flows'] })

export function useFlows(agentId?: string) {
  return useQuery({
    queryKey: ['flows', 'list', agentId ?? null],
    queryFn: () => flowApi.list(agentId),
  })
}

export function useFlowGraph(flowId?: string) {
  return useQuery({
    queryKey: ['flows', 'graph', flowId],
    queryFn: () => flowApi.graph(flowId as string),
    enabled: !!flowId,
  })
}

export function useCreateFlow() {
  return useMutation({
    mutationFn: (payload: CreateFlowPayload) => flowApi.create(payload),
    onSuccess: invalidateFlows,
  })
}

export function useSaveFlowGraph() {
  return useMutation({
    mutationFn: ({ flowId, graph }: { flowId: string; graph: FlowGraph }) =>
      flowApi.saveGraph(flowId, graph),
    onSuccess: (_data, { flowId }) =>
      queryClient.invalidateQueries({ queryKey: ['flows', 'graph', flowId] }),
  })
}

export function useValidateFlow() {
  return useMutation({
    mutationFn: (flowId: string) => flowApi.validate(flowId),
  })
}

export function usePublishFlow() {
  return useMutation({
    mutationFn: (flowId: string) => flowApi.publish(flowId),
    onSuccess: invalidateFlows,
  })
}

export function useExecuteFlow(flowId: string) {
  return useMutation({
    mutationFn: (payload: ExecuteFlowPayload) => flowApi.execute(flowId, payload),
  })
}
