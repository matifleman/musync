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

// Carries the status alongside the message so callers can tell a 404 (the post
// is gone) from a 403 (not your post) from a network failure.
export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
    this.name = 'ApiError'
  }
}

// The backend answers 400/403/404 with ProblemDetails, whose `title` is the
// exception message — surfacing it beats "Failed to delete post: 403".
export async function apiError(response: Response, fallback: string): Promise<ApiError> {
  const body = await response.json().catch(() => ({} as Record<string, unknown>))
  const message =
    typeof body.title === 'string' ? body.title :
    typeof body.message === 'string' ? body.message :
    `${fallback}: ${response.status}`
  return new ApiError(message, response.status)
}
