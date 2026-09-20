import { postsService } from "@/services/postsService";
import { Post } from "@/types/Post.type";
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { AUTHOR_POSTS_QUERY_PREFIX } from "./useUserPosts";
import { POST_DETAIL_QUERY_KEY } from "./usePost";
import { FEED_QUERY_KEY } from "./usePosts";

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: number) => postsService.deletePost(postId),
    onSuccess: (_result, postId) => {
      // The detail entry is gone for good. Drop it before anything can refetch
      // it into a 404 — this is also why the invalidations below are targeted
      // instead of a blanket ["posts"], which would match the detail key.
      queryClient.removeQueries({ queryKey: POST_DETAIL_QUERY_KEY(postId) });

      // Splice the post out so the row/tile disappears in the same frame. No
      // rollback needed: the server already confirmed the delete.
      queryClient.setQueryData<InfiniteData<Post[]>>(FEED_QUERY_KEY, (old) =>
        old ? { ...old, pages: old.pages.map((page) => page.filter((p) => p.id !== postId)) } : old
      );
      queryClient.setQueriesData<Post[]>({ queryKey: AUTHOR_POSTS_QUERY_PREFIX }, (old) =>
        old?.filter((p) => p.id !== postId)
      );

      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: AUTHOR_POSTS_QUERY_PREFIX });
    },
  });
}
