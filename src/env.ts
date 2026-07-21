/**
 * Zod-validated environment config.
 *
 * Every `import.meta.env.VITE_*` value the app depends on is declared and
 * parsed here once, at module load. Missing or malformed values fail fast
 * with a clear message instead of surfacing as confusing runtime errors.
 *
 * Import `env` everywhere instead of touching `import.meta.env` directly.
 */

import { z } from 'zod'

const schema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:8000'),
  MODE: z.enum(['development', 'production', 'test']).default('development'),
})

const parsed = schema.safeParse(import.meta.env)

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  • ${i.path.join('.') || '(root)'}: ${i.message}`)
    .join('\n')
  throw new Error(
    `Invalid environment configuration:\n${issues}\n\n` +
      `Set the missing VITE_* values in your .env file and restart.`,
  )
}

export const env = parsed.data
export type Env = typeof env

/** Convenience derived flags. */
export const isProd = env.MODE === 'production'
export const isDev = env.MODE === 'development'
