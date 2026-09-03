import { bandsService } from "@/services/bandsService";
import { useQuery } from "@tanstack/react-query";

export function useUserBands(userId: number | undefined) {
  return useQuery({
    queryKey: ["bands", "user", userId],
    queryFn: () => bandsService.getBandsByUser(userId!),
    enabled: userId !== undefined,
  });
}
