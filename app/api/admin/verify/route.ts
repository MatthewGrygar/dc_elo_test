import { NextRequest, NextResponse } from "next/server";
import { checkPassword, checkRateLimit } from "@/lib/adminAuth";

/** Password re-confirmation for sensitive actions (does NOT issue a token). */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }
  try {
    const { password } = await req.json();
    if (!checkPassword(password)) {
      return NextResponse.json({ error: "Wrong password" }, { status: 401 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
