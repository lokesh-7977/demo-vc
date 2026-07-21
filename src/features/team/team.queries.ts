/** Team (employees, invitations) feature: types + API + hooks. */

import { useMutation, useQuery } from '@tanstack/react-query'

import { get, post } from '@/lib/api'
import { queryClient } from '@/lib/query-client'

export type Employee = {
  id: string
  firstName: string
  lastName: string
  email: string
  role?: string | null
  isActive: boolean
}

export type Invitation = {
  id: string
  email: string
  status: string
  expiresAt: string
}

export type InviteEmployeePayload = { email: string; roleId: string }

export type InviteResult = { inviteUrl: string; emailSent: boolean }

export const teamApi = {
  employees: () => get<Employee[]>('/employees'),
  invitations: () => get<Invitation[]>('/employees/invitations'),
  roles: () => get<{ id: string; name: string }[]>('/roles'),
  invite: (payload: InviteEmployeePayload) =>
    post<InviteResult>('/employees/invite', payload),
}

export function useEmployees() {
  return useQuery({ queryKey: ['employees', 'list'], queryFn: teamApi.employees })
}

export function useEmployeeInvitations() {
  return useQuery({
    queryKey: ['employees', 'invitations'],
    queryFn: teamApi.invitations,
  })
}

export function useInviteEmployee() {
  return useMutation({
    mutationFn: (payload: InviteEmployeePayload) => teamApi.invite(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['employees'] }),
  })
}
