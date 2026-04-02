import { NextRequest, NextResponse } from "next/server";
import { getFeaturedMatchIds, setFeaturedMatchIds } from "@/lib/pinned";

export async function GET() {
  const ids = await getFeaturedMatchIds();
  return NextResponse.json(ids);
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const ids: string[] = Array.isArray(body) ? body : body.ids ?? [];
    await setFeaturedMatchIds(ids);
    return NextResponse.json({ ok: true, count: ids.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
