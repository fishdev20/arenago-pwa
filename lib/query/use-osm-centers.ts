"use client";

import { useQuery } from "@tanstack/react-query";
import { getOSMSportsCenters, type OSMViewport } from "@/lib/api/osm";
import { queryKeys } from "@/lib/query/query-keys";

type Params = {
  sportTypes: string[];
  viewport: OSMViewport | null;
  enabled?: boolean;
};

export function useOSMCenters({ sportTypes, viewport, enabled = true }: Params) {
  return useQuery({
    queryKey: queryKeys.osmCenters({ sports: sportTypes, viewport }),
    queryFn: () => getOSMSportsCenters({ sportTypes, viewport }),
    enabled,
    staleTime: 1000 * 30,
    // Keep previous markers/list visible while the next viewport request is in flight.
    placeholderData: (previousData) => previousData,
  });
}
