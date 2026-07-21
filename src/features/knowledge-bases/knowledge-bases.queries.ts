import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { knowledgeBaseApi } from './knowledge-bases.api'
import { knowledgeBaseKeys } from './knowledge-bases.keys'

export * from './knowledge-bases.types'
export { knowledgeBaseKeys } from './knowledge-bases.keys'
export { knowledgeBaseApi } from './knowledge-bases.api'

const invalidateKB = () => queryClient.invalidateQueries({ queryKey: knowledgeBaseKeys.all })

export function useKnowledgeBases() {
  return useQuery({
    queryKey: knowledgeBaseKeys.list(),
    queryFn: knowledgeBaseApi.list,
  })
}

export function useKnowledgeBase(id: string) {
  return useQuery({
    queryKey: knowledgeBaseKeys.detail(id),
    queryFn: () => knowledgeBaseApi.get(id),
    enabled: !!id,
  })
}

export function useCreateKnowledgeBase() {
  return useMutation({
    mutationFn: knowledgeBaseApi.create,
    onSuccess: invalidateKB,
  })
}

export function useUpdateKnowledgeBase() {
  return useMutation({
    mutationFn: knowledgeBaseApi.update,
    onSuccess: invalidateKB,
  })
}

export function useDeleteKnowledgeBase() {
  return useMutation({
    mutationFn: knowledgeBaseApi.remove,
    onSuccess: invalidateKB,
  })
}

export function useLinkAgent() {
  return useMutation({
    mutationFn: ({ kbId, agentId }: { kbId: string; agentId: string }) =>
      knowledgeBaseApi.linkAgent(kbId, agentId),
    onSuccess: invalidateKB,
  })
}

export function useReindexKB() {
  return useMutation({
    mutationFn: (kbId: string) => knowledgeBaseApi.reindex(kbId),
  })
}

export function useKBDocuments(kbId: string) {
  return useQuery({
    queryKey: knowledgeBaseKeys.documents(kbId),
    queryFn: () => knowledgeBaseApi.listDocuments(kbId),
    enabled: !!kbId,
  })
}

export function useUploadDocument() {
  return useMutation({
    mutationFn: ({ kbId, file }: { kbId: string; file: File }) =>
      knowledgeBaseApi.uploadDocument(kbId, file),
    onSuccess: (_, { kbId }) => {
      queryClient.invalidateQueries({ queryKey: knowledgeBaseKeys.documents(kbId) })
    },
  })
}

export function useDeleteDocument() {
  return useMutation({
    mutationFn: (docId: string) => knowledgeBaseApi.deleteDocument(docId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: knowledgeBaseKeys.all }),
  })
}

export function useDocumentVersions(docId: string) {
  return useQuery({
    queryKey: knowledgeBaseKeys.documentVersions(docId),
    queryFn: () => knowledgeBaseApi.getDocumentVersions(docId),
    enabled: !!docId,
  })
}

export function useRollbackDocument() {
  return useMutation({
    mutationFn: ({ docId, targetVersion }: { docId: string; targetVersion: number }) =>
      knowledgeBaseApi.rollbackDocument(docId, targetVersion),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: knowledgeBaseKeys.all }),
  })
}

export function useKBSources(kbId: string) {
  return useQuery({
    queryKey: knowledgeBaseKeys.sources(kbId),
    queryFn: () => knowledgeBaseApi.listSources(kbId),
    enabled: !!kbId,
  })
}

export function useAddSource() {
  return useMutation({
    mutationFn: ({ kbId, sourceUrl }: { kbId: string; sourceUrl: string }) =>
      knowledgeBaseApi.addSource(kbId, sourceUrl),
    onSuccess: (_, { kbId }) => {
      queryClient.invalidateQueries({ queryKey: knowledgeBaseKeys.sources(kbId) })
    },
  })
}

export function useRemoveSource() {
  return useMutation({
    mutationFn: (sourceId: string) => knowledgeBaseApi.removeSource(sourceId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: knowledgeBaseKeys.all }),
  })
}
