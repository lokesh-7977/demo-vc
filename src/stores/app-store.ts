import { create } from 'zustand'
import seed from '@/data/data.json'
import type {
  AgentFlow,
  AppNotification,
  Call,
  ImportRow,
  KnowledgeBase,
  Lead,
  Org,
  Permission,
  Persona,
  PhoneNumber,
  Providers,
  Role,
  Template,
  User,
} from '@/types'

const REP_PERMISSIONS: Permission[] = ['view_dashboard', 'view_leads', 'view_calls']
const ADMIN_PERMISSIONS: Permission[] = [
  ...REP_PERMISSIONS,
  'manage_agents',
  'manage_numbers',
  'view_analytics',
  'manage_team',
  'manage_settings',
]

interface AppState {
  org: Org
  users: User[]
  leads: Lead[]
  calls: Call[]
  agents: AgentFlow[]
  templates: Template[]
  numbers: PhoneNumber[]
  knowledgeBases: KnowledgeBase[]
  importBatchPreview: ImportRow[]
  personas: Persona[]
  notifications: AppNotification[]
  providers: Providers

  session: User | null
  exotelConnected: boolean

  login: (userId: string) => void
  logout: () => void
  updateLead: (id: string, patch: Partial<Lead>) => void
  addNote: (leadId: string, text: string) => void
  bulkUpdateLeads: (ids: string[], patch: Partial<Lead>) => void
  importLeads: () => { uploaded: number; duplicates: number; added: number }
  saveAgent: (agent: AgentFlow) => void
  addAgent: (agent: AgentFlow) => void
  setUserPermissions: (userId: string, perms: Permission[]) => void
  inviteUser: (name: string, email: string, role: Role) => void
  setExotelConnected: (v: boolean) => void
}

export const useApp = create<AppState>((set, get) => ({
  org: seed.org,
  users: seed.users as User[],
  leads: seed.leads as Lead[],
  calls: seed.calls as Call[],
  agents: seed.agents as AgentFlow[],
  templates: seed.templates as Template[],
  numbers: seed.numbers as PhoneNumber[],
  knowledgeBases: seed.knowledgeBases,
  importBatchPreview: seed.importBatchPreview,
  personas: seed.personas as Persona[],
  notifications: seed.notifications,
  providers: seed.providers,

  session: null,
  exotelConnected: false,

  login: (userId) =>
    set((s) => ({ session: s.users.find((u) => u.id === userId) ?? null })),
  logout: () => set({ session: null }),

  updateLead: (id, patch) =>
    set((s) => ({
      leads: s.leads.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    })),

  addNote: (leadId, text) =>
    set((s) => ({
      leads: s.leads.map((l) =>
        l.id === leadId
          ? {
              ...l,
              notes: [
                ...l.notes,
                { by: s.session?.id ?? 'u1', at: new Date().toISOString(), text },
              ],
            }
          : l,
      ),
    })),

  bulkUpdateLeads: (ids, patch) =>
    set((s) => ({
      leads: s.leads.map((l) => (ids.includes(l.id) ? { ...l, ...patch } : l)),
    })),

  importLeads: () => {
    const { importBatchPreview, leads } = get()
    const existing = new Set(leads.map((l) => l.phone))
    const fresh = importBatchPreview.filter((r) => !existing.has(r.phone))
    const added: Lead[] = fresh.map((r, i) => ({
      id: `imp_${Date.now()}_${i}`,
      name: r.name,
      phone: r.phone,
      source: r.source,
      status: 'New',
      assignedTo: '',
      lastCallId: null,
      nextFollowUp: null,
      notes: [],
      tags: ['imported'],
    }))
    set((s) => ({ leads: [...s.leads, ...added] }))
    return {
      uploaded: importBatchPreview.length,
      duplicates: importBatchPreview.length - added.length,
      added: added.length,
    }
  },

  saveAgent: (agent) =>
    set((s) => ({
      agents: s.agents.map((a) => (a.id === agent.id ? agent : a)),
    })),

  addAgent: (agent) => set((s) => ({ agents: [...s.agents, agent] })),

  setUserPermissions: (userId, perms) =>
    set((s) => ({
      users: s.users.map((u) =>
        u.id === userId ? { ...u, permissions: perms } : u,
      ),
      session:
        s.session?.id === userId
          ? { ...s.session, permissions: perms }
          : s.session,
    })),

  inviteUser: (name, email, role) =>
    set((s) => ({
      users: [
        ...s.users,
        {
          id: `u_${Date.now()}`,
          name,
          email,
          role,
          permissions: role === 'admin' ? ADMIN_PERMISSIONS : REP_PERMISSIONS,
        },
      ],
    })),

  setExotelConnected: (v) => set({ exotelConnected: v }),
}))
