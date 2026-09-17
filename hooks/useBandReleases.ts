import { releasesService } from "@/services/releasesService";
import { useQuery } from "@tanstack/react-query";

export function useBandReleases(bandId: string | undefined) {
  return useQuery({
    queryKey: ["bands", bandId, "releases"],
    queryFn: () => releasesService.getBandReleases(bandId!),
    enabled: !!bandId,
  });
}
