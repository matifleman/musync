import { bandsService } from "@/services/bandsService";
import { FollowedBandResult } from "@/types/Band.type";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 20;

export function useUserFollowedBands(userId: number | undefined) {
  return useInfiniteQuery<FollowedBandResult[]>({
    queryKey: ["bands", "user", userId, "followed"],
    queryFn: ({ pageParam }) => bandsService.getFollowedBands(userId!, pageParam as number, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined),
    enabled: userId !== undefined,
  });
}
