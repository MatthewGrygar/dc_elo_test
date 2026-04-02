"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, EyeOff, Star } from "lucide-react";

interface Article {
  id: string;
  title: { cs: string; en: string; fr: string };
  tag: string;
  author: string;
  date: string;
  published: boolean;
  inSlider: boolean;
  updatedAt: string;
}

const green = "hsl(152,72%,45%)";
const greenBg = "hsl(152 72% 45% / 0.1)";
const greenBorder = "hsl(152 72% 45% / 0.28)";

function Badge({ color, label }: { color: string; label: string }) {
  return (
    <span style={{
      padding: "2px 8px", borderRadius: 99, fontSize: 10, fontWeight: 700,
      fontFamily: "var(--font-mono)", letterSpacing: "0.04em",
      background: `${color}18`, border: `1px solid ${color}44`, color,
    }}>{label}</span>
  );
}

export default function AdminDashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/articles");
    if (res.ok) setArticles(await res.json());
    setLoading(false);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Smazat článek „${title}"?`)) return;
    setDeleting(id);
    const res = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
    if (res.ok) setArticles((prev) => prev.filter((a) => a.id !== id));
    setDeleting(null);
  }

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 2 }}>
            Články
          </h1>
          <p style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
            Spravujte články zobrazované na webu
          </p>
        </div>
        <Link href="/admin/articles/new" style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "9px 16px", borderRadius: 10,
          background: green, color: "#000",
          fontWeight: 700, fontSize: 13, textDecoration: "none",
          transition: "opacity .15s",
        }}>
          <Plus size={15} /> Nový článek
        </Link>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "hsl(var(--muted-foreground))", fontSize: 13 }}>
          Načítám…
        </div>
      ) : articles.length === 0 ? (
        <div style={{
          padding: "3rem", textAlign: "center",
          background: "hsl(var(--card)/0.6)", borderRadius: 14,
          border: "1px dashed hsl(var(--border))",
          color: "hsl(var(--muted-foreground))", fontSize: 13,
        }}>
          Žádné články. <Link href="/admin/articles/new" style={{ color: green }}>Vytvořte první.</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {articles.map((a) => (
            <div key={a.id} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 16px",
              background: "hsl(var(--card)/0.7)", backdropFilter: "blur(12px)",
              border: "1px solid hsl(var(--border))", borderRadius: 12,
            }}>
              {/* Status dot */}
              <div style={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                background: a.published ? green : "hsl(var(--muted-foreground))",
                boxShadow: a.published ? `0 0 8px ${green}88` : "none",
              }} />

              {/* Title & meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "hsl(var(--foreground))", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {a.title.cs || "(bez názvu)"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <Badge color={"hsl(195,78%,50%)"} label={a.tag || "—"} />
                  {a.published ? <Badge color={green} label="Publikováno" /> : <Badge color="hsl(var(--muted-foreground))" label="Koncept" />}
                  {a.inSlider && <Badge color="hsl(42,80%,52%)" label="★ Slider" />}
                  <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))" }}>{a.date} · {a.author}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <Link href={`/admin/articles/${a.id}/edit`}
                  title="Upravit"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 32, height: 32, borderRadius: 8,
                    background: greenBg, border: `1px solid ${greenBorder}`,
                    color: green, textDecoration: "none",
                  }}>
                  <Pencil size={13} />
                </Link>
                <button
                  onClick={() => handleDelete(a.id, a.title.cs)}
                  disabled={deleting === a.id}
                  title="Smazat"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 32, height: 32, borderRadius: 8,
                    background: "hsl(var(--destructive)/0.1)",
                    border: "1px solid hsl(var(--destructive)/0.3)",
                    color: "hsl(var(--destructive))", cursor: "pointer",
                    opacity: deleting === a.id ? 0.5 : 1,
                  }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
