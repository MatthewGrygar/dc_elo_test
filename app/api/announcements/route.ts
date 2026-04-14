import { NextResponse } from "next/server";

const SHEET_ID = "1y98bzsIRpVv0_cGNfbITapucO5A6izeEz5lTM92ZbIA";

async function fetchBanDates(): Promise<string[]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent("Ban")}`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const text = await res.text();
    const lines = text.split("\n").slice(1); // skip header
    return lines
      .map(l => l.split(",")[0]?.trim().replace(/^"|"$/g, ""))
      .filter(Boolean) as string[];
  } catch {
    return [];
  }
}

export async function GET() {
  const dates = await fetchBanDates();
  return NextResponse.json({ dates });
}
