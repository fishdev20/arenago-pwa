import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

type SportsCenterRequest = {
  sportTypes?: string[];
  viewport?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
};

type SportsCenterItem = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  sports: string[];
  address: string;
};

type DbRow = {
  osm_type: string;
  osm_id: number;
  name: string;
  sports: string[] | null;
  address: string | null;
  latitude: number;
  longitude: number;
};

let pool: Pool | null = null;

function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

function normalizeSport(value: string) {
  return value.trim().toLowerCase().replace(/[-_]+/g, " ");
}

function matchesSports(requested: string[], candidate: string[]) {
  if (requested.length === 0) return true;
  const req = requested.map((v) => normalizeSport(v));
  return candidate.some((sport) => req.some((r) => sport.includes(r) || r.includes(sport)));
}

function fromDbRow(row: DbRow): SportsCenterItem {
  return {
    id: `${row.osm_type}-${row.osm_id}`,
    name: row.name,
    lat: row.latitude,
    lon: row.longitude,
    sports: (row.sports ?? []).map((s) => normalizeSport(s)),
    address: row.address ?? "Address unavailable",
  };
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as SportsCenterRequest;
  const viewport = body.viewport;
  const sportTypes = (body.sportTypes ?? []).map((s) => normalizeSport(s)).filter(Boolean);

  try {
    const db = getPool();
    if (!db) {
      return NextResponse.json(
        { places: [], error: "Missing DATABASE_URL for local Postgres" },
        { status: 200 }
      );
    }
    const result = viewport
      ? await db.query<DbRow>(
          `
            select osm_type, osm_id, name, sports, address, latitude, longitude
            from public.osm_sport_centers
            where latitude between $1 and $2
              and longitude between $3 and $4
            order by updated_at desc
            limit 5000
          `,
          [viewport.south, viewport.north, viewport.west, viewport.east]
        )
      : await db.query<DbRow>(
          `
            select osm_type, osm_id, name, sports, address, latitude, longitude
            from public.osm_sport_centers
            order by updated_at desc
            limit 5000
          `
        );

    const mapped = result.rows
      .map(fromDbRow)
      .filter((item) => matchesSports(sportTypes, item.sports));

    return NextResponse.json({ places: mapped });
  } catch {
    return NextResponse.json({ places: [] });
  }
}
