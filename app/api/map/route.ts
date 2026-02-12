import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  try {
    const target = new URL(url);
    if (!target.hostname.endsWith("basemaps.cartocdn.com")) {
      return NextResponse.json({ error: "Invalid host" }, { status: 400 });
    }

    const response = await fetch(target.toString());
    const contentType = response.headers.get("content-type") || "";

    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=86400",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch map" }, { status: 500 });
  }
}
