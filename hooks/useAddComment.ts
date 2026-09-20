import { commentsService } from "@/services/commentsService";
import { Comment } from "@/types/Comment.type";
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { COMMENTS_QUERY_KEY, patchPostCommentsCount } from "./useComments";
import { FEED_QUERY_KEY } from "./usePosts";
import { AUTHOR_POSTS_QUERY_PREFIX } from "./useUserPosts";

export function useAddComment(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => commentsService.addComment(postId, text),
    onSuccess: (created) => {
      // Pages are newest-first, so a new comment always belongs at the head of
      // page 1 - prepending it shows it in the same frame instead of waiting for
      // a refetch to reorder the list under an open modal.
      queryClient.setQueryData<InfiniteData<Comment[]>>(COMMENTS_QUERY_KEY(postId), (old) =>
        old
          ? { ...old, pages: [[created, ...(old.pages[0] ?? [])], ...old.pages.slice(1)] }
          : { pages: [[created]], pageParams: [1] }
      );

      patchPostCommentsCount(queryClient, postId, 1);

      // Reconcile in the background, same as useDeletePost.
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: AUTHOR_POSTS_QUERY_PREFIX });
    },
  });
}
