import { Post } from "@/types/Post.type";
import { apiFetch } from "@/utilities/api";
import { resolveServerImageUrls } from "@/utilities/resolverServerImageUrls";
import { useQuery } from "@tanstack/react-query";

async function fetchUserPosts(userId: number): Promise<Post[]> {
  const response = await apiFetch(`${process.env.EXPO_PUBLIC_API_URL}/posts/author/${userId}`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data: Post[] = await response.json();
  return resolveServerImageUrls(data);
}

export function useUserPosts(userId: number | undefined) {
  return useQuery({
    queryKey: ["posts", "author", userId],
    queryFn: () => fetchUserPosts(userId!),
    enabled: userId !== undefined,
  });
}
