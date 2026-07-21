import { useEffect, useState } from 'react'

/**
 * Returns a debounced copy of `value` that only updates after `delayMs` of
 * no changes. Use for search inputs so we don't fire a query per keystroke.
 *
 * @example
 * const [q, setQ] = useState('')
 * const debouncedQ = useDebounce(q, 300)
 * const { data } = useContacts(debouncedQ)
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])

  return debounced
}
