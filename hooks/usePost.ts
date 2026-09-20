import { postsService } from "@/services/postsService";
import { useQuery } from "@tanstack/react-query";

// Numeric id on purpose: ["posts","detail","7"] and ["posts","detail",7] are
// different cache entries, and the mutations remove/patch by number.
export const POST_DETAIL_QUERY_KEY = (postId: number) => ["posts", "detail", postId] as const;

export function usePost(postId: number | undefined, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: POST_DETAIL_QUERY_KEY(postId!),
    queryFn: () => postsService.getPost(postId!),
    enabled: postId !== undefined && !Number.isNaN(postId) && options?.enabled !== false,
  });
}
