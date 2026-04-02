import { NextRequest, NextResponse } from "next/server";
import {
  getRecordOverrides,
  setRecordOverrides,
  upsertRecordOverride,
  deleteRecordOverride,
  type RecordOverride,
} from "@/lib/pinned";

export async function GET() {
  const overrides = await getRecordOverrides();
  return NextResponse.json(overrides);
}

/** PUT body: single RecordOverride → upsert */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json() as RecordOverride;
    if (!body.key || !body.value) {
      return NextResponse.json({ error: "key and value are required" }, { status: 400 });
    }
    body.updatedAt = new Date().toISOString();
    await upsertRecordOverride(body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** DELETE body: { key: string } → remove one override */
export async function DELETE(req: NextRequest) {
  try {
    const { key } = await req.json() as { key: string };
    if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
    await deleteRecordOverride(key);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
