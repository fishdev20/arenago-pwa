"use client";

import { useQuery } from "@tanstack/react-query";
import { getActiveSports } from "@/lib/api/sports";
import { queryKeys } from "@/lib/query/query-keys";

export function useSports() {
  return useQuery({
    queryKey: queryKeys.sports,
    queryFn: getActiveSports,
    staleTime: 1000 * 60 * 10,
  });
}
