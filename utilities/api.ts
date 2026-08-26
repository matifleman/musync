import { getAccessToken, refreshSession } from '@/auth/authStore'

export async function apiFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const makeFetch = (bearer: string | null) => {
    const headers = new Headers(init?.headers ?? ({} as HeadersInit))
    if (bearer) headers.set('Authorization', `Bearer ${bearer}`)
    return fetch(input, { ...init, headers })
  }

  const res = await makeFetch(getAccessToken())
  if (res.status !== 401) return res

  const refreshed = await refreshSession()
  if (!refreshed) return res

  return makeFetch(refreshed.accessToken)
}

export default apiFetch
