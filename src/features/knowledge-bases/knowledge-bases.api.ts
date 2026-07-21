import { get, post, put, del, postForm } from '@/lib/api'
import type {
  KnowledgeBase,
  CreateKnowledgeBasePayload,
  UpdateKnowledgeBasePayload,
  DocumentListItem,
  DocumentVersion,
  Source,
  PlaygroundResponse,
} from './knowledge-bases.types'

export const knowledgeBaseApi = {
  list: () => get<KnowledgeBase[]>('/knowledge-bases/'),
  get: (id: string) => get<KnowledgeBase>(`/knowledge-bases/${id}`),
  create: (payload: CreateKnowledgeBasePayload) => post<KnowledgeBase>('/knowledge-bases/', payload),
  update: ({ id, ...body }: UpdateKnowledgeBasePayload) => put<KnowledgeBase>(`/knowledge-bases/${id}`, body),
  remove: (id: string) => del(`/knowledge-bases/${id}`),

  linkAgent: (kbId: string, agentId: string) =>
    post<KnowledgeBase>(`/knowledge-bases/${kbId}/link-agent`, { agentId }),
  unlinkAgent: (kbId: string) => del(`/knowledge-bases/${kbId}/link-agent`),
  reindex: (kbId: string) => post<{ knowledgeBaseId: string; queuedDocuments: number }>(`/knowledge-bases/${kbId}/reindex`),
  playground: (kbId: string, question: string, limit?: number) =>
    post<PlaygroundResponse>(`/knowledge-bases/${kbId}/playground`, { question, limit }),

  listDocuments: (kbId: string, skip = 0, limit = 50) =>
    get<DocumentListItem[]>(`/documents/list?kb_id=${kbId}&skip=${skip}&limit=${limit}`),
  uploadDocument: (kbId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return postForm<{ documentId: string; status: string; filename: string }>(
      `/documents/upload?kb_id=${kbId}`,
      form,
    )
  },
  getDocumentStatus: (docId: string) => get<DocumentListItem>(`/documents/${docId}/status`),
  deleteDocument: (docId: string) => del(`/documents/${docId}`),
  getDocumentVersions: (docId: string) => get<DocumentVersion[]>(`/documents/${docId}/versions`),
  rollbackDocument: (docId: string, targetVersion: number) =>
    post<{ documentId: string; version: number }>(`/documents/${docId}/rollback`, { targetVersion }),
  archiveDocument: (docId: string) =>
    post<{ documentId: string; status: string }>(`/documents/${docId}/archive`),
  reindexDocument: (docId: string) =>
    post<{ documentId: string; status: string }>(`/documents/${docId}/reindex`),
  deleteEmbeddings: (docId: string) =>
    del<{ documentId: string; chunksDeleted: number }>(`/documents/${docId}/embeddings`),

  listSources: (kbId: string) => get<Source[]>(`/knowledge-bases/${kbId}/sources`),
  addSource: (kbId: string, sourceUrl: string) =>
    post<Source>(`/knowledge-bases/${kbId}/sources`, { sourceType: 'url', sourceUrl }),
  removeSource: (sourceId: string) => del(`/sources/${sourceId}`),
}
