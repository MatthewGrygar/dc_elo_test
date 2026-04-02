import { NextRequest, NextResponse } from "next/server";
import { getAllArticles, createArticle } from "@/lib/articles";

// GET /api/admin/articles — list all articles (admin, including drafts)
export async function GET() {
  try {
    const articles = await getAllArticles();
    return NextResponse.json(articles);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/admin/articles — create new article
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const article = await createArticle({
      title: body.title,
      excerpt: body.excerpt,
      body: body.body ?? [],
      tag: body.tag ?? "",
      author: body.author ?? "",
      date: body.date ?? new Date().toISOString().slice(0, 10),
      readTime: Number(body.readTime) || 5,
      image: body.image || undefined,
      inSlider: Boolean(body.inSlider),
      published: Boolean(body.published),
    });
    return NextResponse.json(article, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
