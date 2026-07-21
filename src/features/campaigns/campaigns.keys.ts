export const campaignKeys = {
  all: ['campaigns'] as const,
  list: (status?: string) => [...campaignKeys.all, 'list', status ?? ''] as const,
  detail: (id: string) => [...campaignKeys.all, 'detail', id] as const,
  contacts: (id: string) => [...campaignKeys.all, id, 'contacts'] as const,
}
