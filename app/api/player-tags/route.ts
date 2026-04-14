import { NextResponse } from "next/server";
import { getSuperTagsMap } from "@/lib/pinned";

/** GET /api/player-tags → { [playerName]: SuperTag[] } */
export async function GET() {
  const map = await getSuperTagsMap();
  const obj: Record<string, { id: string; label: string; color?: string; icon?: string }[]> = {};
  for (const [name, tags] of map) {
    obj[name] = tags.map(t => ({ id: t.id, label: t.label, color: t.color, icon: t.icon }));
  }
  return NextResponse.json(obj, {
    headers: { "Cache-Control": "no-store" },
  });
}
