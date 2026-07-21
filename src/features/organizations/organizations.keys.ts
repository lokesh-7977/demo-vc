/** React Query keys for the organization domain. */

export const orgKeys = {
  all: ['org'] as const,
  me: () => [...orgKeys.all, 'me'] as const,
}
