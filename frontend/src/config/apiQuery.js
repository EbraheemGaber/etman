import { axiosi } from './axios'
import { queryClient } from './queryClient'

const getResource = (url) => {
  const path = url.split('?')[0].replace(/^\/+/, '')
  return path.split('/')[0] || 'root'
}

const fetchCachedResponse = (url) => {
  const requestUrl = axiosi.getUri({ url })
  const resource = getResource(url)

  return queryClient.fetchQuery({
    queryKey: ['api', resource, requestUrl],
    queryFn: async () => {
      const response = await axiosi.get(url)
      const totalResults = typeof response.headers?.get === 'function'
        ? (response.headers.get('X-Total-Count') || response.headers.get('x-total-count'))
        : (response.headers?.['x-total-count'] || response.headers?.['X-Total-Count'])

      return {
        data: response.data,
        totalResults,
      }
    },
  })
}

export const fetchCachedGet = async (url) => {
  const response = await fetchCachedResponse(url)
  return response.data
}

export const fetchCachedGetResponse = fetchCachedResponse
