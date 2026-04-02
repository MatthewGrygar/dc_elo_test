import { NextRequest, NextResponse } from "next/server";
import { getAllMilestones, createMilestone } from "@/lib/pinned";

export async function GET() {
  const milestones = await getAllMilestones();
  return NextResponse.json(milestones);
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
