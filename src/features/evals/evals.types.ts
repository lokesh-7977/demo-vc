export type TestCase = {
  id: string
  name: string
  scenario: Record<string, unknown>
  expected?: Record<string, unknown> | null
  createdAt: string
}

export type EvalRun = {
  id: string
  agentId: string
  testCaseId?: string | null
  callId?: string | null
  trigger: string
  status: string
  judgeModel?: string | null
  config?: Record<string, unknown> | null
  summary?: string | null
  report?: Record<string, unknown> | null
  startedAt?: string | null
  finishedAt?: string | null
}

export type EvalResult = {
  id: string
  metric: string
  score?: number | null
  passed?: boolean | null
  details?: Record<string, unknown> | null
}

export type EvalMetrics = {
  all: string[]
  judge: string[]
  deterministic: string[]
}

export type CreateTestCasePayload = {
  name: string
  scenario: Record<string, unknown>
  expected?: Record<string, unknown>
}

export type CreateEvalRunPayload = {
  agentId: string
  testCaseId?: string
  callId?: string
  flowId?: string
  judgeModel?: string
  metrics?: string[]
}
