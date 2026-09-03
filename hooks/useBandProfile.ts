import { bandsService } from "@/services/bandsService";
import { useQuery } from "@tanstack/react-query";

export function useBandProfile(bandId: string | undefined) {
  return useQuery({
    queryKey: ["bands", bandId],
    queryFn: () => bandsService.getBand(bandId!),
    enabled: !!bandId,
  });
}
