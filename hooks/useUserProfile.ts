import { User } from "@/types/User.type";
import { apiFetch } from "@/utilities/api";
import { resolveUserProfilePictureUrl } from "@/utilities/resolverServerImageUrls";
import { useQuery } from "@tanstack/react-query";

async function fetchUserProfile(userId: string): Promise<User> {
  const response = await apiFetch(`${process.env.EXPO_PUBLIC_API_URL}/users/${userId}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data: User = await response.json();
  return resolveUserProfilePictureUrl(data);
}

export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["users", userId],
    queryFn: () => fetchUserProfile(userId!),
    enabled: !!userId,
  });
}
