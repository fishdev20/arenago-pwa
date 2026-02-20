"use client";

import { useQuery } from "@tanstack/react-query";
import { getProfile, getProfileRole } from "@/lib/api/profile";
import { queryKeys } from "@/lib/query/query-keys";

export function useProfile(userId?: string) {
  return useQuery({
    queryKey: queryKeys.profile(userId),
    queryFn: () => {
      if (!userId) throw new Error("Missing user");
      return getProfile(userId);
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useProfileRole(userId?: string) {
  return useQuery({
    queryKey: queryKeys.profileRole(userId),
    queryFn: () => {
      if (!userId) throw new Error("Missing user");
      return getProfileRole(userId);
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5,
  });
}
