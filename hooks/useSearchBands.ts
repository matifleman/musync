import { searchService } from "@/services/searchService";
import { BandSearchResult } from "@/types/Band.type";
import { useQuery } from "@tanstack/react-query";

export function useSearchBands(query: string) {
  return useQuery<BandSearchResult[]>({
    queryKey: ["bands", "search", query],
    queryFn: () => searchService.searchBands(query),
    enabled: query.trim().length > 0,
  });
}
