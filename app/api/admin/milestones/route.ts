import { NextRequest, NextResponse } from "next/server";
import { getAllMilestones, createMilestone, reorderMilestones } from "@/lib/pinned";

export async function GET() {
  const milestones = await getAllMilestones();
  return NextResponse.json(milestones);
}

// PUT /api/admin/milestones  body: { order: string[] }  — save custom display order
export async function PUT(req: NextRequest) {
  try {
    const { order } = await req.json();
    if (!Array.isArray(order)) return NextResponse.json({ error: "order must be array" }, { status: 400 });
    await reorderMilestones(order);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ms = await createMilestone({
      icon: body.icon ?? "📌",
      text: body.text ?? "",
      date: body.date ?? new Date().toISOString().slice(0, 10),
      cat: body.cat ?? "",
      visible: Boolean(body.visible),
    });
    return NextResponse.json(ms, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
