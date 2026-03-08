"use client";

import { useQuery } from "@tanstack/react-query";
import { getOSMMarkers } from "@/lib/api/osm";
import { queryKeys } from "@/lib/query/query-keys";

export function useOSMMarkers(sportTypes: string[], enabled = true) {
  return useQuery({
    queryKey: queryKeys.osmMarkers(sportTypes),
    queryFn: () => getOSMMarkers(sportTypes),
    enabled,
    staleTime: 1000 * 60,
    placeholderData: (previousData) => previousData,
  });
}
