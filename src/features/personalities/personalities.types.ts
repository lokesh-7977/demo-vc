export type Personality = {
  id: string
  organizationId?: string | null
  key: string
  name: string
  description?: string | null
  promptFragment: string
  voiceDefaults?: Record<string, unknown> | null
  isActive: boolean
}

export type CreatePersonalityPayload = {
  key: string
  name: string
  description?: string
  promptFragment: string
  voiceDefaults?: Record<string, unknown>
}
