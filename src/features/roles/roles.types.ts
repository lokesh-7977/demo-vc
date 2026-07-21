export type Role = {
  id: string
  name: string
  description: string
  isDefault: boolean
  isCustom: boolean
  permissionsCount: number
}

export type Permission = {
  id: string
  name: string
  description: string
  category: string
}

export type PermissionsByCategory = Record<string, Permission[]>
