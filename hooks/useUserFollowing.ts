import { usersService } from "@/services/usersService";
import { UserSearchResult } from "@/types/User.type";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 20;

export function useUserFollowing(userId: number | undefined) {
  return useInfiniteQuery<UserSearchResult[]>({
    queryKey: ["users", "following", userId],
    queryFn: ({ pageParam }) => usersService.getFollowing(userId!, pageParam as number, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined),
    enabled: userId !== undefined,
  });
}
