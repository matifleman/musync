// A deep link can arrive while nobody is signed in, in which case the router
// bounces to sign-in and the intended destination would otherwise be lost. It
// lives outside React - like the access token in authStore - so a <Redirect>
// can record it during render without triggering a state update.
let pendingPath: string | null = null

export function setPendingLink(path: string): void {
  pendingPath = path
}

// Reads and clears in one go, so a replay can never fire twice.
export function consumePendingLink(): string | null {
  const path = pendingPath
  pendingPath = null
  return path
}
