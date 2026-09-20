import { postsService } from "@/services/postsService";
import { Post } from "@/types/Post.type";
import { tapFeedback } from "@/utilities/haptics";
import { QueryKeys, cancelQueries, restoreQueries, snapshotQueries } from "@/utilities/queryCacheSnapshot";
import { InfiniteData, QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { POST_DETAIL_QUERY_KEY } from "./usePost";
import { FEED_QUERY_KEY } from "./usePosts";
import { AUTHOR_POSTS_QUERY_PREFIX } from "./useUserPosts";

// Every cache that holds a Post, and therefore a `liked` flag, for this post.
const likeCacheKeys = (postId: number): QueryKeys => [
  FEED_QUERY_KEY,
  POST_DETAIL_QUERY_KEY(postId),
  AUTHOR_POSTS_QUERY_PREFIX,
];

// Same three caches as patchPostCommentsCount, same traversal. PostDTO carries
// no like count, so `liked` is the only field that moves.
export function patchPostLiked(queryClient: QueryClient, postId: number, liked: boolean) {
  const shift = (post: Post) => (post.id === postId ? { ...post, liked } : post);

  queryClient.setQueryData<InfiniteData<Post[]>>(FEED_QUERY_KEY, (old) =>
    old ? { ...old, pages: old.pages.map((page) => page.map(shift)) } : old
  );
  queryClient.setQueryData<Post>(POST_DETAIL_QUERY_KEY(postId), (old) => (old ? shift(old) : old));
  queryClient.setQueriesData<Post[]>({ queryKey: AUTHOR_POSTS_QUERY_PREFIX }, (old) => old?.map(shift));
}

export function useToggleLike(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    // Mutations sharing a scope id run one after another, so a spammed heart
    // can't land its like and unlike out of order. This is what replaces the
    // isToggling ref PostFooter used to carry.
    scope: { id: `post-like-${postId}` },
    mutationFn: (nextLiked: boolean) =>
      nextLiked ? postsService.likePost(postId) : postsService.unlikePost(postId),
    onMutate: async (nextLiked) => {
      const keys = likeCacheKeys(postId);
      await cancelQueries(queryClient, keys);
      const snapshot = snapshotQueries(queryClient, keys);

      patchPostLiked(queryClient, postId, nextLiked);
      // On tap, not on response: an optimistic toggle's whole point is that the
      // tap is the moment of feedback.
      tapFeedback();

      return { snapshot };
    },
    onError: (_error, _nextLiked, context) => {
      if (context) restoreQueries(queryClient, context.snapshot);
      Toast.show({ type: 'error', text1: 'Could not update the like' });
    },
    // Reconcile in the background once the dust settles, same as useDeletePost.
    // Targeted rather than a blanket ["posts"], which would also match unrelated
    // post queries.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: POST_DETAIL_QUERY_KEY(postId) });
      queryClient.invalidateQueries({ queryKey: AUTHOR_POSTS_QUERY_PREFIX });
    },
  });
}
