export const queryKeys = {
  authUser: ["auth-user"] as const,
  sports: ["sports"] as const,
  profile: (userId?: string) => ["profile", userId] as const,
  profileRole: (userId?: string) => ["profile-role", userId] as const,
  lipasCenters: (params?: { q?: string; limit?: number; cityCode?: string }) =>
    ["lipas-centers", params?.q ?? "", params?.limit ?? "all", params?.cityCode ?? "091"] as const,
  osmCenters: (params?: {
    sports?: string[];
    viewport?: { north: number; south: number; east: number; west: number } | null;
  }) =>
    [
      "osm-centers",
      (params?.sports ?? []).slice().sort().join(","),
      params?.viewport?.north ?? "",
      params?.viewport?.south ?? "",
      params?.viewport?.east ?? "",
      params?.viewport?.west ?? "",
    ] as const,
  osmMarkers: (sports?: string[]) => ["osm-markers", (sports ?? []).slice().sort().join(",")] as const,
  osmCenterDetail: (id?: string | null) => ["osm-center-detail", id ?? ""] as const,
};
