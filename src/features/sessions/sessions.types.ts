export type Session = {
  id: string
  device?: string | null
  browser?: string | null
  operatingSystem?: string | null
  ipAddress?: string | null
  location?: string | null
  loginAt: string
  lastActivityAt: string
  expiresAt: string
  revoked: boolean
}
