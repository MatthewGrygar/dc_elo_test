import { NextRequest, NextResponse } from "next/server";
import {
  getMetricOverrides,
  upsertMetricOverride,
  deleteMetricOverride,
  type MetricOverride,
} from "@/lib/pinned";

export async function GET() {
  const overrides = await getMetricOverrides();
  return NextResponse.json(overrides);
}

/** PUT body: single MetricOverride → upsert */
export async function PUT(req: NextRequest) {
  try {
    const body = (await req.json()) as MetricOverride;
    if (!body.key) {
      return NextResponse.json({ error: "key is required" }, { status: 400 });
    }
    body.updatedAt = new Date().toISOString();
    await upsertMetricOverride(body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/** DELETE body: { key: string } → remove one override */
export async function DELETE(req: NextRequest) {
  try {
    const { key } = (await req.json()) as { key: string };
    if (!key) return NextResponse.json({ error: "key required" }, { status: 400 });
    await deleteMetricOverride(key);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
