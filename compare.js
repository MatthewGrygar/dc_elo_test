import { openModal, setModalContent, setModalHeaderMeta, setModalActions } from "./modal.js";

// Session-persistent selections (keeps choice when user closes and reopens compare)
let __selectedA = null;
let __selectedB = null;
let __searchA = "";
let __searchB = "";
let __view = "pick"; // pick | result
let __lockA = false; // when opened from player detail, player A is fixed

// Pick view (autocomplete) state
let __pickMounted = false;
let __pickInputA = "";
let __pickInputB = "";
let __pickOpenA = false;
let __pickOpenB = false;
let __debounceA = null;
let __debounceB = null;
let __lastQueryA = "";
let __lastQueryB = "";
let __cachedPlayers = null;
let __pickGlobalHandlersInstalled = false;

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

function fmtWinrate(p){
  const v = p?.winrate;
  if (typeof v === "string" && v.trim()) return v.trim();
  if (typeof v === "number" && Number.isFinite(v)) return `${Math.round(v)}%`;
  const g = toNumMaybe(p?.games);
  const w = toNumMaybe(p?.win);
  const d = toNumMaybe(p?.draw);
  const l = toNumMaybe(p?.loss);
  const games = (g ?? (w ?? 0) + (d ?? 0) + (l ?? 0));
  if (!games) return "—";
  if (w == null) return "—";
  return `${Math.round((w * 100) / games)}%`;
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

function normalizePairTo100(a, b){
  // Returns [aN, bN] normalized to 0..100 within the pair.
  // If both equal -> 50/50. If one missing -> missing 0, existing 100.
  const aV = toNumMaybe(a);
  const bV = toNumMaybe(b);
  if (aV == null && bV == null) return [50, 50];
  if (aV == null && bV != null) return [0, 100];
  if (bV == null && aV != null) return [100, 0];
  if (aV === bV) return [50, 50];
  const min = Math.min(aV, bV);
  const max = Math.max(aV, bV);
  const span = Math.max(1e-9, max - min);
  const aN = ((aV - min) * 100) / span;
  const bN = ((bV - min) * 100) / span;
  return [aN, bN];
}

function buildRadarChart({ metrics, nameA, nameB }){
  // metrics: array of { key, label, aVal, bVal, invert }
  const labels = metrics.map(m => m.label);
  const pairs = metrics.map(m => {
    let [aN, bN] = normalizePairTo100(m.aVal, m.bVal);
    if (m.invert){
      aN = 100 - aN;
      bN = 100 - bN;
    }
    // if both were 50/50, keep
    return [aN, bN];
  });

  const w = 420;
  const h = 380;
  const cx = w / 2;
  const cy = 170;
  const r = 140;
  const n = metrics.length;
  const angle0 = -Math.PI / 2;

  const pointAt = (i, value01) => {
    const ang = angle0 + (i * 2 * Math.PI) / n;
    const rr = r * value01;
    return [cx + rr * Math.cos(ang), cy + rr * Math.sin(ang)];
  };

  const polygonPath = (values) => {
    let d = "";
    for (let i = 0; i < n; i++){
      const v = Math.max(0, Math.min(1, (values[i] ?? 0) / 100));
      const [x, y] = pointAt(i, v);
      d += (i === 0 ? "M " : "L ") + x.toFixed(2) + " " + y.toFixed(2) + " ";
    }
    d += "Z";
    return d;
  };

  const valuesA = pairs.map(p => p[0]);
  const valuesB = pairs.map(p => p[1]);
  const pathA = polygonPath(valuesA);
  const pathB = polygonPath(valuesB);

  // grid rings
  const rings = [0.25, 0.5, 0.75, 1];
  const ringPaths = rings.map((k) => {
    let d = "";
    for (let i = 0; i < n; i++){
      const [x, y] = pointAt(i, k);
      d += (i === 0 ? "M " : "L ") + x.toFixed(2) + " " + y.toFixed(2) + " ";
    }
    d += "Z";
    return `<path d="${d}" class="radarGrid" />`;
  }).join("");

  const axes = Array.from({ length: n }).map((_, i) => {
    const [x, y] = pointAt(i, 1);
    return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(2)}" y2="${y.toFixed(2)}" class="radarAxis" />`;
  }).join("");

  const labelEls = labels.map((t, i) => {
    const [x, y] = pointAt(i, 1.14);
    const anchor = (x < cx - 10) ? "end" : (x > cx + 10 ? "start" : "middle");
    const dy = (y < cy - 90) ? "-2" : "12";
    return `<text x="${x.toFixed(2)}" y="${y.toFixed(2)}" text-anchor="${anchor}" dominant-baseline="middle" dy="${dy}" class="radarLabel">${escapeHtml(t)}</text>`;
  }).join("");

  const svg = `
    <svg class="radarSvg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Radar porovnání">
      <g>
        ${ringPaths}
        ${axes}
      </g>

      <path d="${pathB}" class="radarPoly radarB" />
      <path d="${pathA}" class="radarPoly radarA" />

      ${labelEls}
    </svg>
  `;

  const legend = `
    <div class="radarLegend">
      <div class="legendItem"><span class="dot dotGreen" aria-hidden="true"></span>${escapeHtml(nameA || "Hráč A")}</div>
      <div class="legendItem"><span class="dot dotRed" aria-hidden="true"></span>${escapeHtml(nameB || "Hráč B")}</div>
    </div>
  `;

  return `<div class="radarWrap">${svg}${legend}</div>`;
}

