import { bandsService } from "@/services/bandsService";
import { useQuery } from "@tanstack/react-query";

export function useUserFollowedBandsCount(userId: number | undefined) {
  return useQuery({
    queryKey: ["bands", "user", userId, "followed-count"],
    queryFn: () => bandsService.getFollowedBandsCount(userId!),
    enabled: userId !== undefined,
  });
}
