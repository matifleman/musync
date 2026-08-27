import { postsService } from "@/services/postsService";
import { useQuery } from "@tanstack/react-query";

export function usePosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: postsService.getPosts,
  });
}
