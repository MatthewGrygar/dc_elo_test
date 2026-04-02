import { NextResponse } from "next/server";
import { getPublishedArticles, getSliderArticles } from "@/lib/articles";

// GET /api/articles?slider=true  — published articles (optionally only slider ones)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sliderOnly = searchParams.get("slider") === "true";

  const articles = sliderOnly
    ? await getSliderArticles()
    : await getPublishedArticles();

  return NextResponse.json(articles, {
    headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
  });
}
