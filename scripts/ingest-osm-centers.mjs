import { Pool } from "pg";

const OVERPASS_URL = process.env.OVERPASS_URL ?? "https://overpass-api.de/api/interpreter";
const DATABASE_URL = process.env.DATABASE_URL;
const BBOX = process.env.OSM_BBOX ?? "60.12,24.82,60.25,25.10"; // south,west,north,east
const SPORT_TYPES = (process.env.SPORT_TYPES ?? "")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

function normalizeSport(value) {
  return value.trim().toLowerCase().replace(/[-_]+/g, " ");
}

function parseSports(tags) {
  const values = (tags?.sport ?? "")
    .split(";")
    .map((v) => normalizeSport(v))
    .filter(Boolean);
  if (values.length > 0) return values;

  const leisure = tags?.leisure;
  if (leisure && ["sports_centre", "fitness_centre", "pitch"].includes(leisure)) {
    return [normalizeSport(leisure)];
  }
  return [];
}

function addressComponentsFromTags(tags) {
  const street = tags?.["addr:street"];
  const house = tags?.["addr:housenumber"];
  const postcode = tags?.["addr:postcode"];
  const city = tags?.["addr:city"];
  const parts = [street ? `${street}${house ? ` ${house}` : ""}` : "", postcode ?? "", city ?? ""].filter(
    Boolean
  );

  return {
    address: parts.join(", "),
    street: typeof street === "string" && street.trim() ? street.trim() : null,
    houseNumber: typeof house === "string" && house.trim() ? house.trim() : null,
    postalCode: typeof postcode === "string" && postcode.trim() ? postcode.trim() : null,
    city: typeof city === "string" && city.trim() ? city.trim() : null,
  };
}

function paymentFromTags(tags) {
  if (!tags) return null;
  if (typeof tags.payment === "string" && tags.payment.trim()) {
    return tags.payment.trim();
  }
  const methods = Object.keys(tags)
    .filter((key) => key.startsWith("payment:") && String(tags[key]).toLowerCase() === "yes")
    .map((key) => key.replace("payment:", ""));
  if (methods.length > 0) return methods.join(", ");
  return null;
}

function phoneFromTags(tags) {
  if (!tags) return null;
  const phone = tags.phone ?? tags["contact:phone"] ?? null;
  return typeof phone === "string" && phone.trim() ? phone.trim() : null;
}

function emailFromTags(tags) {
  if (!tags) return null;
  const email = tags.email ?? tags["contact:email"] ?? null;
  return typeof email === "string" && email.trim() ? email.trim() : null;
}

function matchesSports(sports) {
  if (SPORT_TYPES.length === 0) return true;
  return sports.some((sport) =>
    SPORT_TYPES.some((wanted) => sport.includes(wanted) || wanted.includes(sport))
  );
}

function toPoint(element) {
  if (typeof element.lat === "number" && typeof element.lon === "number") {
    return { lat: element.lat, lon: element.lon };
  }
  if (element.center && typeof element.center.lat === "number" && typeof element.center.lon === "number") {
    return { lat: element.center.lat, lon: element.center.lon };
  }
  return null;
}

function buildOverpassQuery(bbox) {
  return `[out:json][timeout:40];
(
  node["opening_hours"]["website"]["sport"](${bbox});
  way["opening_hours"]["website"]["sport"](${bbox});
  relation["opening_hours"]["website"]["sport"](${bbox});
  node["opening_hours"]["contact:website"]["sport"](${bbox});
  way["opening_hours"]["contact:website"]["sport"](${bbox});
  relation["opening_hours"]["contact:website"]["sport"](${bbox});

  node["opening_hours"]["website"]["leisure"~"sports_centre|fitness_centre|pitch"](${bbox});
  way["opening_hours"]["website"]["leisure"~"sports_centre|fitness_centre|pitch"](${bbox});
  relation["opening_hours"]["website"]["leisure"~"sports_centre|fitness_centre|pitch"](${bbox});
  node["opening_hours"]["contact:website"]["leisure"~"sports_centre|fitness_centre|pitch"](${bbox});
  way["opening_hours"]["contact:website"]["leisure"~"sports_centre|fitness_centre|pitch"](${bbox});
  relation["opening_hours"]["contact:website"]["leisure"~"sports_centre|fitness_centre|pitch"](${bbox});
);
out center tags;`;
}

