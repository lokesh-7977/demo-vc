export type Prompt = {
  id: string
  organizationId: string
  agentId?: string | null
  title: string
  status: string
  systemPrompt: string
  personality?: string | null
  role?: string | null
  businessGoal?: string | null
  greeting?: string | null
  closingMessage?: string | null
  currentVersion: number
  publishedVersionId?: string | null
  createdAt: string
  updatedAt: string
}

export type CreatePromptPayload = {
  title: string
  systemPrompt?: string
  agentId?: string
  personality?: string
  role?: string
  businessGoal?: string
  greeting?: string
  closingMessage?: string
}

export type UpdatePromptPayload = {
  id: string
  title?: string
  systemPrompt?: string
  personality?: string
  role?: string
  businessGoal?: string
  greeting?: string
  closingMessage?: string
}

export type PromptVersion = {
  id: string
  version: number
  isLatest: boolean
  createdAt: string
}

export type PromptPreview = {
  question: string
  finalPrompt: string
  greeting?: string | null
  closingMessage?: string | null
  unresolvedVariables: string[]
  declaredVariables: string[]
  tokenCount: number
  latencyMs: number
}
