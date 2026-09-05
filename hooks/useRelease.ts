import { releasesService } from "@/services/releasesService";
import { useQuery } from "@tanstack/react-query";

export function useRelease(releaseId: string | undefined) {
  return useQuery({
    queryKey: ["releases", releaseId],
    queryFn: () => releasesService.getRelease(releaseId!),
    enabled: !!releaseId,
  });
}
