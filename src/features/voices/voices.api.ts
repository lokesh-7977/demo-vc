import { get, post } from '@/lib/api'
import type { VoiceProfile, VoiceSearchPayload, VoiceRecommendPayload } from './voices.types'

export const voiceApi = {
  list: () => get<{ voices: VoiceProfile[]; total: number }>('/voices/'),
  get: (id: string) => get<VoiceProfile>(`/voices/${id}`),
  listByLanguage: (language: string) => get<{ voices: VoiceProfile[]; total: number }>(`/voices/language/${language}`),
  listByGender: (gender: string) => get<{ voices: VoiceProfile[]; total: number }>(`/voices/gender/${gender}`),
  listByTone: (tone: string) => get<{ voices: VoiceProfile[]; total: number }>(`/voices/tone/${tone}`),
  search: (payload: VoiceSearchPayload) => post<{ voices: VoiceProfile[]; total: number }>('/voices/search', payload),
  recommend: (payload: VoiceRecommendPayload) => post<VoiceProfile>('/voices/recommend', payload),
  getDefaultConfig: () => get<{ defaultVoiceId: string; defaultVoiceLanguage: string; supportedVoices: string[] }>('/voices/default/config'),
}
