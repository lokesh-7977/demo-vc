export type VoiceProfile = {
  voiceId: string
  name: string
  gender: string
  language: string
  tone: string
  accent?: string | null
  useCases: string[]
}

export type VoiceSearchPayload = {
  language?: string
  gender?: string
  tone?: string
  useCase?: string
}

export type VoiceRecommendPayload = {
  language: string
  gender?: string
  tone?: string
  useCase?: string
}
