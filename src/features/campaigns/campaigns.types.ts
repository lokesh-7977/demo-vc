export type Campaign = {
  id: string
  name: string
  description?: string | null
  agentId: string
  direction: 'outbound' | 'inbound'
  status: string
  schedule?: Record<string, unknown> | null
  callerNumber?: string | null
  goal?: Record<string, unknown> | null
  stats?: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export type CreateCampaignPayload = {
  name: string
  agentId: string
  direction: 'outbound' | 'inbound'
  description?: string
  schedule?: Record<string, unknown>
  callerNumber?: string
  goal?: Record<string, unknown>
}

export type UpdateCampaignPayload = {
  id: string
  name?: string
  description?: string
  schedule?: Record<string, unknown>
  callerNumber?: string
  goal?: Record<string, unknown>
}

export type CampaignContact = {
  id: string
  contactId: string
  status: string
  attempts: number
  lastCallId?: string | null
  outcome?: string | null
}
