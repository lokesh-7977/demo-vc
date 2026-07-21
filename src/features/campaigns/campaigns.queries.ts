import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { campaignApi } from './campaigns.api'
import { campaignKeys } from './campaigns.keys'

export * from './campaigns.types'
export { campaignKeys } from './campaigns.keys'
export { campaignApi } from './campaigns.api'

const invalidateCampaigns = () => queryClient.invalidateQueries({ queryKey: campaignKeys.all })

export function useCampaigns(status?: string) {
  return useQuery({
    queryKey: campaignKeys.list(status),
    queryFn: () => campaignApi.list(status),
  })
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: () => campaignApi.get(id),
    enabled: !!id,
  })
}

export function useCreateCampaign() {
  return useMutation({
    mutationFn: campaignApi.create,
    onSuccess: invalidateCampaigns,
  })
}

export function useUpdateCampaign() {
  return useMutation({
    mutationFn: campaignApi.update,
    onSuccess: invalidateCampaigns,
  })
}

export function useDeleteCampaign() {
  return useMutation({
    mutationFn: campaignApi.remove,
    onSuccess: invalidateCampaigns,
  })
}

export function useLaunchCampaign() {
  return useMutation({
    mutationFn: (id: string) => campaignApi.launch(id),
    onSuccess: invalidateCampaigns,
  })
}

export function usePauseCampaign() {
  return useMutation({
    mutationFn: (id: string) => campaignApi.pause(id),
    onSuccess: invalidateCampaigns,
  })
}

export function useCampaignContacts(id: string) {
  return useQuery({
    queryKey: campaignKeys.contacts(id),
    queryFn: () => campaignApi.listContacts(id),
    enabled: !!id,
  })
}
