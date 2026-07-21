import { get, post, del } from '@/lib/api'
import type { Personality, CreatePersonalityPayload } from './personalities.types'

export const personalityApi = {
  list: () => get<Personality[]>('/personalities/'),
  create: (payload: CreatePersonalityPayload) => post<Personality>('/personalities/', payload),
  remove: (id: string) => del(`/personalities/${id}`),
}
