import { InfiniteData, QueryClient } from '@tanstack/react-query'

// Drops one row from every page of a cached infinite list, leaving the page
// structure intact so the next page param still lines up. Used where acting on
// a row should make it leave the list - a followed suggestion - rather than just
// change how it looks.
export function removeFromInfiniteList<T extends { id: number }>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  id: number
): void {
  queryClient.setQueriesData<InfiniteData<T[]>>({ queryKey }, (old) =>
    old ? { ...old, pages: old.pages.map((page) => page.filter((row) => row.id !== id)) } : old
  )
}
