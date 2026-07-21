import { get, post, put, del } from '@/lib/api'
import type { Prompt, CreatePromptPayload, UpdatePromptPayload, PromptVersion, PromptPreview } from './prompts.types'

export const promptApi = {
  list: () => get<Prompt[]>('/prompts/'),
  get: (id: string) => get<Prompt>(`/prompts/${id}`),
  create: (payload: CreatePromptPayload) => post<Prompt>('/prompts/', payload),
  update: ({ id, ...body }: UpdatePromptPayload) => put<Prompt>(`/prompts/${id}`, body),
  remove: (id: string) => del(`/prompts/${id}`),

  updateVariables: (id: string, variables: Record<string, string>) =>
    put<{ count: number; variables: Record<string, string> }>(`/prompts/${id}/variables`, { variables }),
  publish: (id: string) => post<{ promptId: string; version: number }>(`/prompts/${id}/publish`),
  rollback: (id: string, targetVersion: number) =>
    post<{ promptId: string; version: number }>(`/prompts/${id}/rollback`, { targetVersion }),
  listVersions: (id: string) => get<PromptVersion[]>(`/prompts/${id}/versions`),
  playground: (id: string, question: string, values?: Record<string, string>) =>
    post<PromptPreview>(`/prompts/${id}/playground`, { question, values }),
}
