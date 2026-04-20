import { NextRequest, NextResponse } from "next/server";
import { getFeaturedMatches, setFeaturedMatches } from "@/lib/pinned";

export async function GET(req: NextRequest) {
  const region = req.nextUrl.searchParams.get("region") ?? "ALL";
  const matches = await getFeaturedMatches(region);
  return NextResponse.json(matches);
}

export async function PUT(req: NextRequest) {
  const region = req.nextUrl.searchParams.get("region") ?? "ALL";
  try {
    const body = await req.json();
    const matches = Array.isArray(body) ? body : [];
    await setFeaturedMatches(region, matches);
    return NextResponse.json({ ok: true, count: matches.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
