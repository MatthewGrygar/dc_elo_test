function kvAvailable() {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

async function getKV() {
  const { kv } = await import("@vercel/kv");
  return kv;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!kvAvailable()) return null;
  try {
    return await (await getKV()).get<T>(key);
  } catch { return null; }
}

export async function cacheSet(key: string, value: unknown, ttl = 600): Promise<void> {
  if (!kvAvailable()) return;
  try {
    await (await getKV()).set(key, value, { ex: ttl });
  } catch {}
}

export const prefetchKey = (mode: string, region: string) =>
  `cache:prefetch:${mode}:${region}`;

// ── Snapshot keys (permanent, only updated by admin sync) ────────────────────
export const SNAPSHOT_TTL = 86400 * 365; // 1 year = effectively permanent

export const snapshotKey = (type: string, mode: string, region: string) =>
  `snapshot:v1:${type}:${mode}:${region}`;

export const snapshotKeyMeta = () => `snapshot:v1:meta`;

export async function snapshotGet<T>(key: string): Promise<T | null> {
  return cacheGet<T>(key);
}

export async function snapshotSet(key: string, value: unknown): Promise<void> {
  return cacheSet(key, value, SNAPSHOT_TTL);
}
