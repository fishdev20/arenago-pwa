"use client";

import { useQuery } from "@tanstack/react-query";
import { getOSMCenterDetail } from "@/lib/api/osm";
import { queryKeys } from "@/lib/query/query-keys";

export function useOSMCenterDetail(id: string | null, enabled = true) {
  return useQuery({
    queryKey: queryKeys.osmCenterDetail(id),
    queryFn: () => {
      if (!id) return Promise.resolve(null);
      return getOSMCenterDetail(id);
    },
    enabled: enabled && Boolean(id),
    staleTime: 1000 * 60,
  });
}
