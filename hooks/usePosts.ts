import { Post } from "@/types/Post.type";
import { apiFetch } from "@/utilities/api";
import { resolveServerImageUrls } from "@/utilities/resolverServerImageUrls";
import { useQuery } from "@tanstack/react-query";

async function fetchPosts(): Promise<Post[]> {
  const response = await apiFetch(`${process.env.EXPO_PUBLIC_API_URL}/posts`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data: Post[] = await response.json();
  return resolveServerImageUrls(data);
}

export function usePosts() {
  return useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });
}
