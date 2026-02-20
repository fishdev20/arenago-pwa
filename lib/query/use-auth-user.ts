"use client";

import { useQuery } from "@tanstack/react-query";
import { getAuthUser } from "@/lib/api/auth";
import { queryKeys } from "@/lib/query/query-keys";

export function useAuthUser() {
  return useQuery({
    queryKey: queryKeys.authUser,
    queryFn: getAuthUser,
    staleTime: 1000 * 60 * 5,
  });
}
