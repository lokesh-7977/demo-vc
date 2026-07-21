import { get, post, put, del } from '@/lib/api'
import type { Campaign, CreateCampaignPayload, UpdateCampaignPayload, CampaignContact } from './campaigns.types'
import type { Page } from '@/types/common.types'

export const campaignApi = {
  list: (status?: string, skip = 0, limit = 50) => {
    const params = new URLSearchParams({ skip: String(skip), limit: String(limit) })
    if (status) params.set('status', status)
    return get<Page<Campaign>>(`/campaigns/?${params}`)
  },
  get: (id: string) => get<Campaign>(`/campaigns/${id}`),
  create: (payload: CreateCampaignPayload) => post<Campaign>('/campaigns/', payload),
  update: ({ id, ...body }: UpdateCampaignPayload) => put<Campaign>(`/campaigns/${id}`, body),
  remove: (id: string) => del(`/campaigns/${id}`),

  launch: (id: string) => post<Campaign>(`/campaigns/${id}/launch`),
  pause: (id: string) => post<Campaign>(`/campaigns/${id}/pause`),
  complete: (id: string) => post<Campaign>(`/campaigns/${id}/complete`),

  addContacts: (id: string, contactIds: string[]) =>
    post(`/campaigns/${id}/contacts`, { contactIds }),
  listContacts: (id: string, skip = 0, limit = 50) =>
    get<Page<CampaignContact>>(`/campaigns/${id}/contacts?skip=${skip}&limit=${limit}`),
}
