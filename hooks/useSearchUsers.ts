import { searchService } from "@/services/searchService";
import { UserSearchResult } from "@/types/User.type";
import { useQuery } from "@tanstack/react-query";

export function useSearchUsers(query: string) {
  return useQuery<UserSearchResult[]>({
    queryKey: ["users", "search", query],
    queryFn: () => searchService.searchUsers(query),
    enabled: query.trim().length > 0,
  });
}
