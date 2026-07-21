import { useMutation, useQuery } from '@tanstack/react-query'
import { languageApi } from './languages.api'

export * from './languages.types'
export { languageApi } from './languages.api'

export function useLanguages() {
  return useQuery({
    queryKey: ['languages'],
    queryFn: languageApi.list,
  })
}

export function useIndianLanguages() {
  return useQuery({
    queryKey: ['languages', 'indian'],
    queryFn: languageApi.listIndian,
  })
}

export function useLanguageStats() {
  return useQuery({
    queryKey: ['languages', 'stats'],
    queryFn: languageApi.getStats,
  })
}

export function useConfigureLanguages() {
  return useMutation({
    mutationFn: (codes: string[]) => languageApi.configure(codes),
  })
}
