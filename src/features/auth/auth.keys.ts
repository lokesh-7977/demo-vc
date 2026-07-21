/** React Query keys for the auth domain — single source of truth. */

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
}
