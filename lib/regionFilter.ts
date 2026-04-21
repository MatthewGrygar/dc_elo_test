import { fetchFRPlayerNames } from "./sheets";

export type Region = "FR" | "CZ" | "ALL";

export async function getNameFilter(
  region: string,
  mode: "ELO" | "DCPR" = "ELO"
): Promise<((n: string) => boolean) | undefined> {
  if (region === "ALL") return undefined;

  // DCPR is purely Czech — no French DCPR data exists.
  // CZ → no filter needed (all DCPR players are Czech).
  // FR → filter returns nothing (no data).
  if (mode === "DCPR") {
    if (region === "FR") return () => false;
    return undefined; // CZ = all DCPR data
  }

  // ELO: detect FR players from the FILTR sheet
  const frNames = await fetchFRPlayerNames();
  if (region === "FR") return (n: string) => frNames.has(n);
  return (n: string) => !frNames.has(n); // CZ
}
