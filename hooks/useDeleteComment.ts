import { commentsService } from "@/services/commentsService";
import { Comment } from "@/types/Comment.type";
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";
import { COMMENTS_QUERY_KEY, patchPostCommentsCount } from "./useComments";
import { FEED_QUERY_KEY } from "./usePosts";
import { AUTHOR_POSTS_QUERY_PREFIX } from "./useUserPosts";

export function useDeleteComment(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => commentsService.deleteComment(commentId),
    onSuccess: (_result, commentId) => {
      // Splice it out so the row disappears immediately. No rollback needed: the
      // server already confirmed the delete.
      queryClient.setQueryData<InfiniteData<Comment[]>>(COMMENTS_QUERY_KEY(postId), (old) =>
        old ? { ...old, pages: old.pages.map((page) => page.filter((comment) => comment.id !== commentId)) } : old
      );

      patchPostCommentsCount(queryClient, postId, -1);

      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: AUTHOR_POSTS_QUERY_PREFIX });
    },
  });
}
