import { QueryCache, QueryClient } from "@tanstack/react-query";

import { handleError } from "@/components/ui/toast";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 2,
    },
    mutations: {
      retry: 0,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.silentError) return;
      handleError(error);
    },
  }),
});
