import { NextRequest, NextResponse } from "next/server";
import { fetchRecords } from "@/lib/dataFetchers";
import { getRecordOverrides } from "@/lib/pinned";
import { getNameFilter } from "@/lib/regionFilter";

export async function GET(req: NextRequest) {
  const mode = (req.nextUrl.searchParams.get("mode") ?? "ELO") as "ELO" | "DCPR";
  const region = req.nextUrl.searchParams.get("region") ?? "ALL";
  try {
    const nameFilter = await getNameFilter(region, mode);
    const [data, overrides] = await Promise.all([
      fetchRecords(mode, nameFilter),
      getRecordOverrides(),
    ]);

    const overrideMap = new Map(overrides.map((o) => [o.key, o]));
    if (overrideMap.size > 0) {
      for (const cat of data.categories) {
        for (const rec of cat.records) {
          const key = `${cat.id}/${rec.label}`;
          const ov = overrideMap.get(key);
          if (ov && rec.entry) {
            rec.entry = {
              ...rec.entry,
              value: ov.value,
              ...(ov.player !== undefined ? { player: ov.player } : {}),
              ...(ov.detail !== undefined ? { detail: ov.detail } : {}),
              ...(ov.detail2 !== undefined ? { detail2: ov.detail2 } : {}),
            };
          }
        }
      }
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
