import { get, post, del } from '@/lib/api'
import type { TestCase, EvalRun, EvalResult, EvalMetrics, CreateTestCasePayload, CreateEvalRunPayload } from './evals.types'
import type { Page } from '@/types/common.types'

export const evalApi = {
  listTestCases: (page = 1, pageSize = 20) =>
    get<Page<TestCase>>(`/evals/test-cases?page=${page}&page_size=${pageSize}`),
  createTestCase: (payload: CreateTestCasePayload) => post<TestCase>('/evals/test-cases', payload),
  deleteTestCase: (id: string) => del(`/evals/test-cases/${id}`),

  listRuns: (agentId?: string, page = 1, pageSize = 20) => {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
    if (agentId) params.set('agent_id', agentId)
    return get<Page<EvalRun>>(`/evals/runs?${params}`)
  },
  createRun: (payload: CreateEvalRunPayload) => post<EvalRun>('/evals/runs', payload),
  getRun: (runId: string) => get<{ run: EvalRun; results: EvalResult[] }>(`/evals/runs/${runId}`),
  executeRun: (runId: string, turns: Array<{ userInput: string; agentResponse: string; context?: string }>) =>
    post<EvalRun>(`/evals/runs/${runId}/execute`, { turns }),
  queueRun: (runId: string) => post<{ runId: string; status: string }>(`/evals/runs/${runId}/queue`),

  scoreTurn: (turn: { userInput: string; agentResponse: string; context?: string; expected?: Record<string, unknown> }) =>
    post<{ scores: Record<string, { score: number; rationale: string }> }>('/evals/turns/score', turn),

  getMetrics: () => get<EvalMetrics>('/evals/metrics'),
}
