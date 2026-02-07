import { setModalActions, setModalHeaderMeta, setModalContent } from "./modal.js";

function escapeHtml(str) {
  return (str ?? "")
    .toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeOpponentName(opponentText) {
  const t = (opponentText || "").toString().trim();
  // remove trailing "(1500)" rating if present
  return t.replace(/\s*\(\s*\d+(?:[.,]\d+)?\s*\)\s*$/, "").trim();
}

function resultToWLD(resultText) {
  const t = (resultText || "").toString().toLowerCase();
  if (t.includes("won")) return "W";
  if (t.includes("lost")) return "L";
  if (t.includes("draw")) return "D";
  return "";
}

function buildOpponentsStats(cards) {
  const map = new Map();

  for (const r of cards || []) {
    const oppName = normalizeOpponentName(r.opponent);
    if (!oppName) continue;

    const key = oppName;
    if (!map.has(key)) {
      map.set(key, { opponent: oppName, games: 0, win: 0, loss: 0, draw: 0, winrate: 0 });
    }

    const it = map.get(key);
    it.games += 1;

    const wld = resultToWLD(r.result);
    if (wld === "W") it.win += 1;
    else if (wld === "L") it.loss += 1;
    else if (wld === "D") it.draw += 1;
  }

  const list = Array.from(map.values()).map(it => {
    const wr = it.games ? (it.win / it.games) * 100 : 0;
    return { ...it, winrate: wr };
  });

  // sort: most games first, then highest winrate
  list.sort((a, b) => (b.games - a.games) || (b.winrate - a.winrate) || a.opponent.localeCompare(b.opponent, "cs"));
  return list;
}

function renderOpponentsTable(stats) {
  if (!stats.length) {
    return `<div class="bigError"><div class="icon">❌</div> Žádní soupeři nenalezeni.</div>`;
  }

  const head = `
    <thead>
      <tr>
        <th>Soupeř</th>
        <th class="num">Počet her</th>
        <th class="num">WIN</th>
        <th class="num">LOSS</th>
        <th class="num">DRAW</th>
        <th class="num">WINRATE</th>
      </tr>
    </thead>
  `;

  const body = stats.map(s => {
    const wr = Number.isFinite(s.winrate) ? `${s.winrate.toFixed(0)}%` : "—";
    return `
      <tr class="oppRow" data-opp="${escapeHtml(String(s.opponent||"").toLowerCase())}">
        <td>${escapeHtml(s.opponent)}</td>
        <td class="num">${s.games}</td>
        <td class="num">${s.win}</td>
        <td class="num">${s.loss}</td>
        <td class="num">${s.draw}</td>
        <td class="num">${wr}</td>
      </tr>
    `;
  }).join("");

  return `<div class="tblWrap"><table class="tbl">${head}<tbody>${body}</tbody></table></div>`;
}

export function openOpponentsModal({ playerName, cards, onBack }) {
  setModalHeaderMeta({ title: playerName || "Hráč", subtitle: "Protihráči" });

  setModalActions(`
    <button id="oppBackBtn" class="btnPrimary" type="button">← Zpět</button>
  `);

  // Back handler (delegated after DOM update)
  queueMicrotask(() => {
    const btn = document.getElementById("oppBackBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        if (typeof onBack === "function") onBack();
      });
    }
  });

  const stats = buildOpponentsStats(cards);

  setModalContent(`
    <div class="box boxPad">
      <div class="sectionTitle">Soupeři hráče: ${escapeHtml(playerName || "")}</div>
      <div class="oppSearchRow"><input id="oppSearchInput" type="text" placeholder="Hledat soupeře…" autocomplete="off" /></div>
      ${renderOpponentsTable(stats)}
    </div>
  `);

  // Vyhledávání soupeře
  queueMicrotask(() => {
    const input = document.getElementById("oppSearchInput");
    if (!input) return;
    input.addEventListener("input", () => {
      const q = (input.value || "").toLowerCase().trim();
      const rows = document.querySelectorAll(".oppRow");
      rows.forEach(r => {
        const name = (r.getAttribute("data-opp") || "");
        r.style.display = (!q || name.includes(q)) ? "" : "none";
      });
    });
  });
}
