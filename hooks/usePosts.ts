import { postsService } from "@/services/postsService";
import { Post } from "@/types/Post.type";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 20;

export const FEED_QUERY_KEY = ["posts", "feed"] as const;

export function usePosts() {
  return useInfiniteQuery<Post[]>({
    queryKey: FEED_QUERY_KEY,
    queryFn: ({ pageParam }) => postsService.getFeed(pageParam as number, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined),
  });
}
