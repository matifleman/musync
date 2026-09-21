import { discoverService } from "@/services/discoverService";
import { BandSearchResult } from "@/types/Band.type";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 20;

// Band ids are numeric, so this can never collide with the ["bands", String(bandId)]
// detail key that the band follow hook also writes to.
export const DISCOVER_BANDS_QUERY_KEY = ["bands", "discover"] as const;

export function useDiscoverBands() {
  return useInfiniteQuery<BandSearchResult[]>({
    queryKey: DISCOVER_BANDS_QUERY_KEY,
    queryFn: ({ pageParam }) => discoverService.getSuggestedBands(pageParam as number, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined),
  });
}
