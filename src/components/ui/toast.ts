/**
 * Centralized toast helpers. Components call these instead of repeating
 * `toast.error(err.message || '…')` everywhere, so error/success copy and
 * behaviour stay consistent app-wide.
 */

import { toast } from 'sonner'

import { ApiError } from '@/lib/api'

/** Best-effort human message from any thrown value. */
export function errorMessage(err: unknown, fallback = 'Something went wrong'): string {
  if (err instanceof ApiError) return err.message || fallback
  if (err instanceof Error) return err.message || fallback
  if (typeof err === 'string') return err || fallback
  return fallback
}

/** Show an error toast for any thrown value. Returns the message used. */
export function handleError(err: unknown, fallback?: string): string {
  const message = errorMessage(err, fallback)
  toast.error(message)
  return message
}

/** Success toast with optional description (two-line Periskope style). */
export function handleSuccess(title: string, description?: string): void {
  toast.success(title, description ? { description } : undefined)
}

/** Info / warning passthroughs for symmetry. */
export const handleInfo = (title: string, description?: string) =>
  toast.info(title, description ? { description } : undefined)

export const handleWarning = (title: string, description?: string) =>
  toast.warning(title, description ? { description } : undefined)
