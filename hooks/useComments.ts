import { commentsService } from "@/services/commentsService";
import { Comment } from "@/types/Comment.type";
import { Post } from "@/types/Post.type";
import { InfiniteData, QueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { POST_DETAIL_QUERY_KEY } from "./usePost";
import { FEED_QUERY_KEY } from "./usePosts";
import { AUTHOR_POSTS_QUERY_PREFIX } from "./useUserPosts";

const PAGE_SIZE = 20;

// Numeric id for the same reason as POST_DETAIL_QUERY_KEY: ["posts","comments","7"]
// and ["posts","comments",7] are different cache entries, and the mutations patch
// by number.
export const COMMENTS_QUERY_KEY = (postId: number) => ["posts", "comments", postId] as const;

export function useComments(postId: number | undefined) {
  return useInfiniteQuery<Comment[]>({
    queryKey: COMMENTS_QUERY_KEY(postId!),
    queryFn: ({ pageParam }) => commentsService.getComments(postId!, pageParam as number, PAGE_SIZE),
    initialPageParam: 1,
    // Newest-first pages, so "next page" walks backwards into older comments.
    getNextPageParam: (lastPage, allPages) => (lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined),
    enabled: postId !== undefined,
  });
}

// Shared by useAddComment/useDeleteComment: a post's comment count is cached in
// three places (the feed, the detail entry, and each author's grid), and all of
// them have to move together or the footer count contradicts the open modal.
export function patchPostCommentsCount(queryClient: QueryClient, postId: number, delta: number) {
  const shift = (post: Post) =>
    post.id === postId ? { ...post, commentsCount: Math.max(0, post.commentsCount + delta) } : post;

  queryClient.setQueryData<InfiniteData<Post[]>>(FEED_QUERY_KEY, (old) =>
    old ? { ...old, pages: old.pages.map((page) => page.map(shift)) } : old
  );
  queryClient.setQueryData<Post>(POST_DETAIL_QUERY_KEY(postId), (old) => (old ? shift(old) : old));
  queryClient.setQueriesData<Post[]>({ queryKey: AUTHOR_POSTS_QUERY_PREFIX }, (old) => old?.map(shift));
}
