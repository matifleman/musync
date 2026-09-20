import { postsService } from "@/services/postsService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { POST_DETAIL_QUERY_KEY } from "./usePost";

export function useUpdatePostCaption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, caption }: { postId: number; caption: string }) =>
      postsService.updatePostCaption(postId, caption),
    onSuccess: (updated) => {
      // Write the server's copy straight into the detail entry so the screen
      // shows the new caption in the same frame the modal closes; the refetch
      // below then reconciles the lists. Safe because resolvePostImageUrls is
      // idempotent.
      queryClient.setQueryData(POST_DETAIL_QUERY_KEY(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
