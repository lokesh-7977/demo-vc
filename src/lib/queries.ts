/**
 * Aggregate barrel for all feature React Query hooks + domain types.
 *
 * Components import from `@/lib/queries`; each feature owns its own
 * `*.queries.ts` slice (api + types + hooks). Keep this file re-exports only.
 */

export * from '@/features/auth/auth.queries'
export * from '@/features/agents/agents.queries'
export * from '@/features/contacts/contacts.queries'
export * from '@/features/organizations/organizations.queries'
export * from '@/features/calls/calls.queries'
export * from '@/features/usage/usage.queries'
export * from '@/features/providers/providers.queries'
export * from '@/features/numbers/numbers.queries'
export * from '@/features/marketplace/marketplace.queries'
export * from '@/features/knowledge-bases/knowledge-bases.queries'
export * from '@/features/team/team.queries'
export * from '@/features/flows/flows.queries'
export * from '@/features/campaigns/campaigns.queries'
export * from '@/features/prompts/prompts.queries'
export * from '@/features/evals/evals.queries'
export * from '@/features/personalities/personalities.queries'
export * from '@/features/prompt-layers/prompt-layers.queries'
export * from '@/features/languages/languages.queries'
export * from '@/features/voices/voices.queries'
export * from '@/features/roles/roles.queries'
export * from '@/features/sessions/sessions.queries'
export * from '@/features/billing/billing.queries'
export * from '@/features/audit/audit.queries'
export * from '@/features/onboarding/onboarding.queries'
