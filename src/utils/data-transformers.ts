/**
 * Recursive key-case transformers for the API boundary.
 *
 * Backend speaks snake_case; the frontend prefers camelCase. Wire these into
 * the axios instance (transformRequest → toSnakeCase, transformResponse →
 * toCamelCase) so components never see snake_case keys.
 *
 * NOTE: enabling these app-wide is an atomic migration — every field access
 * and type must move to camelCase at the same time, or reads break. The
 * guards below leave non-plain values (File/Blob/FormData/Date) untouched so
 * uploads and dates survive the transform.
 */

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object') return false
  if (Array.isArray(value)) return false
  if (value instanceof Date) return false
  if (typeof FormData !== 'undefined' && value instanceof FormData) return false
  if (typeof Blob !== 'undefined' && value instanceof Blob) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

export function toCamelCase<T>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map((v) => toCamelCase(v)) as unknown as T
  }
  if (isPlainObject(obj)) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k.replace(/_([a-z0-9])/g, (_, l: string) => l.toUpperCase()),
        toCamelCase(v),
      ]),
    ) as T
  }
  return obj as T
}

export function toSnakeCase<T>(obj: unknown): T {
  if (Array.isArray(obj)) {
    return obj.map((v) => toSnakeCase(v)) as unknown as T
  }
  if (isPlainObject(obj)) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k.replace(/([A-Z])/g, '_$1').toLowerCase(),
        toSnakeCase(v),
      ]),
    ) as T
  }
  return obj as T
}
