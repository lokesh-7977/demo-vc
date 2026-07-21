/** Contacts API layer. */

import { del, get, post, postForm, put } from '@/lib/api'
import type { Page } from '@/types/common.types'
import type {
  Contact,
  CreateContactPayload,
  ImportContactsResult,
  UpdateContactPayload,
} from './contacts.types'

export const contactApi = {
  list: (search?: string) =>
    get<Page<Contact>>(
      `/contacts/?limit=200${search ? `&search=${encodeURIComponent(search)}` : ''}`,
    ),

  create: (payload: CreateContactPayload) => post<Contact>('/contacts/', payload),

  update: ({ id, ...body }: UpdateContactPayload) => put<Contact>(`/contacts/${id}`, body),

  remove: (id: string) => del(`/contacts/${id}`),

  import: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return postForm<ImportContactsResult>('/contacts/import', form)
  },
}
