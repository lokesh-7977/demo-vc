export const knowledgeBaseKeys = {
  all: ['knowledge-bases'] as const,
  list: () => [...knowledgeBaseKeys.all, 'list'] as const,
  detail: (id: string) => [...knowledgeBaseKeys.all, 'detail', id] as const,
  documents: (kbId: string) => [...knowledgeBaseKeys.all, kbId, 'documents'] as const,
  documentVersions: (docId: string) => [...knowledgeBaseKeys.all, 'doc-versions', docId] as const,
  sources: (kbId: string) => [...knowledgeBaseKeys.all, kbId, 'sources'] as const,
}
