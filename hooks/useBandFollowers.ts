import { bandsService } from "@/services/bandsService";
import { UserSearchResult } from "@/types/User.type";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 20;

export function useBandFollowers(bandId: number | undefined) {
  return useInfiniteQuery<UserSearchResult[]>({
    queryKey: ["bands", bandId, "followers"],
    queryFn: ({ pageParam }) => bandsService.getBandFollowers(bandId!, pageParam as number, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined),
    enabled: bandId !== undefined,
  });
}
