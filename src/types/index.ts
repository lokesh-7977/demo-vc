/* ── Domain types (single source of truth) ─────────────────────── */

export type Role = 'admin' | 'sales_rep'

export type Permission =
  | 'view_dashboard'
  | 'view_leads'
  | 'view_calls'
  | 'manage_agents'
  | 'manage_numbers'
  | 'view_analytics'
  | 'manage_team'
  | 'manage_settings'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  permissions: Permission[]
}

export type LeadStatus =
  | 'New'
  | 'Attempted'
  | 'Answered'
  | 'Interested'
  | 'Converted'
  | 'Rejected'
  | 'DNC'

export interface Note {
  by: string
  at: string
  text: string
}

export interface Lead {
  id: string
  name: string
  phone: string
  source: string
  status: LeadStatus
  assignedTo: string
  lastCallId: string | null
  nextFollowUp: string | null
  notes: Note[]
  tags: string[]
}

export type CallOutcome = 'Answered' | 'Rejected' | 'No Answer' | 'Voicemail'

export interface TurnLatency {
  stt: number
  llm: number
  tts: number
}

export interface Turn {
  speaker: string
  text: string
  latencyMs?: TurnLatency | null
}

export interface CallCost {
  stt: number
  llm: number
  tts: number
  telephony: number
  total: number
}

export interface Call {
  id: string
  leadId: string
  agentId: string
  repId: string
  direction: 'inbound' | 'outbound'
  outcome: CallOutcome
  date: string
  durationSec: number
  cost: CallCost
  sentiment: 'positive' | 'neutral' | 'negative' | null
  summary: string
  transcript: Turn[]
}

export interface FlowNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: { kind: string; label: string; config: Record<string, unknown> }
}

export interface FlowEdge {
  id: string
  source: string
  target: string
  label?: string
}

export interface AgentFlow {
  id: string
  name: string
  status: 'Draft' | 'Published'
  lastEdited: string
  versions: { v: string; at: string; by: string }[]
  nodes: FlowNode[]
  edges: FlowEdge[]
}

export interface Template {
  id: string
  name: string
  description: string
  nodes: FlowNode[]
  edges: FlowEdge[]
}

export interface PhoneNumber {
  id: string
  number: string
  label: string
  health: 'Good' | 'At Risk' | 'Flagged'
  provider: string
  callsToday: number
}

export interface Persona {
  id: string
  name: string
  transcript: { speaker: string; text: string }[]
}

export interface KnowledgeBase {
  id: string
  name: string
  docs: number
  updated: string
}

export interface AppNotification {
  id: string
  text: string
  at: string
  unread: boolean
}

export interface Org {
  id: string
  name: string
  creditBalance: number
}

export interface Providers {
  stt: string[]
  llm: string[]
  tts: string[]
}

export interface ImportRow {
  name: string
  phone: string
  source: string
}
