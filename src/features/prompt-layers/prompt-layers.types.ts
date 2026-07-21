export type PromptLayer = {
  id: string
  scope: 'organization' | 'campaign'
  organizationId?: string | null
  industry?: string | null
  campaignId?: string | null
  content: string
  variables?: Record<string, string> | null
  version: number
  status: string
  priority: number
  createdAt: string
  updatedAt: string
}

export type CreatePromptLayerPayload = {
  scope: 'organization' | 'campaign'
  content: string
  campaignId?: string
  variables?: Record<string, string>
  priority?: number
}

export type UpdatePromptLayerPayload = {
  id: string
  content?: string
  variables?: Record<string, string>
  priority?: number
}

export type ComposePreviewRequest = {
  agentId?: string
  campaignId?: string
  runtimeVars?: Record<string, unknown>
}

export type ComposePreviewResponse = {
  systemPrompt: string
  layerTrace: Array<{ layerId: string; scope: string; content: string }>
  charCount: number
}
