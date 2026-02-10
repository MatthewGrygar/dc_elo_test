import { openModal, setModalContent, setModalHeaderMeta, setModalActions } from "./modal.js";

// Session-persistent selections (keeps choice when user closes and reopens compare)
let __selectedA = null;
let __selectedB = null;
let __searchA = "";
let __searchB = "";
let __view = "pick"; // pick | result
let __lockA = false; // when opened from player detail, player A is fixed

function escapeHtml(str){
  return (str ?? "")
    .toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeOpponentName(opponentText){
  const t = (opponentText || "").toString().trim();
  return t.replace(/\s*\(\s*\d+(?:[.,]\d+)?\s*\)\s*$/, "").trim();
}

function resultToWLD(resultText){
  const t = (resultText || "").toString().toLowerCase();
  if (t.includes("won")) return "W";
  if (t.includes("lost")) return "L";
  if (t.includes("draw")) return "D";
  return "";
}

function safeNum(v){
  return Number.isFinite(v) ? v : null;
}

function fmt(v){
  if (!Number.isFinite(v)) return "—";
  return v.toFixed(0);
}

function toNumMaybe(v){
  if (v == null) return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = v.toString().trim();
  if (!s || s === "—") return null;
  // remove percent sign and spaces
  const n = Number(s.replace(/%/g, "").replace(/\s+/g, ""));
  return Number.isFinite(n) ? n : null;
}

function metricPreference(label){
  const key = (label || "").toString().trim().toLowerCase();
  // higher is better
  if (["games","win","peak elo","average opponent rating","longest win streak","draw"].includes(key)) return "higher";
  // lower is better
  if (["loss","longest loss streak"].includes(key)) return "lower";
  return "neutral";
}

function buildMetricRow(aVal, label, bVal, aRaw, bRaw){
  const pref = metricPreference(label);
  const aN = toNumMaybe(aRaw ?? aVal);
  const bN = toNumMaybe(bRaw ?? bVal);
  let betterA = false;
  let betterB = false;
  if (aN != null && bN != null && aN !== bN && pref !== "neutral"){
    if (pref === "higher"){
      betterA = aN > bN;
      betterB = bN > aN;
    } else if (pref === "lower"){
      betterA = aN < bN;
      betterB = bN < aN;
    }
  }

  return `
    <tr>
      <td class="num ${betterA ? "betterLeft" : ""}"><span class="compareVal ${betterA ? "better" : ""}">${escapeHtml(aVal)}</span></td>
      <td class="metricName">${escapeHtml(label)}</td>
      <td class="num ${betterB ? "betterRight" : ""}"><span class="compareVal ${betterB ? "better" : ""}">${escapeHtml(bVal)}</span></td>
    </tr>
  `;
}

function buildTwoSeriesChart(pointsA, pointsB, labelA, labelB){
  const cleanA = (pointsA || []).filter(p => Number.isFinite(p.matchId) && Number.isFinite(p.elo));
  const cleanB = (pointsB || []).filter(p => Number.isFinite(p.matchId) && Number.isFinite(p.elo));
  if (cleanA.length < 2 && cleanB.length < 2){
    return `<div class="muted">Graf nelze vykreslit (málo dat).</div>`;
  }

  // Shared equal spacing: union of Match IDs (same spirit as existing chart)
  const ids = Array.from(new Set([...cleanA.map(p=>p.matchId), ...cleanB.map(p=>p.matchId)])).sort((a,b)=>a-b);
  const idToXIndex = new Map(ids.map((id, i) => [id, i]));
  const w=980, h=300, padL=48, padR=18, padT=18, padB=46;

  const allY = [...cleanA.map(p=>p.elo), ...cleanB.map(p=>p.elo)];
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);
  const spanY = Math.max(1, maxY - minY);

  const X = (matchId) => {
    const i = idToXIndex.get(matchId);
    const span = Math.max(1, ids.length - 1);
    return padL + ((i ?? 0) * (w-padL-padR)) / span;
  };
  const Y = (v) => (h-padB) - ((v-minY)*(h-padT-padB))/spanY;

  const pathFor = (pts) => {
    const s = pts.slice().sort((a,b)=>a.matchId-b.matchId);
    let d="";
    for (let i=0;i<s.length;i++){
      const p = s[i];
      const x = X(p.matchId);
      const y = Y(p.elo);
      d += (i===0 ? "M " : "L ") + x.toFixed(2) + " " + y.toFixed(2) + " ";
    }
    return d;
  };

  const gridLines = 4;
  let grid = "";
  for (let i=0;i<=gridLines;i++){
    const y = padT + (i*(h-padT-padB))/gridLines;
    const v = (maxY - (i*spanY)/gridLines);
    grid += `<line x1="${padL}" y1="${y.toFixed(2)}" x2="${(w-padR)}" y2="${y.toFixed(2)}" stroke="currentColor" stroke-opacity="0.08" />`;
    grid += `<text x="${(padL-10)}" y="${(y+4).toFixed(2)}" text-anchor="end" font-size="12" fill="currentColor" opacity="0.6">${v.toFixed(0)}</text>`;
  }

  const dA = cleanA.length ? pathFor(cleanA) : "";
  const dB = cleanB.length ? pathFor(cleanB) : "";

  const svg = `
    <svg class="eloSvg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="ELO graf porovnání">
      ${grid}
      ${dA ? `<path d="${dA}" fill="none" stroke="#d24b4b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />` : ""}
      ${dB ? `<path d="${dB}" fill="none" stroke="#3aa46b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />` : ""}
    </svg>
  `;

  const legend = `
    <div class="compareLegend">
      <div class="legendItem"><span class="swatch swatchRed" aria-hidden="true"></span>${escapeHtml(labelA || "Hráč A")}</div>
      <div class="legendItem"><span class="swatch swatchGreen" aria-hidden="true"></span>${escapeHtml(labelB || "Hráč B")}</div>
    </div>
  `;

  return `<div class="compareChart">${svg}${legend}</div>`;
}

function getApi(){
  return window.__ELO_APP_DATA || null;
}

function getPlayers(){
  const api = getApi();
  const rows = api?.getAllRows ? api.getAllRows() : [];
  return Array.isArray(rows) ? rows : [];
}

function renderPickView(){
  const players = getPlayers();
  const qA = (__searchA || "").toLowerCase().trim();
  const qB = (__searchB || "").toLowerCase().trim();
  const filteredA = !qA ? players : players.filter(p => (p.player || "").toLowerCase().includes(qA));
  const filteredB = !qB ? players : players.filter(p => (p.player || "").toLowerCase().includes(qB));

  const item = (p, side) => {
    const isSel = (side === "A") ? (__selectedA?.slug === p.slug) : (__selectedB?.slug === p.slug);
    return `
      <button class="comparePickItem ${isSel ? "isSelected" : ""}" type="button" data-side="${side}" data-slug="${escapeHtml(p.slug)}">
        <span class="name">${escapeHtml(p.player)}</span>
        <span class="mini">ELO ${fmt(p.rating)}</span>
      </button>
    `;
  };

  const left = (__lockA && __selectedA)
    ? `
      <div class="compareLocked">
        <div class="compareLockedLine"><span class="name">${escapeHtml(__selectedA.player)}</span><span class="mini">ELO ${fmt(__selectedA.rating)}</span></div>
        <div class="muted">Hráč A je vybrán z profilu hráče.</div>
      </div>
    `
    : (filteredA.map(p => item(p, "A")).join(""));
  const right = filteredB.map(p => item(p, "B")).join("");

  const canConfirm = !!(__selectedA && __selectedB);
  const html = `
    <div class="compareWrap">
      <div class="comparePick">
        <div class="comparePanel">
          <div class="comparePanelHead">
            <div class="compareColTitle">Hráč A</div>
            ${(__lockA && __selectedA)
              ? `<input id="compareSearchA" class="compareSearch" type="search" placeholder="Hledat hráče vlevo…" autocomplete="off" value="${escapeHtml(__searchA)}" disabled />`
              : `<input id="compareSearchA" class="compareSearch" type="search" placeholder="Hledat hráče vlevo…" autocomplete="off" value="${escapeHtml(__searchA)}" />`
            }
          </div>
          <div class="compareList" id="compareListA">${left || `<div class="muted">Nic nenalezeno.</div>`}</div>
        </div>

        <div class="comparePanel">
          <div class="comparePanelHead">
            <div class="compareColTitle">Hráč B</div>
            <input id="compareSearchB" class="compareSearch" type="search" placeholder="Hledat hráče vpravo…" autocomplete="off" value="${escapeHtml(__searchB)}" />
          </div>
          <div class="compareList" id="compareListB">${right || `<div class="muted">Nic nenalezeno.</div>`}</div>
        </div>
      </div>

      <div class="compareBottom">
        <button id="compareConfirm" class="btnPrimary" type="button" ${canConfirm ? "" : "disabled"}>Porovnat</button>
      </div>
    </div>
  `;

  setModalHeaderMeta({ title: "Porovnat hráče", subtitle: "Výběr" });
  setModalActions("");
  setModalContent(html);

  queueMicrotask(() => {
    // Safety: prevent any accidental form submit inside modal (can cause full page reload)
    const overlay = document.getElementById("modalOverlay");
    if (overlay && !overlay.__compareNoSubmit){
      overlay.__compareNoSubmit = true;
      overlay.addEventListener("submit", (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, true);
    }

    const inputA = document.getElementById("compareSearchA");
    if (inputA){
      inputA.addEventListener("keydown", (e) => {
        // Prevent any accidental form submit / page reload on Enter
        if (e.key === "Enter") e.preventDefault();
      });
      inputA.addEventListener("input", () => {
        __searchA = inputA.value || "";
        renderPickView();
      });
    }

    const inputB = document.getElementById("compareSearchB");
    if (inputB){
      inputB.addEventListener("keydown", (e) => {
        if (e.key === "Enter") e.preventDefault();
      });
      inputB.addEventListener("input", () => {
        __searchB = inputB.value || "";
        renderPickView();
      });
    }

    // Only allow changing player A when not locked
    document.querySelectorAll(".comparePickItem").forEach(btn => {
      btn.addEventListener("click", () => {
        const side = btn.getAttribute("data-side");
        if (side === "A" && __lockA) return;
        const slug = btn.getAttribute("data-slug");
        const p = getPlayers().find(x => x.slug === slug);
        if (!p) return;
        if (side === "A") __selectedA = p;
        if (side === "B") __selectedB = p;
        renderPickView();
      });
    });

    const confirm = document.getElementById("compareConfirm");
    if (confirm){
      confirm.addEventListener("click", async () => {
        if (!__selectedA || !__selectedB) return;
        __view = "result";
        await renderResultView();
      });
    }
  });
}

async function renderResultView(){
  const api = getApi();
  if (!api){
    setModalContent(`<div class="bigError"><div class="icon">❌</div> Nelze načíst data aplikace.</div>`);
    return;
  }
  const A = __selectedA;
  const B = __selectedB;
  if (!A || !B){
    __view = "pick";
    renderPickView();
    return;
  }

  setModalHeaderMeta({ title: "Porovnat hráče", subtitle: "Porovnání" });
  setModalActions(`<button id="compareChange" class="btnPrimary" type="button">Změnit výběr</button>`);

  const cards = await api.loadPlayerCards();
  const aCards = cards.filter(c => (c.player || "").trim() === (A.player || "").trim());

  const bName = (B.player || "").trim();
  let aW=0, bW=0, d=0, g=0;
  for (const r of aCards){
    const opp = normalizeOpponentName(r.opponent);
    if (opp !== bName) continue;
    g += 1;
    const wld = resultToWLD(r.result);
    if (wld === "W") aW += 1;
    else if (wld === "L") bW += 1;
    else if (wld === "D") d += 1;
  }

  const sumA = await api.getSummaryForPlayer(A.player);
  const sumB = await api.getSummaryForPlayer(B.player);

  const metricsHtml = `
    <div class="compareMetrics">
      <table class="tbl compareTbl">
        <tbody>
          ${buildMetricRow(fmt(A.games), "games", fmt(B.games), A.games, B.games)}
          ${buildMetricRow(fmt(A.win), "WIN", fmt(B.win), A.win, B.win)}
          ${buildMetricRow(fmt(A.loss), "LOSS", fmt(B.loss), A.loss, B.loss)}
          ${buildMetricRow(fmt(A.draw), "DRAW", fmt(B.draw), A.draw, B.draw)}
          ${buildMetricRow(fmt(A.peak), "peak elo", fmt(B.peak), A.peak, B.peak)}
          ${buildMetricRow(fmt(safeNum(sumA?.avgOpp)), "average opponent rating", fmt(safeNum(sumB?.avgOpp)), safeNum(sumA?.avgOpp), safeNum(sumB?.avgOpp))}
          ${buildMetricRow(fmt(safeNum(sumA?.winStreak)), "longest win streak", fmt(safeNum(sumB?.winStreak)), safeNum(sumA?.winStreak), safeNum(sumB?.winStreak))}
          ${buildMetricRow(fmt(safeNum(sumA?.lossStreak)), "longest loss streak", fmt(safeNum(sumB?.lossStreak)), safeNum(sumA?.lossStreak), safeNum(sumB?.lossStreak))}
        </tbody>
      </table>
    </div>
  `;

  const aPoints = aCards
    .slice()
    .sort((x,y)=>(x.matchId||0)-(y.matchId||0))
    .filter(r => Number.isFinite(r.matchId) && Number.isFinite(r.elo))
    .map(r => ({ matchId:r.matchId, elo:r.elo }));
  const bCards = cards.filter(c => (c.player || "").trim() === (B.player || "").trim());
  const bPoints = bCards
    .slice()
    .sort((x,y)=>(x.matchId||0)-(y.matchId||0))
    .filter(r => Number.isFinite(r.matchId) && Number.isFinite(r.elo))
    .map(r => ({ matchId:r.matchId, elo:r.elo }));

  const html = `
    <div class="compareWrap">
      <div class="compareHero">
        <div class="compareHeroRow">
          <div class="compareHeroCard left">
            <div class="heroName">${escapeHtml(A.player)}</div>
            <div class="heroElo"><span class="label">ELO</span><span class="val">${fmt(A.rating)}</span></div>
          </div>

          <div class="compareVs">VS</div>

          <div class="compareHeroCard right">
            <div class="heroName">${escapeHtml(B.player)}</div>
            <div class="heroElo"><span class="label">ELO</span><span class="val">${fmt(B.rating)}</span></div>
          </div>
        </div>

        <div class="compareH2H">
          <div class="h2hBig">
            <div class="h2hVal">${aW}</div>
            <div class="h2hMid">vs</div>
            <div class="h2hVal">${bW}</div>
          </div>
          <div class="h2hSub muted">Vzájemné zápasy: ${g}${d ? ` • Remízy: ${d}` : ""}</div>
        </div>
      </div>

      ${metricsHtml}

      <div class="compareChartCard">
        <div class="compareSectionTitle">Průběh ELO</div>
        ${buildTwoSeriesChart(aPoints, bPoints, A.player, B.player)}
      </div>
    </div>
  `;

  setModalContent(html);

  queueMicrotask(() => {
    const btn = document.getElementById("compareChange");
    if (btn){
      btn.addEventListener("click", () => {
        __view = "pick";
        renderPickView();
      });
    }
  });
}

export function openComparePlayers(opts = {}){
  // By default (opened from menu) player A is NOT locked.
  // When opened from player detail, caller passes { lockA: true }.
  if (!opts || opts.lockA !== true){
    __lockA = false;
  }
  // open fullscreen overlay (like other sections)
  // Use the same modal width/styling as other sections (Aktuality / detail hráče)
  openModal({ title: "Porovnat hráče", subtitle: "Výběr", html: `<div class="muted">Načítám…</div>`, fullscreen: false });
  if (__view === "result" && __selectedA && __selectedB){
    renderResultView();
  } else {
    __view = "pick";
    renderPickView();
  }
}

// Open compare with optional preselected player A (from player detail)
export function openComparePlayersWithA(playerSlugOrName){
  const players = getPlayers();
  const found = players.find(p => p.slug === playerSlugOrName) || players.find(p => (p.player || "").trim() === (playerSlugOrName || "").toString().trim());
  if (found){
    __selectedA = found;
    __lockA = true;
    // When preselecting A from profile, reset view to pick but keep any existing B
    __view = "pick";
  }
  openComparePlayers({ lockA: true });
}
