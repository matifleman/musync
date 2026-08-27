import { postsService } from "@/services/postsService";
import { useQuery } from "@tanstack/react-query";

export function useUserPosts(userId: number | undefined) {
  return useQuery({
    queryKey: ["posts", "author", userId],
    queryFn: () => postsService.getPostsByAuthor(userId!),
    enabled: userId !== undefined,
  });
}
