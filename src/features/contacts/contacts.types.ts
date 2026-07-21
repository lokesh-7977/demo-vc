/** Contact (lead) domain types. */

export type Contact = {
  id: string
  phone: string
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  attributes?: Record<string, string> | null
  source?: string | null
  createdAt: string
}

export type CreateContactPayload = Partial<Contact> & { phone: string }
export type UpdateContactPayload = Partial<Contact> & { id: string }

export type ImportContactsResult = {
  created: number
  updated: number
  skipped: number
}
