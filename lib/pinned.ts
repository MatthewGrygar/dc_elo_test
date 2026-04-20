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
  region?: string; // "ALL" | "FR" | "CZ" | undefined → treated as "ALL"
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
const MS_ORDER_KEY = "milestones:order";
const msKey = (id: string) => `milestone:${id}`;
const FEATURED_MATCHES_KEY = "featured:matchIds"; // legacy global key
const featuredMatchesRegionKey = (r: string) => `featured:matchIds:${r}`;

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
    const valid = items.filter(Boolean) as PinnedMilestone[];
    // Check for custom display order
    const customOrder = await kv.get<string[]>(MS_ORDER_KEY);
    if (customOrder && customOrder.length > 0) {
      const byId = new Map(valid.map(m => [m.id, m]));
      const ordered = customOrder.map(id => byId.get(id)).filter(Boolean) as PinnedMilestone[];
      const orderedSet = new Set(customOrder);
      const extra = valid.filter(m => !orderedSet.has(m.id)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return [...extra, ...ordered];
    }
    return valid.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

export async function getVisibleMilestones(region = "ALL"): Promise<PinnedMilestone[]> {
  const all = await getAllMilestones();
  const visible = all.filter((m) => m.visible);
  if (region === "ALL") return visible.filter((m) => !m.region || m.region === "ALL");
  const regionMs = visible.filter((m) => m.region === region);
  return regionMs; // empty → caller falls back to auto-generated
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

export async function getFeaturedMatches(region = "ALL"): Promise<FeaturedMatch[]> {
  if (!kvAvailable()) return [];
  try {
    const kv = await getKV();
    const val = await kv.get<FeaturedMatch[]>(featuredMatchesRegionKey(region));
    if (val !== null) return val;
    // backward compat: for ALL fall back to old global key
    if (region === "ALL") return (await kv.get<FeaturedMatch[]>(FEATURED_MATCHES_KEY)) ?? [];
    return []; // no region-specific matches → caller uses auto-generated
  } catch { return []; }
}

/** Backward-compat: just the IDs */
export async function getFeaturedMatchIds(): Promise<string[]> {
  return (await getFeaturedMatches()).map((m) => m.matchId);
}

export async function reorderMilestones(ids: string[]): Promise<void> {
  if (!kvAvailable()) throw new Error("KV not configured");
  const kv = await getKV();
  await kv.set(MS_ORDER_KEY, ids);
}

export async function setFeaturedMatches(region = "ALL", matches: FeaturedMatch[]): Promise<void> {
  if (!kvAvailable()) throw new Error("KV not configured");
  const kv = await getKV();
  await kv.set(featuredMatchesRegionKey(region), matches);
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
// PLAYER TAGS
// ══════════════════════════════════════════════════════════════════════════════

export interface PlayerTag {
  id: string;
  label: string;
  color?: string;    // e.g. "hsl(152,72%,45%)" or "#abc123"
  icon?: string;     // emoji or short text
  isSuper: boolean;  // true = show next to player name in leaderboard
  createdAt: string;
}

const playerTagsKey = (name: string) => `player-tags:${name}`;
const ALL_TAGGED_PLAYERS_KEY = "player-tags:index";

export async function getPlayerTags(playerName: string): Promise<PlayerTag[]> {
  if (!kvAvailable()) return [];
  try {
    const kv = await getKV();
    return (await kv.get<PlayerTag[]>(playerTagsKey(playerName))) ?? [];
  } catch { return []; }
}

export async function getAllTaggedPlayers(): Promise<string[]> {
  if (!kvAvailable()) return [];
  try {
    const kv = await getKV();
    return (await kv.lrange<string>(ALL_TAGGED_PLAYERS_KEY, 0, -1));
  } catch { return []; }
}

export async function upsertPlayerTag(playerName: string, tag: PlayerTag): Promise<void> {
  if (!kvAvailable()) throw new Error("KV not configured");
  const kv = await getKV();
  const tags = await getPlayerTags(playerName);
  const idx = tags.findIndex(t => t.id === tag.id);
  if (idx >= 0) tags[idx] = tag;
  else {
    tags.push(tag);
    // Track player in index if first tag
    const index = await getAllTaggedPlayers();
    if (!index.includes(playerName)) await kv.lpush(ALL_TAGGED_PLAYERS_KEY, playerName);
  }
  await kv.set(playerTagsKey(playerName), tags);
}

export async function deletePlayerTag(playerName: string, tagId: string): Promise<void> {
  if (!kvAvailable()) throw new Error("KV not configured");
  const kv = await getKV();
  const tags = await getPlayerTags(playerName);
  const updated = tags.filter(t => t.id !== tagId);
  if (updated.length === 0) {
    await kv.del(playerTagsKey(playerName));
    await kv.lrem(ALL_TAGGED_PLAYERS_KEY, 0, playerName);
  } else {
    await kv.set(playerTagsKey(playerName), updated);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// PLAYER PROFILE (moxfield, record tag, etc.)
// ══════════════════════════════════════════════════════════════════════════════

export interface PlayerProfile {
  playerName: string;
  recordTag?: string;
  recordTagMode?: "ELO" | "DCPR" | "both";
  moxfieldUrl?: string;
  updatedAt: string;
}

const playerProfileKey = (name: string) => `player-profile:${name}`;

export async function getPlayerProfile(playerName: string): Promise<PlayerProfile | null> {
  if (!kvAvailable()) return null;
  try {
    const kv = await getKV();
    return await kv.get<PlayerProfile>(playerProfileKey(playerName));
  } catch { return null; }
}

export async function upsertPlayerProfile(profile: Omit<PlayerProfile, "updatedAt">): Promise<PlayerProfile> {
  if (!kvAvailable()) throw new Error("KV not configured");
  const kv = await getKV();
  const full: PlayerProfile = { ...profile, updatedAt: new Date().toISOString() };
  await kv.set(playerProfileKey(profile.playerName), full);
  return full;
}

/** Returns map of playerName → super tags (for leaderboard display) */
export async function getSuperTagsMap(): Promise<Map<string, PlayerTag[]>> {
  if (!kvAvailable()) return new Map();
  try {
    const players = await getAllTaggedPlayers();
    const entries = await Promise.all(
      players.map(async (name) => {
        const tags = await getPlayerTags(name);
        const superTags = tags.filter(t => t.isSuper);
        return [name, superTags] as [string, PlayerTag[]];
      })
    );
    return new Map(entries.filter(([, tags]) => tags.length > 0));
  } catch { return new Map(); }
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
