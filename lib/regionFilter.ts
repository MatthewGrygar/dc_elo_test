import { fetchFRPlayerNames } from "./sheets";

export type Region = "FR" | "CZ" | "ALL";

export async function getNameFilter(region: string): Promise<((n: string) => boolean) | undefined> {
  if (region === "ALL") return undefined;
  const frNames = await fetchFRPlayerNames();
  if (region === "FR") return (n: string) => frNames.has(n);
  return (n: string) => !frNames.has(n); // CZ
}