async function ensureTable(pool) {
  await pool.query(`
    create table if not exists public.osm_sport_centers (
      id bigserial primary key,
      osm_type text not null,
      osm_id bigint not null,
      name text not null,
      sports text[] not null default '{}',
      opening_hours text not null,
      website text not null,
      payment text,
      phone text,
      email text,
      address text,
      street text,
      house_number text,
      postal_code text,
      city text,
      latitude double precision not null,
      longitude double precision not null,
      tags jsonb not null default '{}'::jsonb,
      last_synced_at timestamptz not null default now(),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (osm_type, osm_id)
    );
  `);
  await pool.query(`alter table public.osm_sport_centers add column if not exists payment text;`);
  await pool.query(`alter table public.osm_sport_centers add column if not exists phone text;`);
  await pool.query(`alter table public.osm_sport_centers add column if not exists email text;`);
  await pool.query(`alter table public.osm_sport_centers add column if not exists street text;`);
  await pool.query(`alter table public.osm_sport_centers add column if not exists house_number text;`);
  await pool.query(`alter table public.osm_sport_centers add column if not exists postal_code text;`);
  await pool.query(`alter table public.osm_sport_centers add column if not exists city text;`);
}

async function fetchOverpass() {
  const query = buildOverpassQuery(BBOX);
  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "content-type": "text/plain" },
    body: query,
  });
  if (!response.ok) {
    throw new Error(`Overpass request failed with status ${response.status}`);
  }
  const data = await response.json();
  return Array.isArray(data?.elements) ? data.elements : [];
}

async function upsertCenters(pool, rows) {
  const sql = `
    insert into public.osm_sport_centers (
      osm_type, osm_id, name, sports, opening_hours, website, payment, phone, email, address,
      street, house_number, postal_code, city, latitude, longitude, tags, last_synced_at, updated_at
    )
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,now(),now())
    on conflict (osm_type, osm_id)
    do update set
      name = excluded.name,
      sports = excluded.sports,
      opening_hours = excluded.opening_hours,
      website = excluded.website,
      payment = excluded.payment,
      phone = excluded.phone,
      email = excluded.email,
      address = excluded.address,
      street = excluded.street,
      house_number = excluded.house_number,
      postal_code = excluded.postal_code,
      city = excluded.city,
      latitude = excluded.latitude,
      longitude = excluded.longitude,
      tags = excluded.tags,
      last_synced_at = now(),
      updated_at = now();
  `;

  for (const row of rows) {
    await pool.query(sql, [
      row.osmType,
      row.osmId,
      row.name,
      row.sports,
      row.openingHours,
      row.website,
      row.payment,
      row.phone,
      row.email,
      row.address,
      row.street,
      row.houseNumber,
      row.postalCode,
      row.city,
      row.latitude,
      row.longitude,
      row.tags,
    ]);
  }
}

async function main() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  try {
    await ensureTable(pool);
    const elements = await fetchOverpass();
    const normalized = [];

    for (const element of elements) {
      const tags = element?.tags ?? {};
      const point = toPoint(element);
      if (!point) continue;

      const website = tags.website ?? tags["contact:website"] ?? "";
      const openingHours = tags.opening_hours ?? "";
      if (!website || !openingHours) continue;

      const sports = parseSports(tags);
      if (!matchesSports(sports)) continue;

      const address = addressComponentsFromTags(tags);
      normalized.push({
        osmType: String(element.type ?? ""),
        osmId: Number(element.id ?? 0),
        name: tags.name ?? tags["name:en"] ?? "Sports Center",
        sports,
        openingHours,
        website,
        payment: paymentFromTags(tags),
        phone: phoneFromTags(tags),
        email: emailFromTags(tags),
        address: address.address,
        street: address.street,
        houseNumber: address.houseNumber,
        postalCode: address.postalCode,
        city: address.city,
        latitude: point.lat,
        longitude: point.lon,
        tags,
      });
    }

    const deduped = Array.from(
      new Map(normalized.map((row) => [`${row.osmType}-${row.osmId}`, row])).values()
    );

    await upsertCenters(pool, deduped);
    console.log(`Ingestion complete. Upserted ${deduped.length} centers.`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
