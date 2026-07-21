/** Organizations API layer. */

import { get, patch } from '@/lib/api'
import type { Organization, UpdateOrganizationPayload } from './organizations.types'

export const organizationApi = {
  me: () => get<Organization>('/organizations/me'),

  update: (payload: UpdateOrganizationPayload) =>
    patch<Organization>('/organizations/me', payload),
}
