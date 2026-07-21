/**
 * Permission checking utilities.
 *
 * The backend returns a flat list of permission names like
 * "contacts.create", "calls.read", "billing.manage" in the
 * auth/me and login responses. This module provides helpers
 * to check those permissions client-side.
 */

import { useAuth } from '@/stores/auth-store'

// Stable reference — avoids new-array-per-render infinite loop with Zustand selectors
const EMPTY: readonly string[] = []

/**
 * Check if the current user has a specific permission.
 *
 * @example
 *   hasPermission('contacts.create')   // true if user can create contacts
 *   hasPermission('billing.*')         // true if user has ANY billing permission
 */
export function hasPermission(permission: string): boolean {
  const perms = useAuth.getState().user?.permissions
  if (!perms) return false

  // OWNER role typically has all permissions from the backend
  // But also check the wildcard pattern
  if (perms.includes('*')) return true

  // Exact match
  if (perms.includes(permission)) return true

  // Category wildcard: "contacts.*" matches "contacts.create"
  if (permission.includes('.*')) {
    const prefix = permission.slice(0, -1) // "contacts."
    return perms.some((p) => p.startsWith(prefix))
  }

  return false
}

/**
 * Check if the current user has ANY of the given permissions.
 */
export function hasAnyPermission(...permissions: string[]): boolean {
  return permissions.some((p) => hasPermission(p))
}

/**
 * Check if the current user has ALL of the given permissions.
 */
export function hasAllPermissions(...permissions: string[]): boolean {
  return permissions.every((p) => hasPermission(p))
}

/**
 * Hook form — re-renders when auth state changes.
 * Returns a checker function bound to the latest user.
 */
export function useHasPermission() {
  const permissions = useAuth((s) => s.user?.permissions ?? EMPTY as string[])

  return (permission: string): boolean => {
    if (permissions.includes('*')) return true
    if (permissions.includes(permission)) return true
    if (permission.includes('.*')) {
      const prefix = permission.slice(0, -1)
      return permissions.some((p) => p.startsWith(prefix))
    }
    return false
  }
}
