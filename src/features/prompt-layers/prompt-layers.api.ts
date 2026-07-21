import { get, post, put, del } from '@/lib/api'
import type { PromptLayer, CreatePromptLayerPayload, UpdatePromptLayerPayload, ComposePreviewRequest, ComposePreviewResponse } from './prompt-layers.types'

export const promptLayerApi = {
  list: () => get<PromptLayer[]>('/prompt-layers/'),
  create: (payload: CreatePromptLayerPayload) => post<PromptLayer>('/prompt-layers/', payload),
  update: ({ id, ...body }: UpdatePromptLayerPayload) => put<PromptLayer>(`/prompt-layers/${id}`, body),
  remove: (id: string) => del(`/prompt-layers/${id}`),
  composePreview: (payload: ComposePreviewRequest) => post<ComposePreviewResponse>('/prompt-layers/compose-preview', payload),
}
