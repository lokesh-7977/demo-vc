export const evalKeys = {
  all: ['evals'] as const,
  testCases: (page?: number) => [...evalKeys.all, 'test-cases', page ?? 1] as const,
  runs: (agentId?: string) => [...evalKeys.all, 'runs', agentId ?? ''] as const,
  runDetail: (id: string) => [...evalKeys.all, 'run', id] as const,
  metrics: () => [...evalKeys.all, 'metrics'] as const,
}
