import { NextRequest, NextResponse } from "next/server";

const LIPAS_BASE_URL = "https://api.lipas.fi";

type RawLipasFeature = {
  sportsSiteId?: number;
  name?: string;
  location?: {
    cityName?: string;
    coordinates?: unknown;
    lat?: number;
    lon?: number;
    latitude?: number;
    longitude?: number;
  };
  type?: { name?: string };
  properties?: {
    sportsSiteId?: number;
    name?: string;
    location?: {
      cityName?: string;
      coordinates?: unknown;
      lat?: number;
      lon?: number;
      latitude?: number;
      longitude?: number;
    };
    type?: { name?: string };
  };
  geometry?: {
    type?: string;
    coordinates?: unknown;
  };
};

type NormalizedCenter = {
  id: string;
  name: string;
  city: string;
  sport: string;
  lat: number;
  lon: number;
};

function isLonLat(lon: number, lat: number) {
  return Math.abs(lon) <= 180 && Math.abs(lat) <= 90;
}

function toLonLatPair(a: unknown, b: unknown) {
  if (typeof a !== "number" || typeof b !== "number") return null;
  if (isLonLat(a, b)) return { lon: a, lat: b };
  if (isLonLat(b, a)) return { lon: b, lat: a };
  return null;
}

function toLatLon(geometry?: RawLipasFeature["geometry"]) {
  if (!geometry?.coordinates) return null;
  const coords = geometry.coordinates as unknown;
  if (!Array.isArray(coords) || coords.length < 2) return null;
  return toLonLatPair(coords[0], coords[1]);
}

function getPointFromLocation(location?: RawLipasFeature["location"]) {
  if (!location) return null;
  const explicit = toLonLatPair(
    location.lon ?? location.longitude,
    location.lat ?? location.latitude
  );
  if (explicit) return explicit;

  const coords = location.coordinates;
  if (Array.isArray(coords) && coords.length >= 2) {
    return toLonLatPair(coords[0], coords[1]);
  }

  return null;
}

function normalizeFeature(feature: RawLipasFeature): NormalizedCenter | null {
  const location = feature.properties?.location ?? feature.location;
  const type = feature.properties?.type ?? feature.type;
  const name = (feature.properties?.name ?? feature.name)?.trim();
  const id = feature.properties?.sportsSiteId ?? feature.sportsSiteId;
  const latLon = toLatLon(feature.geometry) ?? getPointFromLocation(location);

  if (!latLon || !name) return null;

  return {
    id: String(id ?? name),
    name,
    city: location?.cityName ?? "Unknown",
    sport: type?.name ?? "Sports center",
    lat: latLon.lat,
    lon: latLon.lon,
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q") ?? "";
  const limitParam = searchParams.get("limit");
  const cityCode = searchParams.get("cityCode") ?? "091";
  const hasExplicitLimit =
    typeof limitParam === "string" && limitParam.trim().length > 0;
  const requestedLimit = hasExplicitLimit ? Number(limitParam) : undefined;
  const shouldFetchAll = !hasExplicitLimit || limitParam === "all";
  const pageSize = shouldFetchAll ? 100 : Math.min(100, Math.max(1, requestedLimit ?? 20));

  const buildUrl = (page: number) => {
    const upstreamUrl = new URL(`${LIPAS_BASE_URL}/v2/sports-sites`);
    upstreamUrl.searchParams.set("page", String(page));
    upstreamUrl.searchParams.set("page-size", String(pageSize));
    if (cityCode.trim()) {
      upstreamUrl.searchParams.set("city-codes", cityCode);
    }
    return upstreamUrl;
  };

  const parseItems = (raw: unknown) => {
    return Array.isArray(raw)
      ? (raw as RawLipasFeature[])
      : Array.isArray((raw as { items?: unknown[] })?.items)
        ? ((raw as { items: unknown[] }).items as RawLipasFeature[])
      : Array.isArray((raw as { features?: unknown[] })?.features)
        ? ((raw as { features: unknown[] }).features as RawLipasFeature[])
        : Array.isArray((raw as { sportsSites?: unknown[] })?.sportsSites)
          ? ((raw as { sportsSites: unknown[] }).sportsSites as RawLipasFeature[])
          : [];
  };

  const parseTotalPages = (raw: unknown) => {
    const total = (raw as { pagination?: { "total-pages"?: number } })?.pagination?.["total-pages"];
    return typeof total === "number" && total > 0 ? total : null;
  };

  try {
    const allItems: RawLipasFeature[] = [];
    let totalPages: number | null = null;

    for (let page = 1; page <= (totalPages ?? 1); page += 1) {
      const response = await fetch(buildUrl(page), {
        cache: "no-store",
        headers: { accept: "application/json" },
      });
      if (!response.ok) {
        return NextResponse.json(
          { centers: [], error: `LIPAS request failed (${response.status})` },
          { status: 200 }
        );
      }
      const raw = (await response.json()) as unknown;
      if (shouldFetchAll && totalPages === null) {
        totalPages = parseTotalPages(raw) ?? 1;
      }
      const pageItems = parseItems(raw);
      if (pageItems.length === 0) break;
      allItems.push(...pageItems);
      if (!shouldFetchAll || pageItems.length < pageSize) break;
    }

    const normalized = allItems
      .map((item) => normalizeFeature(item as RawLipasFeature))
      .filter((center): center is NormalizedCenter => Boolean(center));
    const centers = q.trim()
      ? normalized.filter((center) =>
          center.name.toLowerCase().includes(q.trim().toLowerCase())
        )
      : normalized;

    if (q.trim() && centers.length === 0) {
      return NextResponse.json({ centers: [] });
    }

    return NextResponse.json({
      centers,
    });
  } catch {
    return NextResponse.json(
      { centers: [], error: "LIPAS fetch failed" },
      { status: 200 }
    );
  }
}
