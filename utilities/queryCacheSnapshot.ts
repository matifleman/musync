import { QueryClient } from '@tanstack/react-query'

// An optimistic mutation has to be able to put every cache it touched back
// exactly as it found it. getQueriesData matches a key prefix as well as an
// exact key, so one pair of helpers covers bare objects, bare arrays and
// InfiniteData alike without knowing anything about the cached shapes.
export type CacheSnapshot = [readonly unknown[], unknown][]

export function snapshotQueries(queryClient: QueryClient, keys: readonly unknown[][]): CacheSnapshot {
  return keys.flatMap((queryKey) => queryClient.getQueriesData({ queryKey }))
}

export function restoreQueries(queryClient: QueryClient, snapshot: CacheSnapshot): void {
  for (const [queryKey, data] of snapshot) {
    queryClient.setQueryData(queryKey, data)
  }
}

// Cancelling first matters: several of these lists refetch on focus, and an
// in-flight refetch that lands after the optimistic write would overwrite it
// with pre-mutation data that no rollback would then be able to correct.
export function cancelQueries(queryClient: QueryClient, keys: readonly unknown[][]): Promise<void[]> {
  return Promise.all(keys.map((queryKey) => queryClient.cancelQueries({ queryKey })))
}
