/** Agents API layer. */

import { del, get, post, put } from '@/lib/api'
import type { Page } from '@/types/common.types'
import type {
  Agent,
  CreateAgentPayload,
  TestConversationPayload,
  TestConversationResult,
  UpdateAgentPayload,
} from './agents.types'

export const agentApi = {
  list: () => get<Page<Agent>>('/agents/'),

  create: (payload: CreateAgentPayload) => post<Agent>('/agents/', payload),

  update: ({ id, ...body }: UpdateAgentPayload) => put<Agent>(`/agents/${id}`, body),

  remove: (id: string) => del(`/agents/${id}`),

  deploy: (id: string) => post<Agent>(`/agents/${id}/deploy`),

  testConversation: (agentId: string, payload: TestConversationPayload) =>
    post<TestConversationResult>(`/agents/${agentId}/test-conversation`, payload),
}
