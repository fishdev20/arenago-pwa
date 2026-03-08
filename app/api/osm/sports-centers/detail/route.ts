import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";

type Row = {
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
  street: string | null;
  house_number: string | null;
  postal_code: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
  tags: Record<string, unknown> | null;
};

let pool: Pool | null = null;

function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return pool;
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id") ?? "";
  const [osmType, osmIdRaw] = id.split("-");
  const osmId = Number(osmIdRaw);
  const db = getPool();

  if (!db) {
    return NextResponse.json({ detail: null, error: "Missing DATABASE_URL" }, { status: 200 });
  }
  if (!osmType || !Number.isFinite(osmId)) {
    return NextResponse.json({ detail: null }, { status: 200 });
  }

  try {
    const result = await db.query<Row>(
      `
        select osm_type, osm_id, name, sports, opening_hours, website, payment, phone, email, address,
               street, house_number, postal_code, city, latitude, longitude, tags
        from public.osm_sport_centers
        where osm_type = $1 and osm_id = $2
        limit 1
      `,
      [osmType, osmId]
    );
    const row = result.rows[0];
    if (!row) return NextResponse.json({ detail: null }, { status: 200 });

    const tags = row.tags ?? {};
    const tagStreet = typeof tags["addr:street"] === "string" ? tags["addr:street"] : null;
    const tagHouse = typeof tags["addr:housenumber"] === "string" ? tags["addr:housenumber"] : null;
    const tagPostalCode = typeof tags["addr:postcode"] === "string" ? tags["addr:postcode"] : null;
    const tagCity = typeof tags["addr:city"] === "string" ? tags["addr:city"] : null;

    return NextResponse.json({
      detail: {
        id: `${row.osm_type}-${row.osm_id}`,
        name: row.name,
        sports: row.sports ?? [],
        openingHours: row.opening_hours,
        website: row.website,
        payment: row.payment,
        phone: row.phone,
        email: row.email,
        address: row.address ?? "Address unavailable",
        street: row.street ?? tagStreet,
        buildingNumber: row.house_number ?? tagHouse,
        postalCode: row.postal_code ?? tagPostalCode,
        city: row.city ?? tagCity,
        lat: row.latitude,
        lon: row.longitude,
      },
    });
  } catch {
    return NextResponse.json({ detail: null }, { status: 200 });
  }
}
