import { instrumentsService } from "@/services/instrumentsService";
import { useQuery } from "@tanstack/react-query";

export function useInstruments() {
  return useQuery({
    queryKey: ["instruments"],
    queryFn: instrumentsService.getInstruments,
  });
}
