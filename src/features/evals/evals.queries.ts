import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { evalApi } from './evals.api'
import { evalKeys } from './evals.keys'

export * from './evals.types'
export { evalKeys } from './evals.keys'
export { evalApi } from './evals.api'

const invalidateEvals = () => queryClient.invalidateQueries({ queryKey: evalKeys.all })

export function useTestCases(page?: number) {
  return useQuery({
    queryKey: evalKeys.testCases(page),
    queryFn: () => evalApi.listTestCases(page),
  })
}

export function useCreateTestCase() {
  return useMutation({
    mutationFn: evalApi.createTestCase,
    onSuccess: invalidateEvals,
  })
}

export function useDeleteTestCase() {
  return useMutation({
    mutationFn: evalApi.deleteTestCase,
    onSuccess: invalidateEvals,
  })
}

export function useEvalRuns(agentId?: string) {
  return useQuery({
    queryKey: evalKeys.runs(agentId),
    queryFn: () => evalApi.listRuns(agentId),
  })
}

export function useCreateEvalRun() {
  return useMutation({
    mutationFn: evalApi.createRun,
    onSuccess: invalidateEvals,
  })
}

export function useEvalRun(runId: string) {
  return useQuery({
    queryKey: evalKeys.runDetail(runId),
    queryFn: () => evalApi.getRun(runId),
    enabled: !!runId,
  })
}

export function useEvalMetrics() {
  return useQuery({
    queryKey: evalKeys.metrics(),
    queryFn: evalApi.getMetrics,
  })
}
