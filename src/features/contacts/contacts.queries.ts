/** Contacts React Query hooks. */

import { useMutation, useQuery } from '@tanstack/react-query'

import { queryClient } from '@/lib/query-client'
import { contactApi } from './contacts.api'
import { contactKeys } from './contacts.keys'
import type { CreateContactPayload, UpdateContactPayload } from './contacts.types'

export * from './contacts.types'
export { contactKeys } from './contacts.keys'
export { contactApi } from './contacts.api'

const invalidateContacts = () =>
  queryClient.invalidateQueries({ queryKey: contactKeys.all })

export function useContacts(search?: string) {
  return useQuery({
    queryKey: contactKeys.list(search),
    queryFn: () => contactApi.list(search),
  })
}

export function useCreateContact() {
  return useMutation({
    mutationFn: (payload: CreateContactPayload) => contactApi.create(payload),
    onSuccess: invalidateContacts,
  })
}

export function useUpdateContact() {
  return useMutation({
    mutationFn: (payload: UpdateContactPayload) => contactApi.update(payload),
    onSuccess: invalidateContacts,
  })
}

export function useDeleteContact() {
  return useMutation({
    mutationFn: (id: string) => contactApi.remove(id),
    onSuccess: invalidateContacts,
  })
}

export function useImportContacts() {
  return useMutation({
    mutationFn: (file: File) => contactApi.import(file),
    onSuccess: invalidateContacts,
  })
}
