import { NextRequest, NextResponse } from "next/server";
import { getPlayerTags, upsertPlayerTag, deletePlayerTag, getAllTaggedPlayers, PlayerTag } from "@/lib/pinned";
import { fetchPlayerList } from "@/lib/dataFetchers";

// GET /api/admin/tags?player=Name  → tags for one player
// GET /api/admin/tags?all=1        → { players: string[], taggedPlayers: string[] }
export async function GET(req: NextRequest) {
  const player = req.nextUrl.searchParams.get("player");
  const all = req.nextUrl.searchParams.get("all");

  if (player) {
    const tags = await getPlayerTags(player);
    return NextResponse.json(tags);
  }

  if (all) {
    const [players, tagged] = await Promise.all([
      fetchPlayerList("ELO"),
      getAllTaggedPlayers(),
    ]);
    return NextResponse.json({ players, taggedPlayers: tagged });
  }

  return NextResponse.json({ error: "Missing query param" }, { status: 400 });
}

// POST /api/admin/tags  body: { playerName, tag: PlayerTag (without id/createdAt) }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { playerName, tag } = body as { playerName: string; tag: Omit<PlayerTag, "id" | "createdAt"> };
    if (!playerName || !tag?.label) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const full: PlayerTag = {
      ...tag,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    await upsertPlayerTag(playerName, full);
    return NextResponse.json(full);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// PUT /api/admin/tags  body: { playerName, tag: PlayerTag (full, with id) }
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { playerName, tag } = body as { playerName: string; tag: PlayerTag };
    if (!playerName || !tag?.id) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    await upsertPlayerTag(playerName, tag);
    return NextResponse.json(tag);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// DELETE /api/admin/tags?player=Name&id=tagId
export async function DELETE(req: NextRequest) {
  try {
    const player = req.nextUrl.searchParams.get("player");
    const id = req.nextUrl.searchParams.get("id");
    if (!player || !id) return NextResponse.json({ error: "Missing params" }, { status: 400 });
    await deletePlayerTag(player, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
