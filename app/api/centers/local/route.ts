import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

type DbRow = {
  id: number;
  osm_type: string;
  osm_id: number;
  name: string;
  sports: string[] | null;
  opening_hours: string;
  website: string;
  payment: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  last_synced_at: string;
};

let pool: Pool | null = null;

function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export async function GET(request: NextRequest) {
  const db = getPool();
  if (!db) {
    return NextResponse.json(
      { rows: [], count: 0, error: "Missing DATABASE_URL" },
      { status: 200 }
    );
  }

  const params = request.nextUrl.searchParams;
  const sport = (params.get("sport") ?? "").trim().toLowerCase();
  const limitRaw = Number(params.get("limit") ?? "100");
  const offsetRaw = Number(params.get("offset") ?? "0");
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 1000) : 100;
  const offset = Number.isFinite(offsetRaw) ? Math.max(offsetRaw, 0) : 0;

  try {
    const baseSql = `
      from public.osm_sport_centers
      where ($1 = '' or exists (
        select 1
        from unnest(coalesce(sports, '{}')) as s
        where lower(s) like '%' || $1 || '%'
      ))
    `;

    const countResult = await db.query<{ count: string }>(
      `select count(*)::text as count ${baseSql}`,
      [sport]
    );
    const rowsResult = await db.query<DbRow>(
      `
        select
          id, osm_type, osm_id, name, sports, opening_hours, website, payment, phone, email,
          address, latitude, longitude, last_synced_at
        ${baseSql}
        order by id
        limit $2 offset $3
      `,
      [sport, limit, offset]
    );

    return NextResponse.json({
      count: Number(countResult.rows[0]?.count ?? 0),
      limit,
      offset,
      rows: rowsResult.rows,
    });
  } catch (error) {
    return NextResponse.json(
      {
        rows: [],
        count: 0,
        error: error instanceof Error ? error.message : "Unknown DB error",
      },
      { status: 200 }
    );
  }
}
