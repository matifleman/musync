// The app's four shareable entities. Route params are entity-specific
// (`[userId]`, `[bandId]`, ...), never a bare `[id]`, so the builders and the
// parser are kept together to stop the two drifting apart.
const SCHEME = 'musync'

const ROUTE_BY_KIND: Record<string, string> = {
  user: '/user',
  band: '/band',
  release: '/release',
  post: '/post',
}

export const linkToUser = (id: number | string) => `${SCHEME}://user/${id}`
export const linkToBand = (id: number | string) => `${SCHEME}://band/${id}`
export const linkToRelease = (id: number | string) => `${SCHEME}://release/${id}`
export const linkToPost = (id: number | string) => `${SCHEME}://post/${id}`

// Split by hand rather than with Linking.parse: for a custom scheme, platforms
// disagree about whether the first segment is the host or part of the path, and
// `musync://<kind>/<id>` is always exactly two segments either way.
export function resolveDeepLinkPath(url: string): string | null {
  const withoutScheme = url.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
  const [kind, id] = withoutScheme.split('/').filter(Boolean)
  if (!kind || !id) return null

  const route = ROUTE_BY_KIND[kind.toLowerCase()]
  return route ? `${route}/${id}` : null
}
