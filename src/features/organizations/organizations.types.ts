/** Organization domain types. */

export type Organization = {
  id: string
  name: string
  website?: string | null
  timezone?: string | null
  logoUrl?: string | null
  sector?: string | null
  orgType?: string | null
  [key: string]: unknown
}

export type UpdateOrganizationPayload = {
  name?: string
  website?: string
  timezone?: string
}
