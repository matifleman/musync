import { searchService } from "@/services/searchService";
import { BandSearchResult } from "@/types/Band.type";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 20;

export function useSearchBands(query: string, instrumentId?: number, genreId?: number) {
  return useInfiniteQuery<BandSearchResult[]>({
    queryKey: ["bands", "search", query, instrumentId, genreId],
    queryFn: ({ pageParam }) =>
      searchService.searchBands(query, pageParam as number, PAGE_SIZE, instrumentId, genreId),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined),
    enabled: query.trim().length > 0,
  });
}
