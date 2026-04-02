/**
 * Pinned milestones + featured matches storage via Vercel KV.
 * Falls back gracefully when KV is not configured.
 */

export interface FeaturedMatch {
  matchId: string;
  /** "high-elo" | "elo-diff" | "custom" */
  category: string;
  categoryLabel: string;
  categoryEmoji: string;
}

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

export async function getFeaturedMatches(): Promise<FeaturedMatch[]> {
  if (!kvAvailable()) return [];
  try {
    const kv = await getKV();
    return (await kv.get<FeaturedMatch[]>(FEATURED_MATCHES_KEY)) ?? [];
  } catch {
    return [];
  }
}

/** Backward-compat: just the IDs */
export async function getFeaturedMatchIds(): Promise<string[]> {
  return (await getFeaturedMatches()).map((m) => m.matchId);
}

export async function setFeaturedMatches(matches: FeaturedMatch[]): Promise<void> {
  if (!kvAvailable()) throw new Error("KV not configured");
  const kv = await getKV();
  await kv.set(FEATURED_MATCHES_KEY, matches);
}

// ══════════════════════════════════════════════════════════════════════════════
// RECORD OVERRIDES
// ══════════════════════════════════════════════════════════════════════════════

/** Key = "<categoryId>/<recordLabel>" */
export interface RecordOverride {
  key: string;
  value: string;
  player?: string;
  detail?: string;
  detail2?: string;
  note?: string;            // admin note explaining why this was overridden
  formula?: string;         // custom formula text override (shown in library)
  pinned?: boolean;         // true = hold until manual change; false = auto-recalculate on next load
  customLabel?: string;     // custom display name override
  updatedAt: string;
}

const RECORD_OVERRIDES_KEY = "records:overrides";

export async function getRecordOverrides(): Promise<RecordOverride[]> {
  if (!kvAvailable()) return [];
  try {
    const kv = await getKV();
    return (await kv.get<RecordOverride[]>(RECORD_OVERRIDES_KEY)) ?? [];
  } catch {
    return [];
  }
}

export async function setRecordOverrides(overrides: RecordOverride[]): Promise<void> {
  if (!kvAvailable()) throw new Error("KV not configured");
  const kv = await getKV();
  await kv.set(RECORD_OVERRIDES_KEY, overrides);
}

export async function upsertRecordOverride(override: RecordOverride): Promise<void> {
  const all = await getRecordOverrides();
  const idx = all.findIndex((o) => o.key === override.key);
  if (idx >= 0) all[idx] = override;
  else all.push(override);
  await setRecordOverrides(all);
}

export async function deleteRecordOverride(key: string): Promise<void> {
  const all = await getRecordOverrides();
  await setRecordOverrides(all.filter((o) => o.key !== key));
}

// ══════════════════════════════════════════════════════════════════════════════
// METRIC OVERRIDES (library pages: formula / customLabel per metric)
// ══════════════════════════════════════════════════════════════════════════════

/** Key = "<pageId>/<metricName>" */
export interface MetricOverride {
  key: string;
  customLabel?: string;     // renamed display name
  formula?: string;         // custom formula text (replaces default)
  updatedAt: string;
}

const METRIC_OVERRIDES_KEY = "library:metric-overrides";

export async function getMetricOverrides(): Promise<MetricOverride[]> {
  if (!kvAvailable()) return [];
  try {
    const kv = await getKV();
    return (await kv.get<MetricOverride[]>(METRIC_OVERRIDES_KEY)) ?? [];
  } catch {
    return [];
  }
}

export async function upsertMetricOverride(override: MetricOverride): Promise<void> {
  const all = await getMetricOverrides();
  const idx = all.findIndex((o) => o.key === override.key);
  if (idx >= 0) all[idx] = override;
  else all.push(override);
  const kv = await getKV();
  await kv.set(METRIC_OVERRIDES_KEY, all);
}

export async function deleteMetricOverride(key: string): Promise<void> {
  const all = await getMetricOverrides();
  const kv = await getKV();
  await kv.set(METRIC_OVERRIDES_KEY, all.filter((o) => o.key !== key));
}
