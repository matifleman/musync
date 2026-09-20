import { postsService } from "@/services/postsService";
import { useQuery } from "@tanstack/react-query";

// Prefix shared with the delete mutation, which patches every author's list
// without needing to know which ids are cached.
export const AUTHOR_POSTS_QUERY_PREFIX = ["posts", "author"] as const;

export function useUserPosts(userId: number | undefined) {
  return useQuery({
    queryKey: [...AUTHOR_POSTS_QUERY_PREFIX, userId],
    queryFn: () => postsService.getPostsByAuthor(userId!),
    enabled: userId !== undefined,
  });
}
