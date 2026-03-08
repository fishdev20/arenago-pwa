export type OSMViewport = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export type OSMPlace = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  sports: string[];
  address: string;
};
export type OSMMarker = {
  id: string;
  name: string;
  lat: number;
  lon: number;
};
export type OSMCenterDetail = {
  id: string;
  name: string;
  sports: string[];
  openingHours: string;
  website: string;
  payment: string | null;
  phone: string | null;
  email: string | null;
  address: string;
  street: string | null;
  buildingNumber: string | null;
  postalCode: string | null;
  city: string | null;
  lat: number;
  lon: number;
};

type Params = {
  sportTypes: string[];
  viewport?: OSMViewport | null;
};

export async function getOSMSportsCenters(params: Params) {
  const response = await fetch("/api/osm/sports-centers", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch OSM centers (${response.status})`);
  }

  const data = (await response.json()) as { places?: OSMPlace[] };
  return data.places ?? [];
}

export async function getOSMMarkers(sportTypes: string[]) {
  const response = await fetch("/api/osm/sports-centers/markers", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sportTypes }),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch OSM markers (${response.status})`);
  }
  const data = (await response.json()) as { markers?: OSMMarker[] };
  return data.markers ?? [];
}

export async function getOSMCenterDetail(id: string) {
  const response = await fetch(`/api/osm/sports-centers/detail?id=${encodeURIComponent(id)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch OSM center detail (${response.status})`);
  }
  const data = (await response.json()) as { detail?: OSMCenterDetail | null };
  return data.detail ?? null;
}
