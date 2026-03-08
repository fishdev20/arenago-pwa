import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

type RequestBody = {
  sportTypes?: string[];
};

type Row = {
  osm_type: string;
  osm_id: number;
  name: string;
  latitude: number;
  longitude: number;
  sports: string[] | null;
};

let pool: Pool | null = null;

function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL });
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

export async function POST(request: NextRequest) {
  const body = (await request.json()) as RequestBody;
  const sportTypes = (body.sportTypes ?? []).map((s) => normalizeSport(s)).filter(Boolean);
  const db = getPool();

  if (!db) {
    return NextResponse.json({ markers: [], error: "Missing DATABASE_URL" }, { status: 200 });
  }

  try {
    const result = await db.query<Row>(
      `
        select osm_type, osm_id, name, latitude, longitude, sports
        from public.osm_sport_centers
        order by updated_at desc
        limit 5000
      `
    );

    const markers = result.rows
      .filter((row) => matchesSports(sportTypes, (row.sports ?? []).map(normalizeSport)))
      .map((row) => ({
        id: `${row.osm_type}-${row.osm_id}`,
        name: row.name,
        lat: row.latitude,
        lon: row.longitude,
      }));

    return NextResponse.json({ markers });
  } catch {
    return NextResponse.json({ markers: [] }, { status: 200 });
  }
}
