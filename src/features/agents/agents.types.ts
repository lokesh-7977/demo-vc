/** Agent domain types. */

export type AgentStatus = 'draft' | 'active' | 'paused' | 'archived'

export type Agent = {
  id: string
  name: string
  description?: string | null
  status: AgentStatus
  purpose?: string | null
  personalityId?: string | null
  templateId?: string | null
  voiceModelId?: string | null
  language: string
  greetingMessage?: string | null
  flowId?: string | null
  knowledgeBaseId?: string | null
  config?: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export type CreateAgentPayload = Partial<Agent> & { name: string }
export type UpdateAgentPayload = Partial<Agent> & { id: string }

export type TestConversationPayload = {
  message: string
  conversationHistory?: { role: string; content: string }[]
}

export type TestConversationResult = {
  reply: string
  layerTrace: unknown[]
  retrievedChunks: number
}
