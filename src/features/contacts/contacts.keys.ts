/** React Query keys for the contacts domain. */

export const contactKeys = {
  all: ['contacts'] as const,
  list: (search?: string) => [...contactKeys.all, 'list', search ?? ''] as const,
}
