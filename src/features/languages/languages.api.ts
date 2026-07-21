import { get, post } from '@/lib/api'
import type { LanguageProfile, LanguageStats } from './languages.types'

export const languageApi = {
  list: () => get<{ languages: LanguageProfile[]; total: number }>('/languages/'),
  get: (code: string) => get<LanguageProfile>(`/languages/${code}`),
  listIndian: () => get<{ languages: LanguageProfile[]; total: number }>('/languages/indian/all'),
  listByRegion: (region: string) => get<{ languages: LanguageProfile[]; total: number }>(`/languages/region/${region}`),
  getStats: () => get<LanguageStats>('/languages/stats'),
  configure: (languageCodes: string[]) => post<{ languages: LanguageProfile[]; total: number }>('/languages/configure', { languageCodes }),
  detect: (languageName: string) => post<{ code: string; language: LanguageProfile }>(`/languages/detect?language_name=${languageName}`),
}
