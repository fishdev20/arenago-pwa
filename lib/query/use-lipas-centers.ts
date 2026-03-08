"use client";

import { useQuery } from "@tanstack/react-query";
import { getLipasCenters } from "@/lib/api/lipas";
import { queryKeys } from "@/lib/query/query-keys";

type Params = {
  q?: string;
  limit?: number;
  cityCode?: string;
  enabled?: boolean;
};

export function useLipasCenters(params: Params = {}) {
  const { q = "", limit, cityCode = "091", enabled = true } = params;

  return useQuery({
    queryKey: queryKeys.lipasCenters({ q, limit, cityCode }),
    queryFn: () => getLipasCenters({ q, limit, cityCode }),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
}
