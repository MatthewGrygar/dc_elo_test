/**
 * Article storage layer.
 * Uses Vercel KV when KV_REST_API_URL + KV_REST_API_TOKEN env vars are set.
 * Falls back to the hardcoded seed article otherwise (read-only).
 */

export type Section =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "code"; text: string }
  | { type: "ul"; items: string[] };

export interface Article {
  id: string;
  title: { cs: string; en: string; fr: string };
  excerpt: { cs: string; en: string; fr: string };
  body: Section[];
  tag: string;
  author: string;
  date: string;       // YYYY-MM-DD
  readTime: number;
  image?: string;
  inSlider: boolean;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Hardcoded seed article (backward compat) ──────────────────────────────────
const SEED_ARTICLE: Article = {
  id: "legacy-1",
  title: {
    cs: "Metodika hodnocení hráčů — DC ELO systém",
    en: "Player Rating Methodology — DC ELO System",
    fr: "Méthodologie de classement des joueurs — Système DC ELO",
  },
  excerpt: {
    cs: "V Duel Commander komunitě používáme systém hodnocení, jehož cílem je dlouhodobě, transparentně a konzistentně odhadovat výkonnost hráčů na základě skutečně odehraných matchů.",
    en: "In the Duel Commander community we use a rating system designed to estimate player performance consistently and transparently based on actually played matches.",
    fr: "Dans la communauté Duel Commander, nous utilisons un système de classement conçu pour estimer les performances des joueurs de manière cohérente et transparente sur la base des matchs réellement joués.",
  },
  tag: "Analytika",
  author: "DCPR Komise",
  date: "2025-03-01",
  readTime: 8,
  inSlider: false,
  published: true,
  createdAt: "2025-03-01T00:00:00.000Z",
  updatedAt: "2025-03-01T00:00:00.000Z",
  body: [
    { type: "p", text: "V Duel Commander komunitě používáme systém hodnocení, jehož cílem je dlouhodobě, transparentně a konzistentně odhadovat výkonnost hráčů na základě skutečně odehraných matchů. Základem je modifikovaný model Elo, doplněný o datově řízenou segmentaci hráčů do čtyř tříd (Class A–D)." },
    { type: "p", text: "Metodicky vycházíme z kalibrace používané v MTG Elo Project, která je navržena pro prostředí karetních her s vyšší variancí výsledků. Cílem není vytvořit agresivní žebříček s extrémními rozdíly, ale stabilní a realistický odhad relativní síly hráčů." },
    { type: "h2", text: "Elo jako průběžný odhad výkonnosti" },
    { type: "p", text: "Každý hráč vstupuje do systému s počátečním ratingem 1500 bodů. Rating se následně upravuje po každém odehraném matchi podle klasického Elo principu: změna je úměrná rozdílu mezi očekávaným a skutečným výsledkem." },
    { type: "p", text: "Použitý vývojový parametr je K = 36. Tento relativně vyšší faktor odráží skutečnost, že v komunitním prostředí je počet her na hráče omezený a variabilita výsledků vyšší než například v šachu." },
    { type: "h2", text: "Očekávané skóre" },
    { type: "code", text: "E = 1 / (1 + 10^((Rb − Ra) / 1135))" },
    { type: "p", text: "Klíčovým parametrem je konstanta 1135, která určuje 'plošnost' křivky očekávání. V praxi znamená, že rozdíl 200 ratingových bodů odpovídá přibližně 60% očekávané úspěšnosti silnějšího hráče." },
    { type: "h2", text: "Aktualizace ratingu" },
    { type: "code", text: "R′ = R + K · (S − E)" },
    { type: "p", text: "S je skutečný výsledek: 1 (výhra), 0 (prohra), 0.5 (remíza). Interně jsou ratingy vedeny s desetinnou přesností, aby nedocházelo k systematickým zaokrouhlovacím chybám." },
    { type: "h2", text: "Co se do modelu započítává — a co ne" },
    { type: "p", text: "Model pracuje výhradně s výsledkem matchu. Skóre 2–0 a 2–1 má z hlediska ratingu stejný dopad." },
    { type: "ul", items: ["BYE nemá na rating žádný vliv.", "Nevalidní nebo neúplné záznamy se nezapočítávají.", "Rating reflektuje pouze skutečně odehrané head‑to‑head zápasy."] },
    { type: "h2", text: "Od spojitého ratingu k třídám A–D" },
    { type: "p", text: "Nad ratingem aplikujeme shlukovou analýzu pomocí algoritmu k‑means s parametrem k = 4 (čtyři clustery), které mapujeme na Class A (nejvyšší) až Class D." },
    { type: "h2", text: "Závěrečné shrnutí" },
    { type: "ul", items: ["konzistentní odhad výkonnosti založený výhradně na odehraných zápasech,", "realistická interpretace ratingových rozdílů v prostředí karetní hry,", "přehledná segmentace hráčské základny bez arbitrárních hranic."] },
  ],
};

// ── KV helpers ────────────────────────────────────────────────────────────────
function kvAvailable() {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

const IDS_KEY = "articles:ids";
const articleKey = (id: string) => `article:${id}`;

async function getKV() {
  const { kv } = await import("@vercel/kv");
  return kv;
}

// ── Public API ─────────────────────────────────────────────────────────────────

export async function getAllArticles(): Promise<Article[]> {
  if (!kvAvailable()) return [SEED_ARTICLE];
  try {
    const kv = await getKV();
    const ids = await kv.lrange<string>(IDS_KEY, 0, -1);
    if (!ids.length) return [SEED_ARTICLE];
    const items = await Promise.all(ids.map((id) => kv.get<Article>(articleKey(id))));
    return items.filter(Boolean) as Article[];
  } catch {
    return [SEED_ARTICLE];
  }
}

export async function getPublishedArticles(): Promise<Article[]> {
  const all = await getAllArticles();
  return all
    .filter((a) => a.published)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getSliderArticles(): Promise<Article[]> {
  const published = await getPublishedArticles();
  return published.filter((a) => a.inSlider);
}

export async function getArticleById(id: string): Promise<Article | null> {
  if (id === "legacy-1") return SEED_ARTICLE;
  if (!kvAvailable()) return null;
  try {
    const kv = await getKV();
    return kv.get<Article>(articleKey(id));
  } catch {
    return null;
  }
}

export async function createArticle(
  data: Omit<Article, "id" | "createdAt" | "updatedAt">
): Promise<Article> {
  if (!kvAvailable()) throw new Error("KV not configured");
  const kv = await getKV();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const article: Article = { ...data, id, createdAt: now, updatedAt: now };
  await kv.set(articleKey(id), article);
  await kv.lpush(IDS_KEY, id);
  return article;
}

export async function updateArticle(
  id: string,
  data: Partial<Omit<Article, "id" | "createdAt">>
): Promise<Article | null> {
  if (!kvAvailable()) throw new Error("KV not configured");
  const kv = await getKV();
  const existing = await kv.get<Article>(articleKey(id));
  if (!existing) return null;
  const updated: Article = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
  await kv.set(articleKey(id), updated);
  return updated;
}

export async function deleteArticle(id: string): Promise<boolean> {
  if (!kvAvailable()) throw new Error("KV not configured");
  const kv = await getKV();
  const existing = await kv.get<Article>(articleKey(id));
  if (!existing) return false;
  await kv.del(articleKey(id));
  await kv.lrem(IDS_KEY, 0, id);
  return true;
}
