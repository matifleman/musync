import { genresService } from "@/services/genresService";
import { useQuery } from "@tanstack/react-query";

export function useGenres() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: genresService.getGenres,
  });
}
