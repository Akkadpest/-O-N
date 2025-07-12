import { QueryClient } from '@tanstack/react-query'

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Unauthorized')
    }
    let errorText = 'An error occurred'
    try {
      const errorData = await res.json()
      errorText = errorData.message || errorText
    } catch {
      // If we can't parse JSON, use the default error
    }
    throw new Error(errorText)
  }
}

export async function apiRequest(
  method: string,
  endpoint: string,
  body?: any
): Promise<any> {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const res = await fetch(endpoint, options)
  await throwIfResNotOk(res)
  return res.json()
}

type UnauthorizedBehavior = "returnNull" | "throw"

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior
}) => (context: { queryKey: unknown[] }) => Promise<T | null> = <T>({
  on401,
}: {
  on401: UnauthorizedBehavior
}) => {
  return async ({ queryKey }: { queryKey: unknown[] }) => {
    try {
      const res = await fetch(queryKey[0] as string)
      await throwIfResNotOk(res)
      return (await res.json()) as T
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        if (on401 === "returnNull") return null
        throw error
      }
      throw error
    }
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      staleTime: 60 * 1000, // 1 minute
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message === 'Unauthorized') {
          return false
        }
        return failureCount < 3
      },
    },
  },
})