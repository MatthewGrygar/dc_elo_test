import { useEffect, useMemo, useState } from "react";
import type { PlayerRow } from "../types/player";
import { fetchPlayersFromSheet } from "../data/googleSheets";

export type PlayersState =
  | { status: "idle" | "loading"; players: PlayerRow[] }
  | { status: "ready"; players: PlayerRow[] }
  | { status: "error"; players: PlayerRow[]; error: string };

/**
 * usePlayers is the single source for leaderboard players.
 * Later we can extend it with caching, pagination, server-side sort, etc.
 */
export function usePlayers() {
  const [state, setState] = useState<PlayersState>({ status: "loading", players: [] });

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        setState({ status: "loading", players: [] });
        const players = await fetchPlayersFromSheet(controller.signal);

        // Default sort: rating desc
        players.sort((a, b) => b.rating - a.rating);

        setState({ status: "ready", players });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        setState({ status: "error", players: [], error: msg });
      }
    })();

    return () => controller.abort();
  }, []);

  const top = useMemo(() => state.players.slice(0, 10), [state.players]);

  return { state, top };
}
