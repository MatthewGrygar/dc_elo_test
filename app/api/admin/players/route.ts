import { NextRequest, NextResponse } from "next/server";
import { getPlayerTags, upsertPlayerTag, deletePlayerTag, getAllTaggedPlayers, PlayerTag, getPlayerProfile, upsertPlayerProfile } from "@/lib/pinned";
import { fetchPlayerList } from "@/lib/dataFetchers";

// GET /api/admin/players?all=1       → { players: string[], taggedPlayers: string[] }
// GET /api/admin/players?player=Name → { tags: PlayerTag[], profile: PlayerProfile | null }
export async function GET(req: NextRequest) {
  const player = req.nextUrl.searchParams.get("player");
  const all = req.nextUrl.searchParams.get("all");

  if (player) {
    const [tags, profile] = await Promise.all([
      getPlayerTags(player),
      getPlayerProfile(player),
    ]);
    return NextResponse.json({ tags, profile });
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

// POST /api/admin/players  body: { playerName, tag: Omit<PlayerTag, "id"|"createdAt"> }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { playerName, tag } = body as { playerName: string; tag: Omit<PlayerTag, "id" | "createdAt"> };
    if (!playerName || !tag?.label) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    const full: PlayerTag = { ...tag, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    await upsertPlayerTag(playerName, full);
    return NextResponse.json(full);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// PUT /api/admin/players  body: { playerName, tag?: PlayerTag, profile?: PlayerProfile }
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { playerName, tag, profile } = body as { playerName: string; tag?: PlayerTag; profile?: { recordTag?: string; recordTagMode?: "ELO" | "DCPR" | "both"; moxfieldUrl?: string } };
    if (!playerName) return NextResponse.json({ error: "Missing playerName" }, { status: 400 });

    if (tag?.id) {
      await upsertPlayerTag(playerName, tag);
      return NextResponse.json(tag);
    }

    if (profile !== undefined) {
      const updated = await upsertPlayerProfile({ playerName, ...profile });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// DELETE /api/admin/players?player=Name&id=tagId
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
