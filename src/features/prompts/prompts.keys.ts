export const promptKeys = {
  all: ['prompts'] as const,
  list: () => [...promptKeys.all, 'list'] as const,
  detail: (id: string) => [...promptKeys.all, 'detail', id] as const,
  versions: (id: string) => [...promptKeys.all, id, 'versions'] as const,
}
