/**
 * Pinned milestones + featured matches storage via Vercel KV.
 * Falls back gracefully when KV is not configured.
 */

export interface PinnedMilestone {
  id: string;
  icon: string;
  text: string;
  date: string;
  cat: string;
  visible: boolean;
  createdAt: string;
}

// ── KV availability ───────────────────────────────────────────────────────────
function kvAvailable() {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function getKV() {
  const { kv } = await import("@vercel/kv");
  return kv;
}

// ── Keys ─────────────────────────────────────────────────────────────────────
const MS_IDS_KEY = "milestones:ids";
const msKey = (id: string) => `milestone:${id}`;
const FEATURED_MATCHES_KEY = "featured:matchIds";

// ══════════════════════════════════════════════════════════════════════════════
// MILESTONES
// ══════════════════════════════════════════════════════════════════════════════

export async function getAllMilestones(): Promise<PinnedMilestone[]> {
  if (!kvAvailable()) return [];
  try {
    const kv = await getKV();
    const ids = await kv.lrange<string>(MS_IDS_KEY, 0, -1);
    if (!ids.length) return [];
    const items = await Promise.all(ids.map((id) => kv.get<PinnedMilestone>(msKey(id))));
    return (items.filter(Boolean) as PinnedMilestone[]).sort(
      (a, b) => b.createdAt.localeCompare(a.createdAt)
    );
  } catch {
    return [];
  }
}

export async function getVisibleMilestones(): Promise<PinnedMilestone[]> {
  const all = await getAllMilestones();
  return all.filter((m) => m.visible);
}

export async function createMilestone(
  data: Omit<PinnedMilestone, "id" | "createdAt">
): Promise<PinnedMilestone> {
  if (!kvAvailable()) throw new Error("KV not configured");
  const kv = await getKV();
  const id = crypto.randomUUID();
  const ms: PinnedMilestone = { ...data, id, createdAt: new Date().toISOString() };
  await kv.set(msKey(id), ms);
  await kv.lpush(MS_IDS_KEY, id);
  return ms;
}

export async function updateMilestone(
  id: string,
  data: Partial<Omit<PinnedMilestone, "id" | "createdAt">>
): Promise<PinnedMilestone | null> {
  if (!kvAvailable()) throw new Error("KV not configured");
  const kv = await getKV();
  const existing = await kv.get<PinnedMilestone>(msKey(id));
  if (!existing) return null;
  const updated = { ...existing, ...data };
  await kv.set(msKey(id), updated);
  return updated;
}

export async function deleteMilestone(id: string): Promise<boolean> {
  if (!kvAvailable()) throw new Error("KV not configured");
  const kv = await getKV();
  const existing = await kv.get<PinnedMilestone>(msKey(id));
  if (!existing) return false;
  await kv.del(msKey(id));
  await kv.lrem(MS_IDS_KEY, 0, id);
  return true;
}

// ══════════════════════════════════════════════════════════════════════════════
// FEATURED MATCHES
// ══════════════════════════════════════════════════════════════════════════════

export async function getFeaturedMatchIds(): Promise<string[]> {
  if (!kvAvailable()) return [];
  try {
    const kv = await getKV();
    return (await kv.get<string[]>(FEATURED_MATCHES_KEY)) ?? [];
  } catch {
    return [];
  }
}

export async function setFeaturedMatchIds(ids: string[]): Promise<void> {
  if (!kvAvailable()) throw new Error("KV not configured");
  const kv = await getKV();
  await kv.set(FEATURED_MATCHES_KEY, ids);
}