function getApi(){
  return window.__ELO_APP_DATA || null;
}

function getPlayers(){
  const api = getApi();
  const rows = api?.getAllRows ? api.getAllRows() : [];
  return Array.isArray(rows) ? rows : [];
}

function ensurePlayersCache(){
  if (__cachedPlayers) return __cachedPlayers;
  __cachedPlayers = getPlayers().slice();
  return __cachedPlayers;
}

function debounce(fn, ms, key){
  if (key === "A"){
    if (__debounceA) clearTimeout(__debounceA);
    __debounceA = setTimeout(fn, ms);
  } else {
    if (__debounceB) clearTimeout(__debounceB);
    __debounceB = setTimeout(fn, ms);
  }
}

function filterPlayers(query){
  const q = (query || "").toLowerCase().trim();
  if (q.length < 2) return [];
  const players = ensurePlayersCache();
  const out = [];
  for (const p of players){
    const name = (p.player || "").toLowerCase();
    if (name.includes(q)) out.push(p);
    if (out.length >= 10) break;
  }
  return out;
}

function renderDropdown(side, items){
  const dd = document.getElementById(side === "A" ? "compareDdA" : "compareDdB");
  if (!dd) return;
  if (!items.length){
    dd.innerHTML = `<div class="compareDdEmpty muted">Žádné shody.</div>`;
    return;
  }
  dd.innerHTML = items.map(p => {
    const isSel = (side === "A") ? (__selectedA?.slug === p.slug) : (__selectedB?.slug === p.slug);
    return `
      <button type="button" class="compareDdItem ${isSel ? "isSelected" : ""}" data-side="${side}" data-slug="${escapeHtml(p.slug)}">
        <span class="name">${escapeHtml(p.player)}</span>
        <span class="mini">ELO ${fmt(p.rating)}</span>
      </button>
    `;
  }).join("");
}

function setDropdownOpen(side, open){
  if (side === "A") __pickOpenA = !!open;
  if (side === "B") __pickOpenB = !!open;
  const wrap = document.getElementById(side === "A" ? "compareFieldA" : "compareFieldB");
  if (wrap) wrap.classList.toggle("ddOpen", !!open);
}

function syncConfirmBtn(){
  const btn = document.getElementById("compareConfirm");
  if (!btn) return;
  const ok = !!(__selectedA && __selectedB);
  btn.disabled = !ok;
}

