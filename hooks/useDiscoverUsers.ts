import { discoverService } from "@/services/discoverService";
import { UserSearchResult } from "@/types/User.type";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 20;

// Exported so the follow hook can remove a person from here the moment they're
// followed, and so a change to your own genres/instruments can refresh it.
export const DISCOVER_USERS_QUERY_KEY = ["users", "discover"] as const;

export function useDiscoverUsers() {
  return useInfiniteQuery<UserSearchResult[]>({
    queryKey: DISCOVER_USERS_QUERY_KEY,
    queryFn: ({ pageParam }) => discoverService.getSuggestedUsers(pageParam as number, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined),
  });
}
