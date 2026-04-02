import { NextRequest, NextResponse } from "next/server";
import { getFeaturedMatches, setFeaturedMatches } from "@/lib/pinned";

export async function GET() {
  const matches = await getFeaturedMatches();
  return NextResponse.json(matches);
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const matches = Array.isArray(body) ? body : [];
    await setFeaturedMatches(matches);
    return NextResponse.json({ ok: true, count: matches.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
