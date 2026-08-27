import { usersService } from "@/services/usersService";
import { useQuery } from "@tanstack/react-query";

export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["users", userId],
    queryFn: () => usersService.getUser(userId!),
    enabled: !!userId,
  });
}
