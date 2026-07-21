export type KnowledgeBase = {
  id: string
  organizationId: string
  agentId?: string | null
  name: string
  description?: string | null
  isActive: boolean
  status: string
  createdAt: string
  updatedAt: string
}

export type CreateKnowledgeBasePayload = {
  name: string
  description?: string
}

export type UpdateKnowledgeBasePayload = {
  id: string
  name?: string
  description?: string
  isActive?: boolean
  status?: string
}

export type DocumentListItem = {
  documentId: string
  name: string
  status: string
  language?: string | null
  chunkCount: number
  fileSize: number
  version: number
  isLatest: boolean
  createdAt: string
}

export type DocumentVersion = {
  id: string
  version: number
  isLatest: boolean
  status: string
  fileSizeBytes: number
  checksum?: string | null
  createdAt: string
}

export type Source = {
  id: string
  knowledgeBaseId: string
  sourceType: string
  sourceUrl: string
  syncStatus: string
  documentId?: string | null
}

export type PlaygroundResponse = {
  question: string
  results: Array<{ content: string; score: number; metadata?: Record<string, unknown> }>
}
