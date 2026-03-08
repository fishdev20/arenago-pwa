export type LipasCenter = {
  id: string;
  name: string;
  city: string;
  sport: string;
  lat: number;
  lon: number;
};

type GetLipasCentersParams = {
  q?: string;
  limit?: number;
  cityCode?: string;
};

export async function getLipasCenters(params: GetLipasCentersParams = {}) {
  const url = new URL("/api/lipas/centers", window.location.origin);
  if (params.q) url.searchParams.set("q", params.q);
  if (params.limit) url.searchParams.set("limit", String(params.limit));
  if (params.cityCode) url.searchParams.set("cityCode", params.cityCode);

  const response = await fetch(url.toString(), { method: "GET" });
  if (!response.ok) {
    throw new Error(`Failed to fetch LIPAS centers (${response.status})`);
  }

  const data = (await response.json()) as { centers?: LipasCenter[] };
  return data.centers ?? [];
}
