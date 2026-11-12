import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: false,
    },
  },
})

export const invalidateApiQueries = (resource) => queryClient.invalidateQueries({
  queryKey: resource ? ['api', resource] : ['api'],
})

export const clearApiQueries = () => queryClient.clear()