function syncPickInputs(){
  const aInput = document.getElementById("compareInputA");
  const bInput = document.getElementById("compareInputB");
  if (aInput){
    aInput.value = __lockA && __selectedA ? (__selectedA.player || "") : (__pickInputA || "");
  }
  if (bInput){
    bInput.value = (__pickInputB || "");
  }
  const clrA = document.getElementById("compareClearA");
  const clrB = document.getElementById("compareClearB");
  if (clrA) clrA.style.display = (__lockA ? "none" : ((__pickInputA || "") ? "" : "none"));
  if (clrB) clrB.style.display = ((__pickInputB || "") ? "" : "none");
  syncConfirmBtn();
}

function mountPickView(){
  __pickMounted = true;
  setModalHeaderMeta({ title: "Porovnat hráče", subtitle: "Výběr" });
  setModalActions("");
  setModalContent(`
    <div class="compareWrap" id="comparePickRoot">
      <div class="compareIntro">
        <div class="muted">Porovnání hráčů umožňuje srovnat statistiky, vzájemné zápasy a průběh ELO dvou hráčů.</div>
      </div>

      <div class="compareAutoGrid">
        <div class="compareAutoField" id="compareFieldA">
          <div class="compareAutoHead">
            <div class="compareColTitle">Hráč A</div>
          </div>
          <div class="compareInputWrap">
            <input id="compareInputA" class="compareSearch" type="search" placeholder="Vyber hráče A" autocomplete="off" ${__lockA ? "disabled" : ""} />
            <button id="compareClearA" class="compareClear" type="button" aria-label="Vymazat hráče A">✕</button>
          </div>
          <div class="compareDd" id="compareDdA" role="listbox" aria-label="Návrhy hráče A"></div>
          ${(__lockA && __selectedA) ? `<div class="muted compareLockedNote">Hráč A je vybrán z profilu hráče.</div>` : ``}
        </div>

        <div class="compareAutoField" id="compareFieldB">
          <div class="compareAutoHead">
            <div class="compareColTitle">Hráč B</div>
          </div>
          <div class="compareInputWrap">
            <input id="compareInputB" class="compareSearch" type="search" placeholder="Vyber hráče B" autocomplete="off" />
            <button id="compareClearB" class="compareClear" type="button" aria-label="Vymazat hráče B">✕</button>
          </div>
          <div class="compareDd" id="compareDdB" role="listbox" aria-label="Návrhy hráče B"></div>
        </div>
      </div>

      <div class="compareBottom">
        <button id="compareConfirm" class="btnPrimary" type="button" disabled>Porovnat</button>
      </div>
    </div>
  `);

  queueMicrotask(() => {
    // prevent any accidental form submit inside modal
    const overlay = document.getElementById("modalOverlay");
    if (overlay && !overlay.__compareNoSubmit){
      overlay.__compareNoSubmit = true;
      overlay.addEventListener("submit", (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, true);
    }

    const root = document.getElementById("comparePickRoot");
    const inputA = document.getElementById("compareInputA");
    const inputB = document.getElementById("compareInputB");
    const clearA = document.getElementById("compareClearA");
    const clearB = document.getElementById("compareClearB");

    const closeAll = (exceptSide=null) => {
      if (exceptSide !== "A") setDropdownOpen("A", false);
      if (exceptSide !== "B") setDropdownOpen("B", false);
    };

    // Global handlers (install once): click outside + ESC closes dropdowns
    if (!__pickGlobalHandlersInstalled){
      __pickGlobalHandlersInstalled = true;
      document.addEventListener("click", (e) => {
        const r = document.getElementById("comparePickRoot");
        if (!r) return;
        if (!r.contains(e.target)){
          setDropdownOpen("A", false);
          setDropdownOpen("B", false);
        }
      }, { passive: true });
      window.addEventListener("keydown", (e) => {
        if (e.key !== "Escape") return;
        setDropdownOpen("A", false);
        setDropdownOpen("B", false);
      });
    }

    const handleKeyDown = (e) => {
      if (e.key === "Enter") e.preventDefault();
      if (e.key === "Escape") e.preventDefault();
    };

    if (inputA){
      inputA.addEventListener("keydown", handleKeyDown);
      inputA.addEventListener("focus", () => { if (!__lockA) setDropdownOpen("A", (__pickInputA || "").trim().length >= 2); });
      inputA.addEventListener("input", () => {
        if (__lockA) return;
        __pickInputA = inputA.value || "";
        __selectedA = null;
        syncPickInputs();
        const q = (__pickInputA || "").trim();
        if (q.length < 2){
          setDropdownOpen("A", false);
          __lastQueryA = q;
          return;
        }
        debounce(() => {
          if (__lastQueryA === q) return;
          __lastQueryA = q;
          const items = filterPlayers(q);
          renderDropdown("A", items);
          setDropdownOpen("A", true);
        }, 180, "A");
      });
    }

    if (inputB){
      inputB.addEventListener("keydown", handleKeyDown);
      inputB.addEventListener("focus", () => setDropdownOpen("B", (__pickInputB || "").trim().length >= 2));
      inputB.addEventListener("input", () => {
        __pickInputB = inputB.value || "";
        __selectedB = null;
        syncPickInputs();
        const q = (__pickInputB || "").trim();
        if (q.length < 2){
          setDropdownOpen("B", false);
          __lastQueryB = q;
          return;
        }
        debounce(() => {
          if (__lastQueryB === q) return;
          __lastQueryB = q;
          const items = filterPlayers(q);
          renderDropdown("B", items);
          setDropdownOpen("B", true);
        }, 180, "B");
      });
    }

    if (clearA){
      clearA.addEventListener("click", () => {
        if (__lockA) return;
        __pickInputA = "";
        __selectedA = null;
        setDropdownOpen("A", false);
        syncPickInputs();
        if (inputA) inputA.focus();
      });
    }
    if (clearB){
      clearB.addEventListener("click", () => {
        __pickInputB = "";
        __selectedB = null;
        setDropdownOpen("B", false);
        syncPickInputs();
        if (inputB) inputB.focus();
      });
    }

    // Dropdown click (event delegation)
    root.addEventListener("click", (e) => {
      const btn = e.target.closest(".compareDdItem");
      if (!btn) return;
      const side = btn.getAttribute("data-side");
      const slug = btn.getAttribute("data-slug");
      const p = ensurePlayersCache().find(x => x.slug === slug);
      if (!p) return;
      if (side === "A"){
        if (__lockA) return;
        __selectedA = p;
        __pickInputA = p.player || "";
        setDropdownOpen("A", false);
      } else {
        __selectedB = p;
        __pickInputB = p.player || "";
        setDropdownOpen("B", false);
      }
      syncPickInputs();
    });

    const confirm = document.getElementById("compareConfirm");
    if (confirm){
      confirm.addEventListener("click", async () => {
        if (!__selectedA || !__selectedB) return;
        __view = "result";
        await renderResultView();
      });
    }

    // Seed inputs based on session selections
    if (__lockA && __selectedA){
      __pickInputA = __selectedA.player || "";
    }
    if (__selectedB && !__pickInputB) __pickInputB = __selectedB.player || "";
    syncPickInputs();
  });
}

function renderPickView(){
  // Prepare cached players once to avoid repeated lookups
  ensurePlayersCache();
  __pickMounted = false;
  mountPickView();
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

  // Build metrics once (memoized per render) for panels + radar
  const metrics = [
    { key: "games", label: "GAMES", aShow: fmt(toNumMaybe(A.games)), bShow: fmt(toNumMaybe(B.games)), aVal: toNumMaybe(A.games), bVal: toNumMaybe(B.games), invert: false },
    { key: "winrate", label: "WINRATE", aShow: fmtWinrate(A), bShow: fmtWinrate(B), aVal: toNumMaybe(fmtWinrate(A)), bVal: toNumMaybe(fmtWinrate(B)), invert: false },
    { key: "win", label: "WIN", aShow: fmt(toNumMaybe(A.win)), bShow: fmt(toNumMaybe(B.win)), aVal: toNumMaybe(A.win), bVal: toNumMaybe(B.win), invert: false },
    { key: "loss", label: "LOSS", aShow: fmt(toNumMaybe(A.loss)), bShow: fmt(toNumMaybe(B.loss)), aVal: toNumMaybe(A.loss), bVal: toNumMaybe(B.loss), invert: true },
    { key: "draw", label: "DRAW", aShow: fmt(toNumMaybe(A.draw)), bShow: fmt(toNumMaybe(B.draw)), aVal: toNumMaybe(A.draw), bVal: toNumMaybe(B.draw), invert: false },
    { key: "peak", label: "PEAK ELO", aShow: fmt(toNumMaybe(A.peak)), bShow: fmt(toNumMaybe(B.peak)), aVal: toNumMaybe(A.peak), bVal: toNumMaybe(B.peak), invert: false },
    { key: "avgOpp", label: "AVERAGE OPPONENT RATING", aShow: fmt(safeNum(sumA?.avgOpp)), bShow: fmt(safeNum(sumB?.avgOpp)), aVal: safeNum(sumA?.avgOpp), bVal: safeNum(sumB?.avgOpp), invert: false },
    { key: "winStreak", label: "LONGEST WIN STREAK", aShow: fmt(safeNum(sumA?.winStreak)), bShow: fmt(safeNum(sumB?.winStreak)), aVal: safeNum(sumA?.winStreak), bVal: safeNum(sumB?.winStreak), invert: false },
    { key: "lossStreak", label: "LONGEST LOSS STREAK", aShow: fmt(safeNum(sumA?.lossStreak)), bShow: fmt(safeNum(sumB?.lossStreak)), aVal: safeNum(sumA?.lossStreak), bVal: safeNum(sumB?.lossStreak), invert: true },
  ];

  const panelRowsA = metrics.map(m => `
    <div class="duelRow">
      <div class="duelKey">${escapeHtml(m.label)}</div>
      <div class="duelVal">${escapeHtml(m.aShow)}</div>
    </div>
  `).join("");

  const panelRowsB = metrics.map(m => `
    <div class="duelRow">
      <div class="duelKey">${escapeHtml(m.label)}</div>
      <div class="duelVal">${escapeHtml(m.bShow)}</div>
    </div>
  `).join("");

  const radar = buildRadarChart({ metrics, nameA: A.player, nameB: B.player });

  const html = `
    <div class="compareWrap compareDashboard">
      <div class="duelHeader">
        <div class="duelSide duelLeft">
          <div class="duelName">${escapeHtml(A.player)}</div>
          <div class="duelElo">${fmt(toNumMaybe(A.rating))}</div>
        </div>

        <div class="duelCenter">
          <div class="duelVs">VS</div>
          <div class="duelScore">${aW} <span class="vs">vs</span> ${bW}</div>
          <div class="duelSub muted">Vzájemné zápasy: ${g}${d ? ` • Remízy: ${d}` : ""}</div>
        </div>

        <div class="duelSide duelRight">
          <div class="duelName">${escapeHtml(B.player)}</div>
          <div class="duelElo">${fmt(toNumMaybe(B.rating))}</div>
        </div>
      </div>

      <div class="duelMain">
        <div class="duelPanel duelPanelA">
          <div class="duelPanelTitle">STATISTIKY</div>
          ${panelRowsA}
        </div>

        <div class="duelRadarCard">
          <div class="duelPanelTitle">RADAR</div>
          ${radar}
        </div>

        <div class="duelPanel duelPanelB">
          <div class="duelPanelTitle">STATISTIKY</div>
          ${panelRowsB}
        </div>
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
