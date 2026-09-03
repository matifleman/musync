import { searchService } from "@/services/searchService";
import { UserSearchResult } from "@/types/User.type";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 20;

export function useSearchUsers(query: string) {
  return useInfiniteQuery<UserSearchResult[]>({
    queryKey: ["users", "search", query],
    queryFn: ({ pageParam }) => searchService.searchUsers(query, pageParam as number, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined),
    enabled: query.trim().length > 0,
  });
}
