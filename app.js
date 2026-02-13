import { openModal, setModalActions, setModalContent, setModalHeaderMeta, closeModal, setModalOnCloseRequest } from "./modal.js";
import { openOpponentsModal } from "./opponents.js";
import { t, onLangChange } from "./i18n.js";

const SHEET_ID = "1y98bzsIRpVv0_cGNfbITapucO5A6izeEz5lTM92ZbIA";
const ELO_SHEET_NAME = "Elo standings";
const TOURNAMENT_ELO_SHEET_NAME = "Tournament_Elo";
const DATA_SHEET_NAME = "Data";
const PLAYER_CARDS_SHEET_NAME = "Player cards (CSV)";
const PLAYER_SUMMARY_SHEET_NAME = "Player summary";

const ELO_CSV_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(ELO_SHEET_NAME)}`;
const TOURNAMENT_ELO_CSV_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(TOURNAMENT_ELO_SHEET_NAME)}`;
const DATA_CSV_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(DATA_SHEET_NAME)}`;
const PLAYER_CARDS_CSV_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(PLAYER_CARDS_SHEET_NAME)}`;
const PLAYER_SUMMARY_CSV_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(PLAYER_SUMMARY_SHEET_NAME)}`;

function buildCsvUrlForSheet(sheetName){
  // Build a fresh URL for the requested sheet.
  // This prevents any chance of accidentally reusing the wrong sheet URL.
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

const tbody = document.getElementById("tbody");
const searchEl = document.getElementById("search");
const ratedOnlyEl = document.getElementById("ratedOnly");
const refreshBtn = document.getElementById("refresh");

const avgEloEl = document.getElementById("avgElo");
const avgWinrateEl = document.getElementById("avgWinrate");
const totalGamesEl = document.getElementById("totalGames");
const uniquePlayersEl = document.getElementById("uniquePlayers");
const lastTournamentEl = document.getElementById("lastTournament");
const requestUploadBtn = document.getElementById("requestUploadBtn");
const newsBtn = document.getElementById("newsBtn");

const logoImg = document.getElementById("logoImg");
const htmlEl = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const themeLabel = document.getElementById("themeLabel");

let allRows = [];
let lastTournamentText = "";
let playerCardsCache = null;
let playerSummaryCache = null;

// Prevent race conditions when switching sources (e.g., toggling "Pouze DCPR").
// Only the latest loadStandings() call is allowed to update UI/state.
let standingsLoadSeq = 0;

// Standings caches (prefetched on page load to avoid table "jump" when switching modes)
let standingsCache = {
  vtMap: null,
  eloRows: null,   // from "Elo standings"
  dcprRows: null   // from "Tournament Elo"
};

function getCachedRows(dcprMode){
  return dcprMode ? standingsCache.dcprRows : standingsCache.eloRows;
}

// Ensure every standings row has a stable slug and the global slugToPlayer map is up to date.
function ensureSlugsAndRouting(){
  const elo = Array.isArray(standingsCache.eloRows) ? standingsCache.eloRows : [];
  const dcpr = Array.isArray(standingsCache.dcprRows) ? standingsCache.dcprRows : [];

  // Prefer Elo standings order as the canonical ordering for slug disambiguation.
  // This keeps deep links stable when switching between ELO and DCPR modes.
  const canonicalNames = elo.length
    ? elo.map(r => r.player)
    : dcpr.map(r => r.player);

  const slugs = buildDeterministicSlugs(canonicalNames);
  const nameToSlug = new Map();
  canonicalNames.forEach((name, i) => {
    nameToSlug.set(normalizeKey(name), slugs[i]);
  });

  function apply(rows){
    for (const r of rows){
      const k = normalizeKey(r.player);
      if (!r.slug){
        const s = nameToSlug.get(k);
        if (s) r.slug = s;
      }
      // In case a player appears only in one dataset, generate + memoize.
      if (!r.slug){
        const s = baseSlugFromName(r.player);
        let final = s;
        let n = 2;
        while ([...nameToSlug.values()].includes(final)){
          final = `${s}-${n++}`;
        }
        r.slug = final;
        nameToSlug.set(k, final);
      }
    }
  }

  apply(elo);
  apply(dcpr);

  // Keep routing map in sync with whatever is currently rendered
  slugToPlayer = new Map((allRows || []).map(p => [p.slug, p]));
}

function switchStandingsMode(dcprMode){
  const cached = getCachedRows(!!dcprMode);
  if (cached && Array.isArray(cached) && cached.length){
    allRows = cached;
    ensureSlugsAndRouting();
    updateInfoBar();
    renderStandings(allRows);
    // If there is a deep link pending, apply it now that slug map is ready.
    if (pendingSlugToOpen) applyRoute();
    return;
  }
  // Fallback (should be rare): fetch if cache missing
  loadStandings(!!dcprMode);
}



// Rating Class (VT1–VT4) is now ALWAYS sourced from: Tournament Elo → column I.
let vtByPlayerCache = null;

async function loadVtByPlayer(){
  if (vtByPlayerCache) return vtByPlayerCache;
  try{
    const u = new URL(buildCsvUrlForSheet(TOURNAMENT_ELO_SHEET_NAME));
    u.searchParams.set("_", Date.now().toString());
    console.log("[ELO] Fetch Tournament Elo (VT map) CSV:", u.toString());
    const { res, text } = await fetchUtf8Text(u.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (text.trim().startsWith("<")) throw new Error("Místo CSV přišlo HTML.");

    const rows = parseCSV(text);
    // Tournament Elo mapping:
    // PLAYER -> column A (0)
    // Rating Class -> column I (8)
    const map = new Map();
    for (let i = 1; i < rows.length; i++){
      const player = (rows[i][0] ?? "").toString().trim();
      if (!player) continue;
      const vt = normalizeVT(rows[i][8]);
      map.set(normalizeKey(player), vt);
    }
    vtByPlayerCache = map;
    return map;
  } catch (e){
    console.warn("[ELO] Failed to load Tournament Elo VT map:", e);
    vtByPlayerCache = new Map();
    return vtByPlayerCache;
  }
}

// -------------------- SLUG ROUTING + VT --------------------
let slugToPlayer = new Map();
let pendingSlugToOpen = null;

function getBasePath(){
  // GitHub Pages project site base: /<repo>/
  const parts = window.location.pathname.split("/").filter(Boolean);
  // If served from root (local dev), parts[0] may be undefined
  return parts.length ? `/${parts[0]}/` : "/";
}

function stripDiacritics(s){
  return (s || "").toString().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function baseSlugFromName(playerName){
  const name = (playerName || "").toString().trim();
  if (!name) return "";
  const parts = name.split(/\s+/).filter(Boolean);
  const first = parts[0] || "";
  const last = parts[parts.length - 1] || "";
  const joined = `${first}_${last}`;
  const cleaned = stripDiacritics(joined)
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  return cleaned;
}

function buildDeterministicSlugs(playerNamesInDataOrder){
  const counts = new Map();
  const out = [];
  for (const name of playerNamesInDataOrder){
    const base = baseSlugFromName(name);
    const next = (counts.get(base) || 0) + 1;
    counts.set(base, next);
    out.push(next === 1 ? base : `${base}_${next}`);
  }
  return out;
}

function normalizeVT(v){
  const s = (v ?? "").toString().trim();
  if (!s) return null;
  const u = s.toUpperCase();
  if (u === "UNRANKED") return null;
  if (/^VT[1-4]$/.test(u)) return u;
  return null;
}

function vtToClass(vt){
  // Map VT1–VT4 to consistent class tokens used in CSS
  if (!vt) return "";
  if (vt === "VT1") return "classA";
  if (vt === "VT2") return "classB";
  if (vt === "VT3") return "classC";
  if (vt === "VT4") return "classD";
  return "";
}

function vtToBadgeText(vt){
  if (!vt) return "";
  if (vt === "VT1") return "Class A";
  if (vt === "VT2") return "Class B";
  if (vt === "VT3") return "Class C";
  if (vt === "VT4") return "Class D";
  return "";
}

function vtBadgeHtml(vt){
  if (!vt) return "";
  const txt = vtToBadgeText(vt);
  return `<span class="vtBadge ${vtToClass(vt)}" aria-label="${escapeHtml(txt)}">${escapeHtml(txt)}</span>`;
}

function vtDetailText(vt){
  // Text under player name (profile)
  if (!vt) return "";
  const t = vtToBadgeText(vt);
  return t ? `Rating ${t}` : "";
}


function getSlugFromLocation(){
  const base = getBasePath();
  const path = window.location.pathname;
  if (!path.startsWith(base)) return null;
  const rest = path.slice(base.length).replace(/^\/+|\/+$/g, "");
  if (!rest) return null;
  // Ignore real files like kontakt.html
  if (rest.includes(".")) return null;
  // Only first segment
  return rest.split("/")[0];
}

let __closeModalRaw = closeModal;
function openPlayerModal(playerObj){
  openModal({ title: playerObj.player, subtitle: t("player_detail"), html: `<div class="muted">${t("loading")}</div>` });
  loadPlayerDetail(playerObj);
}

function navigateToPlayer(playerObj){
  const slug = playerObj?.slug;
  if (!slug) return;
  const url = getBasePath() + slug;
  history.pushState({ __playerSlug: slug }, "", url);
  openPlayerModal(playerObj);
}

function normalizeSpaRedirectIfPresent(){
  const params = new URLSearchParams(window.location.search);
  const r = params.get("r") || params.get("redirect");
  if (!r) return;
  const base = getBasePath();
  const clean = r.toString().replace(/^\/+/, "").replace(/\/+$/, "");
  history.replaceState(history.state || {}, "", base + clean);
}

function applyRoute(){
  // Do not interfere with mobile "page" history in common.js
  if (history.state && history.state.__mobilePage) return;

  const slug = getSlugFromLocation();
  if (!slug){
    try{ __closeModalRaw?.(); }catch(e){}
    return;
  }

  if (!slugToPlayer.size){
    pendingSlugToOpen = slug;
    return;
  }

  const playerObj = slugToPlayer.get(slug);
  if (!playerObj){
    try{ __closeModalRaw?.(); }catch(e){}
    return;
  }

  openPlayerModal(playerObj);
}



function closePlayerDetailAndRoute(){
  const slug = getSlugFromLocation();
  // Close modal UI immediately
  try{ closeModal(); }catch(e){}
  if (!slug) return;

  // If we got here via in-app navigation (pushState with __playerSlug), go back to list so forward returns detail.
  if (history.state && history.state.__playerSlug){
    try{ history.back(); }catch(e){}
    return;
  }

  // Direct entry to /<slug> (or unknown history state): keep user in app and reset URL to list.
  try{
    history.pushState({}, "", getBasePath());
  }catch(e){}
}

// posledně otevřený detail hráče (pro Protihráče / návrat)
let currentPlayerDetail = null;

function escapeHtml(str){
  return (str ?? "").toString()
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
function normalizeKey(s){
  return (s || "").toString().trim().toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu,"");
}

function isNarrowMobile(){
  // used for mobile-specific truncations / layout (phones)
  return window.matchMedia && window.matchMedia("(max-width: 560px)").matches;
}

function shortenPlayerNameForMobile(name){
  const s = (name || "").toString().trim();
  if (!s) return "";
  if (!isNarrowMobile()) return s;
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length <= 2) return s;
  return parts[0] + " " + parts[parts.length - 1];
}

function toNumber(x){
  if (x == null) return NaN;
  const s = x.toString().replace(/\s/g,"").replace(",",".");
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}
function safeInt(x){ return Number.isFinite(x) ? x.toFixed(0) : ""; }

function formatNow(){
  return new Intl.DateTimeFormat("cs-CZ", {
    year:"numeric", month:"2-digit", day:"2-digit",
    hour:"2-digit", minute:"2-digit", second:"2-digit"
  }).format(new Date());
}

async function fetchUtf8Text(url){
  const res = await fetch(url, { cache: "no-store" });
  const buf = await res.arrayBuffer();
  const text = new TextDecoder("utf-8").decode(buf);
  return { res, text };
}

function parseCSV(csvText){
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;

  for (let i=0;i<csvText.length;i++){
    const c = csvText[i];
    const next = csvText[i+1];
    if (c === '"' && inQuotes && next === '"'){ cur += '"'; i++; }
    else if (c === '"'){ inQuotes = !inQuotes; }
    else if (c === "," && !inQuotes){ row.push(cur); cur=""; }
    else if ((c === "\n" || c === "\r") && !inQuotes){
      if (c === "\r" && next === "\n") i++;
      row.push(cur); cur="";
      if (row.some(x => x.trim() !== "")) rows.push(row);
      row = [];
    } else cur += c;
  }
  if (cur.length || row.length){
    row.push(cur);
    if (row.some(x => x.trim() !== "")) rows.push(row);
  }
  return rows;
}


async function getPlayerStandingFromSheet(sheetName, dcprMode, playerName){
  const u = new URL(buildCsvUrlForSheet(sheetName));
  u.searchParams.set("_", Date.now().toString());
  const { res, text } = await fetchUtf8Text(u.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (text.trim().startsWith("<")) throw new Error("Místo CSV přišlo HTML.");

  const rows = parseCSV(text);
  const vtMap = await loadVtByPlayer();

  const mapped = rows.slice(1).map((r, idx) => {
    const player = (r[0] ?? "").toString().trim();
    if (!player) return null;

    if (dcprMode){
      return {
        _dataIndex: idx,
        player,
        rating: toNumber(r[1]),
        games: toNumber(r[2]),
        win: toNumber(r[3]),
        loss: toNumber(r[4]),
        draw: toNumber(r[5]),
        winrate: (r[6] ?? "").toString().trim(),
        peak: toNumber(r[7]),
        vt: normalizeVT(r[8])
      };
    }

    return {
      _dataIndex: idx,
      player,
      rating: toNumber(r[1]),
      games: toNumber(r[2]),
      win: toNumber(r[3]),
      loss: toNumber(r[4]),
      draw: toNumber(r[5]),
      winrate: (r[6] ?? "").toString().trim(),
      peak: toNumber(r[7]),
      vt: vtMap.get(normalizeKey(player)) ?? null
    };
  }).filter(Boolean);

  const keyWanted = normalizeKey(playerName);

  // Rank rules:
  // - DCPR (Tournament_Elo): rank follows the row order (row 2 => rank 1)
  // - ELO (Elo standings): rank by rating DESC, stable by player name
  let ranked = [];
  if (dcprMode){
    ranked = mapped.map((o, i) => ({ ...o, rank: i + 1 }));
  } else {
    ranked = mapped.slice().sort((a,b) => {
      const ra = Number.isFinite(a.rating) ? a.rating : -Infinity;
      const rb = Number.isFinite(b.rating) ? b.rating : -Infinity;
      if (rb !== ra) return rb - ra;
      return a.player.localeCompare(b.player);
    }).map((o, i) => ({ ...o, rank: i + 1 }));
  }

  return ranked.find(o => normalizeKey(o.player) === keyWanted) || null;
}

function heroMiniStatsHtml(obj){
  if (!obj){
    return `
      <div class="heroMiniStat heroMiniStatWin"><b>win</b><span>—</span></div>
      <div class="heroMiniStat heroMiniStatLoss"><b>loss</b><span>—</span></div>
      <div class="heroMiniStat heroMiniStatDraw"><b>draw</b><span>—</span></div>
      <div class="heroMiniStat"><b>games</b><span>—</span></div>
      <div class="heroMiniStat"><b>winrate</b><span>—</span></div>
      <div class="heroMiniStat"><b>peak</b><span>—</span></div>
    `;
  }
  return `
    <div class="heroMiniStat heroMiniStatWin"><b>win</b><span>${safeInt(obj.win)}</span></div>
    <div class="heroMiniStat heroMiniStatLoss"><b>loss</b><span>${safeInt(obj.loss)}</span></div>
    <div class="heroMiniStat heroMiniStatDraw"><b>draw</b><span>${safeInt(obj.draw)}</span></div>
    <div class="heroMiniStat"><b>games</b><span>${safeInt(obj.games)}</span></div>
    <div class="heroMiniStat"><b>winrate</b><span>${escapeHtml(obj.winrate || "—")}</span></div>
    <div class="heroMiniStat"><b>peak</b><span>${Number.isFinite(obj.peak) ? obj.peak.toFixed(0) : "—"}</span></div>
  `;
}


function rankBadgeHtml(rank){
  if (!Number.isFinite(rank)) return "";
  const r = Math.max(1, Math.floor(rank));
  let cls = "";
  if (r === 1) cls = " rank1";
  else if (r === 2) cls = " rank2";
  else if (r === 3) cls = " rank3";
  return `<span class="rankBadge${cls}">#${r}</span>`;
}


function rankCellHtml(rank){
  if (rank === 1) return `<span class="r1">👑 ${rank}</span>`;
  if (rank === 2) return `<span class="r2">${rank}</span>`;
  if (rank === 3) return `<span class="r3">${rank}</span>`;
  return `${rank}`;
}

function parseWinrateToNumber(winrateText){
  if (!winrateText) return NaN;
  const s = winrateText.toString().trim();
  if (!s) return NaN;
  if (s.includes("%")) return toNumber(s.replace("%",""));
  const n = toNumber(s);
  if (!Number.isFinite(n)) return NaN;
  if (n > 0 && n <= 1) return n * 100;
  return n;
}

function updateInfoBar(){
  const ratings = allRows.map(r => r.rating).filter(Number.isFinite).sort((a,b)=>a-b);
  const gamesArr = allRows.map(r => r.games).filter(Number.isFinite);
  const winrates = allRows.map(r => parseWinrateToNumber(r.winrate)).filter(Number.isFinite);

  let medianElo = NaN;
  if (ratings.length){
    const mid = Math.floor(ratings.length/2);
    medianElo = (ratings.length % 2) ? ratings[mid] : (ratings[mid-1]+ratings[mid])/2;
  }
  const totalGamesRaw = gamesArr.length ? gamesArr.reduce((a,b)=>a+b,0) : NaN;
  const totalGames = Number.isFinite(totalGamesRaw) ? (totalGamesRaw/2) : NaN;
  const avgWinrate = winrates.length ? (winrates.reduce((a,b)=>a+b,0)/winrates.length) : NaN;

  avgEloEl.textContent = Number.isFinite(medianElo) ? medianElo.toFixed(0) : "—";
  totalGamesEl.textContent = Number.isFinite(totalGames) ? totalGames.toFixed(0) : "—";
  if (avgWinrateEl) avgWinrateEl.textContent = Number.isFinite(avgWinrate) ? `${avgWinrate.toFixed(0)}%` : "—";
  lastTournamentEl.textContent = lastTournamentText || "—";
}

async function loadLastData(){
  try{
    const u = new URL(DATA_CSV_URL);
    u.searchParams.set("_", Date.now().toString());
    console.log("[ELO] Fetch last tournament CSV:", u.toString());
    const { res, text } = await fetchUtf8Text(u.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (text.trim().startsWith("<")) throw new Error("HTML místo CSV");

    const rows = parseCSV(text);
    let last = "";
    for (let i=1;i<rows.length;i++){
      const v = (rows[i][1] ?? "").toString().trim();
      if (v) last = v;
    }
    lastTournamentText = last || "";
    updateInfoBar();
  } catch {
    console.warn("[ELO] Failed to load last tournament info (Data sheet)");
    lastTournamentText = "";
    updateInfoBar();
  }
}

function renderStandings(rows){
  const q = normalizeKey(searchEl.value);
  const dcprMode = !!(ratedOnlyEl && ratedOnlyEl.checked);
  const filtered = rows
    .filter(r => !q || normalizeKey(r.player).includes(q))
    .sort((a,b)=>a.rank-b.rank);

  // "Unikátní hráči" = počet řádků aktuálně zobrazených v tabulce
  if (uniquePlayersEl){
    uniquePlayersEl.textContent = filtered.length.toString();
  }

  tbody.innerHTML = "";
  if (!filtered.length){
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="9" class="muted">Nic nenalezeno.</td>`;
    tbody.appendChild(tr);
    return;
  }

  for (let i = 0; i < filtered.length; i++){
    const r = filtered[i];
    // Rank is always the stored rank. For DCPR mode, rank follows the row order in the Tournament Elo sheet.
    const displayRank = r.rank;
    const peakText = Number.isFinite(r.peak) ? r.peak.toFixed(0) : "";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="rank colRank">${rankCellHtml(displayRank)}</td>
      <td class="playerCol"><span class="nameWrap"><button class="playerBtn" type="button">${escapeHtml(shortenPlayerNameForMobile(r.player))}</button>${vtBadgeHtml(r.vt)}</span></td>
      <td class="num ratingCol">${Number.isFinite(r.rating) ? r.rating.toFixed(0) : ""}</td>
      <td class="num colPeak">${peakText}</td>
      <td class="num colGames">${safeInt(r.games)}</td>
      <td class="num colWin">${safeInt(r.win)}</td>
      <td class="num colLoss">${safeInt(r.loss)}</td>
      <td class="num colDraw">${safeInt(r.draw)}</td>
      <td class="num colWinrate">${escapeHtml(r.winrate || "")}</td>
    `;
    tr.querySelector(".playerBtn")._playerObj = r;
    tbody.appendChild(tr);
  }
}


async function fetchStandingsRows(dcprMode, vtMap){
  const sheetName = dcprMode ? TOURNAMENT_ELO_SHEET_NAME : ELO_SHEET_NAME;
  const u = new URL(buildCsvUrlForSheet(sheetName));
  u.searchParams.set("_", Date.now().toString());
  const { res, text } = await fetchUtf8Text(u.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (text.trim().startsWith("<")) throw new Error("Místo CSV přišlo HTML.");
  const rows = parseCSV(text);

  const loadedInDataOrder = rows.slice(1).map((r, idx) => {
    const player = (r[0] ?? "").toString().trim();
    if (!player) return null;

    if (dcprMode){
      return {
        _dataIndex: idx,
        player,
        rating: toNumber(r[1]),
        games: toNumber(r[2]),
        win: toNumber(r[3]),
        loss: toNumber(r[4]),
        draw: toNumber(r[5]),
        winrate: (r[6] ?? "").toString().trim(),
        peak: toNumber(r[7]),
        vt: normalizeVT(r[8])
      };
    }

    // Elo standings mapping (VT is always from Tournament Elo column I)
    const vtFromMap = vtMap ? vtMap.get(normalizeKey(player)) : null;
    return {
      _dataIndex: idx,
      player,
      rating: toNumber(r[1]),
      games: toNumber(r[2]),
      win: toNumber(r[3]),
      loss: toNumber(r[4]),
      draw: toNumber(r[5]),
      winrate: (r[6] ?? "").toString().trim(),
      peak: toNumber(r[7]),
      vt: vtFromMap || null
    };
  }).filter(Boolean);

  let finalRows = [];

  if (dcprMode){
    // Rank follows sheet order (row 2 = rank 1)
    finalRows = loadedInDataOrder.map((r, i) => ({ ...r, rank: i + 1 }));
  } else {
    // Rank by rating DESC, stable by data order
    const sorted = [...loadedInDataOrder]
      .sort((a,b) => {
        const ra = Number.isFinite(a.rating) ? a.rating : -Infinity;
        const rb = Number.isFinite(b.rating) ? b.rating : -Infinity;
        if (rb !== ra) return rb - ra;
        return a._dataIndex - b._dataIndex;
      })
      .map((r, i) => ({ ...r, rank: i + 1 }));

    // Keep original data order in storage, but with rank attached
    const byPlayer = new Map(sorted.map(r => [normalizeKey(r.player), r.rank]));
    finalRows = loadedInDataOrder.map(r => ({ ...r, rank: byPlayer.get(normalizeKey(r.player)) || null }));
  }

  return finalRows;
}

async function preloadStandingsOnInit(){
  refreshBtn.disabled = true;
  tbody.innerHTML = `<tr><td colspan="9" class="muted">${t("loading")}</td></tr>`;
  try{
    const vtMap = await loadVtByPlayer();
    standingsCache.vtMap = vtMap;

    const [eloRows, dcprRows] = await Promise.all([
      fetchStandingsRows(false, vtMap),
      fetchStandingsRows(true, vtMap)
    ]);
    standingsCache.eloRows = eloRows;
    standingsCache.dcprRows = dcprRows;

    // render current mode instantly (no refetch on toggle)
    const dcprMode = !!(ratedOnlyEl && ratedOnlyEl.checked);
    allRows = getCachedRows(dcprMode) || [];
    ensureSlugsAndRouting();
    updateInfoBar();
    renderStandings(allRows);
  } catch(e){
    console.error("[ELO] Failed to preload standings:", e);
    if (uniquePlayersEl) uniquePlayersEl.textContent = "0";
    tbody.innerHTML = `<tr><td colspan="9" class="muted">${t("data_load_failed")}</td></tr>`;
  } finally {
    refreshBtn.disabled = false;
  }
}


async function loadStandings(forceDcprMode){
  const seq = ++standingsLoadSeq;
  refreshBtn.disabled = true;

  // Clear previous table immediately so old data doesn't linger while reloading.
  allRows = [];
  if (uniquePlayersEl) uniquePlayersEl.textContent = "0";
  tbody.innerHTML = `<tr><td colspan="9" class="muted">${t("loading")}</td></tr>`;
  try{
    const dcprMode = (typeof forceDcprMode === "boolean")
      ? forceDcprMode
      : !!(ratedOnlyEl && ratedOnlyEl.checked);
    const vtMap = await loadVtByPlayer();

    // If another reload started while we were awaiting, abort this one.
    if (seq !== standingsLoadSeq) return;

    // IMPORTANT:
    // - Normal mode must load from "Elo standings"
    // - DCPR mode must load from "Tournament Elo"
    // Build URL dynamically to ensure the correct sheet is always requested.
    const sheetName = dcprMode ? TOURNAMENT_ELO_SHEET_NAME : ELO_SHEET_NAME;
    const u = new URL(buildCsvUrlForSheet(sheetName));
    u.searchParams.set("_", Date.now().toString());
    console.log(`[ELO] Fetch standings CSV (${dcprMode ? "Tournament Elo" : "Elo standings"}):`, u.toString());
    const { res, text } = await fetchUtf8Text(u.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (text.trim().startsWith("<")) throw new Error("Místo CSV přišlo HTML.");

    if (seq !== standingsLoadSeq) return;

    const rows = parseCSV(text);

    // Data source mapping
    // - Normal mode: Elo standings sheet (we still compute rank by sorting rating DESC)
    // - DCPR mode: Tournament Elo sheet (rank follows row order, first player is row 2)
    const loadedInDataOrder = rows.slice(1).map((r, idx) => {
      const player = (r[0] ?? "").toString().trim();
      if (!player) return null;

      if (dcprMode){
        // Tournament Elo mapping (A..I)
        return {
          _dataIndex: idx,
          player,
          rating: toNumber(r[1]),
          games: toNumber(r[2]),
          win: toNumber(r[3]),
          loss: toNumber(r[4]),
          draw: toNumber(r[5]),
          winrate: (r[6] ?? "").toString().trim(),
          peak: toNumber(r[7]),
          vt: normalizeVT(r[8])
        };
      }

      // Elo standings mapping (A..I), but VT is ALWAYS sourced from Tournament Elo → column I
      return {
        _dataIndex: idx,
        player,
        rating: toNumber(r[1]),
        games: toNumber(r[2]),
        win: toNumber(r[3]),
        loss: toNumber(r[4]),
        draw: toNumber(r[5]),
        winrate: (r[6] ?? "").toString().trim(),
        peak: toNumber(r[7]),
        vt: vtMap.get(normalizeKey(player)) ?? null
      };
    }).filter(Boolean);

    const slugs = buildDeterministicSlugs(loadedInDataOrder.map(x => x.player));
    loadedInDataOrder.forEach((x, i) => { x.slug = slugs[i]; });

    // Rank is always based on the row order in the selected sheet.
    // Row 2 = rank 1, row 3 = rank 2, etc.
    allRows = loadedInDataOrder.map((p, i) => ({ ...p, rank: i + 1 }));

    slugToPlayer = new Map(allRows.map(p => [p.slug, p]));
    renderStandings(allRows);
    updateInfoBar();

    // If the current URL is /<slug>, open it after data is ready (deep link / back-forward)
    if (pendingSlugToOpen){
      pendingSlugToOpen = null;
      applyRoute();
    }
  } catch (e){
    console.error("[ELO] Failed to load standings:", e);
    if (uniquePlayersEl) uniquePlayersEl.textContent = "0";
    tbody.innerHTML = `<tr><td colspan="9" class="muted">${t("data_load_failed")}</td></tr>`;
  } finally {
    refreshBtn.disabled = false;
  }
}

async function loadPlayerCards(){
  if (playerCardsCache) return playerCardsCache;

  const u = new URL(PLAYER_CARDS_CSV_URL);
  u.searchParams.set("_", Date.now().toString());
  const { res, text } = await fetchUtf8Text(u.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (text.trim().startsWith("<")) throw new Error("HTML místo CSV");

  const rows = parseCSV(text);
  if (rows.length < 2) throw new Error("Player cards (CSV): prázdné CSV");

  const items = rows.slice(1).map(r => ({
    player: (r[0] ?? "").toString().trim(),
    matchId: toNumber((r[1] ?? "").toString().trim()),
    tournament: (r[2] ?? "").toString().trim(),
    tournamentDetail: (r[3] ?? "").toString().trim(),
    date: (r[4] ?? "").toString().trim(),
    opponent: (r[5] ?? "").toString().trim(),
    result: (r[6] ?? "").toString().trim(),
    delta: (r[7] ?? "").toString().trim(),
    elo: toNumber((r[8] ?? "").toString().trim())
  })).filter(x => x.player);

  playerCardsCache = items;
  return items;
}

async function loadPlayerSummary(){
  if (playerSummaryCache) return playerSummaryCache;

  const u = new URL(PLAYER_SUMMARY_CSV_URL);
  u.searchParams.set("_", Date.now().toString());
  const { res, text } = await fetchUtf8Text(u.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  if (text.trim().startsWith("<")) throw new Error("HTML místo CSV");

  const rows = parseCSV(text);
  if (rows.length < 2) return [];

  // M=12, N=13, O=14 (0-based)
  const items = rows.slice(1).map(r => ({
    player: (r[0] ?? "").toString().trim(),
    avgOpp: toNumber((r[12] ?? "").toString().trim()),
    winStreak: toNumber((r[13] ?? "").toString().trim()),
    lossStreak: toNumber((r[14] ?? "").toString().trim())
  })).filter(x => x.player);

  playerSummaryCache = items;
  return items;
}

async function getSummaryForPlayer(playerName){
  const list = await loadPlayerSummary();
  const wanted = playerName.trim();
  return list.find(x => x.player.trim() === wanted) || null;
}

function buildSvgLineChartEqualX(points){
  const clean = points.filter(p => Number.isFinite(p.matchId) && Number.isFinite(p.elo)).slice();
  if (clean.length < 2) return `<div class="muted">${t("chart_no_data")}</div>`;

  const w=980, h=280, padL=44, padR=18, padT=18, padB=42;
  const ys = clean.map(p=>p.elo);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const spanY = Math.max(1, maxY - minY);

  const X = (i) => {
    const span = Math.max(1, clean.length - 1);
    return padL + (i*(w-padL-padR))/span;
  };
  const Y = v => (h-padB) - ((v-minY)*(h-padT-padB))/spanY;

  let d="";
  for (let i=0;i<clean.length;i++){
    d += (i===0 ? "M " : "L ") + X(i).toFixed(2) + " " + Y(clean[i].elo).toFixed(2) + " ";
  }

  const gridLines = 4;
  let grid = "";
  for (let i=0;i<=gridLines;i++){
    const t = i/gridLines;
    const yy = padT + t*(h-padT-padB);
    const val = Math.round(maxY - t*(maxY-minY));
    grid += `
      <line x1="${padL}" y1="${yy}" x2="${w-padR}" y2="${yy}" stroke="var(--chartGrid)" />
      <text x="${padL-10}" y="${yy+4}" text-anchor="end" fill="var(--chartText)" font-size="11">${val}</text>
    `;
  }

  const maxTicks = 8;
  const ticks = Math.min(maxTicks, clean.length);
  let xTicks = "";
  for (let i=0;i<ticks;i++){
    const idx = Math.round(i*(clean.length-1)/(ticks-1));
    const xx = X(idx);
    xTicks += `
      <line x1="${xx}" y1="${h-padB}" x2="${xx}" y2="${h-padB+6}" stroke="var(--chartAxis)" />
      <text x="${xx}" y="${h-padB+22}" text-anchor="middle" fill="var(--chartText)" font-size="11">${clean[idx].matchId}</text>
    `;
  }

  const dots = clean.map((p,i) => `<circle cx="${X(i)}" cy="${Y(p.elo)}" r="3.2" fill="var(--chartDot)" />`).join("");

  return `
    <svg viewBox="0 0 ${w} ${h}" width="100%" height="280" role="img" aria-label="ELO chart">
      ${grid}
      <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${h-padB}" stroke="var(--chartAxis)" />
      <line x1="${padL}" y1="${h-padB}" x2="${w-padR}" y2="${h-padB}" stroke="var(--chartAxis)" />
      ${xTicks}
      <path d="${d}" fill="none" stroke="var(--chartLine)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
      ${dots}
      <text x="${padL}" y="${padT-4}" fill="var(--chartText)" font-size="11">ELO</text>
      <text x="${w-padR}" y="${h-10}" text-anchor="end" fill="var(--chartText)" font-size="11">Match ID</text>
    </svg>
  `;
}

function buildHero(playerName, tournamentObj, eloObj, summary){
  const avgOpp = summary && Number.isFinite(summary.avgOpp) ? summary.avgOpp.toFixed(0) : "—";
  const winStreak = summary && Number.isFinite(summary.winStreak) ? summary.winStreak.toFixed(0) : "—";
  const lossStreak = summary && Number.isFinite(summary.lossStreak) ? summary.lossStreak.toFixed(0) : "—";

  const vt = tournamentObj?.vt || null;

  const dcprRank = Number.isFinite(tournamentObj?.rank) ? tournamentObj.rank : null;
  const eloRank = Number.isFinite(eloObj?.rank) ? eloObj.rank : null;

  return `
    <div class="heroGrid">
      <div class="box boxPad leftPanel">
        <div class="leftTop">
          <div class="heroNameRow">
            <div class="heroName">${escapeHtml(playerName)}</div>
            <div class="heroModeToggle" role="tablist" aria-label="Rating mode">
              <button class="heroModeBtn isActive" type="button" data-hero-mode="dcpr" role="tab" aria-selected="true">DCPR</button>
              <button class="heroModeBtn" type="button" data-hero-mode="elo" role="tab" aria-selected="false">ELO</button>
            </div>
          </div>
          ${vt ? `<div class="heroVT ${vtToClass(vt)}">${escapeHtml(vtDetailText(vt))}</div>` : ""}

          <div class="heroModePanels">
            <div class="heroModePanel" data-hero-panel="dcpr">
              <div class="heroCol">
                <div class="heroColHead">
                  <div class="heroColTitle">DCPR</div>
                  <div class="heroColRank">${rankBadgeHtml(dcprRank)}</div>
                </div>
                <div class="heroColValue">
                  <div class="heroColNumber">${Number.isFinite(tournamentObj?.rating) ? tournamentObj.rating.toFixed(0) : "—"}</div>
                </div>
                <div class="heroColStats">
                  ${heroMiniStatsHtml(tournamentObj)}
                </div>
              </div>
            </div>

            <div class="heroModePanel isHidden" data-hero-panel="elo">
              <div class="heroCol">
                <div class="heroColHead">
                  <div class="heroColTitle">ELO</div>
                  <div class="heroColRank">${rankBadgeHtml(eloRank)}</div>
                </div>
                <div class="heroColValue">
                  <div class="heroColNumber">${Number.isFinite(eloObj?.rating) ? eloObj.rating.toFixed(0) : "—"}</div>
                </div>
                <div class="heroColStats">
                  ${heroMiniStatsHtml(eloObj)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="rightCol">
        <div class="box boxPad chartBox">
          <div class="chartHead">
            <b id="chartTitle">${t("elo_evolution")}</b>
            <span id="chartMeta" class="muted">${t("loading_player_data")}</span>
          </div>
          <div id="eloChart" class="muted">${t("loading_player_data")}</div>
        </div>

        <div class="metaBoxRow">
          <div class="stat"><b>average opponent rating</b><span>${avgOpp}</span></div>
          <div class="stat statWin"><b>longest win streak</b><span>${winStreak} 🔥</span></div>
          <div class="stat statLoss"><b>longest loss streak</b><span>${lossStreak}</span></div>
        </div>
      </div>
    </div>
  `;
}

function computeWLD(rows){
  const w = rows.reduce((acc, r) => acc + ((r.result||"").toLowerCase().includes("won") ? 1 : 0), 0);
  const l = rows.reduce((acc, r) => acc + ((r.result||"").toLowerCase().includes("lost") ? 1 : 0), 0);
  const d = rows.reduce((acc, r) => acc + ((r.result||"").toLowerCase().includes("draw") ? 1 : 0), 0);
  return { w, l, d, games: w + l + d };
}

function computeStreaks(rows){
  // počítá nejdelší streak výher a proher v rámci daného pořadí zápasů
  let bestWin=0, bestLoss=0, curWin=0, curLoss=0;
  for (const r of rows){
    const res = (r.result||"").toLowerCase();
    const isWin = res.includes("won");
    const isLoss = res.includes("lost");
    if (isWin){
      curWin += 1; bestWin = Math.max(bestWin, curWin);
      curLoss = 0;
    } else if (isLoss){
      curLoss += 1; bestLoss = Math.max(bestLoss, curLoss);
      curWin = 0;
    } else {
      // draw / unknown resets both
      curWin = 0; curLoss = 0;
    }
  }
  return { bestWin, bestLoss };
}

function computeAvgOpponent(rows){
  const oppRatings = rows.map(r => extractOpponentRating(r.opponent)).filter(Number.isFinite);
  if (!oppRatings.length) return NaN;
  return oppRatings.reduce((a,b)=>a+b,0) / oppRatings.length;
}

function extractOpponentRating(opponentText){
  const t = (opponentText || "").toString().trim();
  const m = t.match(/\((\d+(?:[.,]\d+)?)\)\s*$/);
  if (!m) return NaN;
  return toNumber(m[1]);
}

function buildTournamentTable(rows){
  const w = rows.reduce((acc, r) => acc + ((r.result||"").toLowerCase().includes("won") ? 1 : 0), 0);
  const l = rows.reduce((acc, r) => acc + ((r.result||"").toLowerCase().includes("lost") ? 1 : 0), 0);
  const d = rows.reduce((acc, r) => acc + ((r.result||"").toLowerCase().includes("draw") ? 1 : 0), 0);

  const oppRatings = rows.map(r => extractOpponentRating(r.opponent)).filter(Number.isFinite);
  const avgOpp = oppRatings.length ? (oppRatings.reduce((a,b)=>a+b,0)/oppRatings.length) : NaN;

  const head = `
    <thead>
      <tr>
        <th class="num">Match ID</th>
        <th>Opponent (rating)</th>
        <th>Result</th>
        <th class="num">(+/-)</th>
        <th class="num">ELO</th>
        <th>Date</th>
        <th>Tournament</th>
      </tr>
    </thead>
  `;

  const body = rows.map(r => `
    <tr>
      <td class="num">${Number.isFinite(r.matchId) ? r.matchId.toFixed(0) : ""}</td>
      <td>${escapeHtml(r.opponent)}</td>
      <td>${escapeHtml(r.result)}</td>
      <td class="num">${escapeHtml(r.delta)}</td>
      <td class="num">${Number.isFinite(r.elo) ? r.elo.toFixed(0) : ""}</td>
      <td>${escapeHtml(r.date)}</td>
      <td>${escapeHtml(r.tournament)}</td>
    </tr>
  `).join("");

  const summaryRow = `
    <tr class="summaryRow">
      <td colspan="2">Souhrn</td>
      <td>Record: ${w}-${l}-${d}</td>
      <td colspan="2" class="num">${t("avg_opp_elo")} ${Number.isFinite(avgOpp) ? avgOpp.toFixed(0) : "—"}</td>
      <td colspan="2"></td>
    </tr>
  `;

  return `<div class="tblWrap"><table class="tbl">${head}<tbody>${body}${summaryRow}</tbody></table></div>`;
}

async function loadPlayerDetail(playerObj){
  setModalHeaderMeta({ title: playerObj.player, subtitle: t("player_detail") });
  // Akce v horní liště nastavujeme až po načtení dat
  setModalActions("");
  setModalContent(`<div class="muted">${t("loading")}</div>`);

  try{
    const [allCards, summary, dcprStanding, eloStanding] = await Promise.all([
      loadPlayerCards(),
      getSummaryForPlayer(playerObj.player),
      getPlayerStandingFromSheet(TOURNAMENT_ELO_SHEET_NAME, true, playerObj.player).catch(() => null),
      getPlayerStandingFromSheet(ELO_SHEET_NAME, false, playerObj.player).catch(() => null)
    ]);
    const wanted = playerObj.player.trim();
    const cards = allCards.filter(r => r.player.trim() === wanted);

    if (!cards.length){
      currentPlayerDetail = null;
      setModalActions("");
      setModalContent(buildHero(playerObj.player, dcprStanding, eloStanding, summary) +
        `<div class="bigError"><div class="icon">❌</div> ${t("player_not_found")}</div>`);
      return;
    }

    // Uložíme pro Protihráče
    currentPlayerDetail = { playerObj, cards };

    // Tlačítko "Protihráči" v horní liště (vedle Zavřít)
    setModalActions(`<button id="oppBtn" class="btnOpponents" type="button">${t("opponents")}</button>`);
    queueMicrotask(() => {
      const btn = document.getElementById("oppBtn");
      if (!btn) return;
      btn.addEventListener("click", () => {
        // Otevře "stránku" Protihráči v rámci stejného modalu
        openOpponentsModal({
          playerName: playerObj.player,
          cards,
          onBack: () => {
            openModal({ title: playerObj.player, subtitle: t("player_detail"), html: `<div class="muted">${t("loading")}</div>` });
            loadPlayerDetail(playerObj);
          }
        });
      });
    });

    const sortedAllAll = cards.slice().sort((a,b) => (a.matchId||0) - (b.matchId||0));

    const isFNM = (row) => ((row?.tournament || "").toString().trim().toUpperCase() === "FNM");

    // Current mode affects chart + tournament list below.
    let currentMode = "dcpr"; // default
    let modeRows = [];
    let groups = new Map();
    let order = [];

    const buildGroupsFromRows = (rows) => {
      groups = new Map();
      order = [];
      for (const r of rows){
        const key = (r.tournamentDetail || "Neznámé").trim();
        if (!groups.has(key)){ groups.set(key, []); order.push(key); }
        groups.get(key).push(r);
      }
    };

    const rowsForMode = (mode) => {
      if (mode === "dcpr") return sortedAllAll.filter(r => !isFNM(r));
      return sortedAllAll.slice();
    };

    const applyMode = (mode) => {
      currentMode = (mode === "elo") ? "elo" : "dcpr";
      modeRows = rowsForMode(currentMode);
      buildGroupsFromRows(modeRows);
    };

    applyMode("dcpr");
let currentTournament = "ALL";

    // Filtr turnaje ovlivňuje POUZE spodní tabulky (graf + horní statistiky zůstávají vždy ze všech dat)
    const renderTournamentTables = (tournamentKey) => {
      currentTournament = tournamentKey;

      const filteredCards = (tournamentKey === "ALL")
        ? modeRows.slice()
        : (groups.get(tournamentKey) ? groups.get(tournamentKey).slice().sort((a,b)=>(a.matchId||0)-(b.matchId||0)) : []);

      const filterOptions = [`<option value="ALL">Všechny turnaje</option>`]
        .concat(order.map(k => `<option value="${escapeHtml(k)}">${escapeHtml(k)}</option>`));

      const filterHtml = `
        <div class="tournamentFilterInline">
          <div class="filterLabel">FILTR TURNAJE</div>
          <div class="tournamentFilter">
            <select id="tournamentSelect">${filterOptions.join("")}</select>
          </div>
        </div>
      `;

      let sectionsHtml = "";
      if (tournamentKey === "ALL"){
        sectionsHtml = order.map((key, i) => {
          const rows = groups.get(key).slice().sort((a,b)=>(a.matchId||0)-(b.matchId||0));
          if (i === 0){
            return `<div class="sectionHeader"><div class="sectionTitle">${escapeHtml(key)}</div>${filterHtml}</div>${buildTournamentTable(rows)}`;
          }
          return `<div class="sectionTitle">${escapeHtml(key)}</div>${buildTournamentTable(rows)}`;
        }).join("");
      } else {
        sectionsHtml = `<div class="sectionHeader"><div class="sectionTitle">${escapeHtml(tournamentKey)}</div>${filterHtml}</div>${buildTournamentTable(filteredCards)}`;
      }

      const tablesEl = document.getElementById("tournamentTables");
      if (tablesEl) tablesEl.innerHTML = sectionsHtml;

      // nastav vybranou hodnotu + handler (po každém re-renderu)
      const sel = document.getElementById("tournamentSelect");
      if (sel){
        sel.value = currentTournament || "ALL";
        sel.onchange = (e) => {
          const val = e.target.value || "ALL";
          renderTournamentTables(val);
        };
      }
    };

    // Postav obsah modalu: hero (ALL data) + filtr (níže) + tabulky
    setModalContent(
      buildHero(playerObj.player, dcprStanding, eloStanding, summary)
      + `
        <div id="tournamentTables"></div>
      `
    );

    // Toggle DCPR/ELO (only one panel visible at a time)
    queueMicrotask(() => {
      const btns = Array.from(document.querySelectorAll(".heroModeBtn[data-hero-mode]"));
      const panels = Array.from(document.querySelectorAll(".heroModePanel[data-hero-panel]"));
      if (!btns.length || !panels.length) return;

      const setMode = (mode) => {
        const normalized = (mode === "elo") ? "elo" : "dcpr";

        for (const b of btns){
          const isOn = (b.getAttribute("data-hero-mode") === normalized);
          b.classList.toggle("isActive", isOn);
          b.setAttribute("aria-selected", isOn ? "true" : "false");
        }
        for (const p of panels){
          const isOn = (p.getAttribute("data-hero-panel") === normalized);
          p.classList.toggle("isHidden", !isOn);
        }

        // Apply mode to the rest of the card (chart + tournaments)
        applyMode(normalized);

        // Re-render chart
        try{ renderChartAndMeta(); }catch(e){}

        // Re-render tournaments and keep selection if possible
        const desired = (currentTournament && currentTournament !== "ALL" && groups.has(currentTournament))
          ? currentTournament
          : "ALL";
        renderTournamentTables(desired);

      };

      // default
      setMode("dcpr");

      for (const b of btns){
        b.addEventListener("click", () => setMode(b.getAttribute("data-hero-mode") || "dcpr"));
      }
    });

    // Graf + meta (depends on current mode)
    const renderChartAndMeta = () => {
      const chartEl = document.getElementById("eloChart");
      const chartMeta = document.getElementById("chartMeta");
      const chartTitle = document.getElementById("chartTitle");

      if (chartTitle){
        chartTitle.textContent = (currentMode === "dcpr") ? t("dcpr_evolution") : t("elo_evolution");
      }

      const points = modeRows
        .filter(r => Number.isFinite(r.matchId) && Number.isFinite(r.elo))
        .map(r => ({ matchId:r.matchId, elo:r.elo }));

      if (chartEl){
        chartEl.innerHTML = buildSvgLineChartEqualX(points);
      }

      if (chartMeta){
        if (points.length){
          const last = points[points.length - 1];
          chartMeta.textContent = `zápasů: ${points.length} • poslední Match ID: ${last.matchId.toFixed(0)} • poslední ELO: ${last.elo.toFixed(0)}`;
        } else {
          chartMeta.textContent = "Nelze vykreslit (chybí Match ID/ELO)";
          if (chartEl) chartEl.innerHTML = `<div class="muted">${t("chart_no_data")}</div>`;
        }
      }
    };

    renderChartAndMeta();
// Výchozí stav: všechny turnaje
    renderTournamentTables("ALL");

  } catch (e){
    currentPlayerDetail = null;
    setModalActions("");
    setModalContent(`<div class="bigError"><div class="icon">❌</div> Chyba při načítání: ${escapeHtml(String(e?.message || e))}</div>`);
  }
}

async function loadAll(){
  // Preload BOTH standings datasets to avoid UI "jump" when switching modes.
  await Promise.all([preloadStandingsOnInit(), loadLastData()]);
  playerCardsCache = null;
  playerSummaryCache = null;
}

/* THEME + LOGO swap */
function syncLogo(){
  const theme = htmlEl.getAttribute("data-theme") || "dark";
  logoImg.src = (theme === "light") ? "assets/images/logos/logo2.png" : "assets/images/logos/logo.png";
}
function setTheme(theme){
  htmlEl.setAttribute("data-theme", theme);
  if (themeLabel) themeLabel.textContent = (theme === "dark") ? "☀️ Světlý" : "Tmavý 🌙";
  localStorage.setItem("theme", theme);
  syncLogo();
}
(function initTheme(){
  if (window.__themeHandled) return;
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") setTheme(saved);
  else setTheme("dark");
})();
if (themeToggle && !window.__themeHandled) themeToggle.addEventListener("click", () => {
  const cur = htmlEl.getAttribute("data-theme") || "dark";
  setTheme(cur === "dark" ? "light" : "dark");
});

/* Events */
refreshBtn.addEventListener("click", loadAll);
searchEl.addEventListener("input", () => renderStandings(allRows));
if (ratedOnlyEl){
  // Toggle "Pouze DCPR" should not refetch — we pre-load both datasets on page load.
  ratedOnlyEl.addEventListener("change", (e) => {
    const checked = !!e?.target?.checked;
    switchStandingsMode(checked);
  });
}


tbody.addEventListener("click", (e) => {
  const btn = e.target.closest(".playerBtn");
  if (!btn) return;
  navigateToPlayer(btn._playerObj);
});

/* Init: GitHub Pages SPA redirect + routing */
normalizeSpaRedirectIfPresent();

// Wire close so it updates URL deterministically
if (!__closeModalRaw){
  __closeModalRaw = window.closeModal;
  window.closeModal = function(){
    const base = getBasePath();
    const slug = getSlugFromLocation();
    const hasPlayerState = !!(history.state && history.state.__playerSlug);

    // Close UI first
    try{ __closeModalRaw?.(); }catch(e){}

    // If we are on a player route, return to base.
    if (slug){
      // If the player route was opened from within the app (pushState), go back.
      // If this is a deep link, replace so we don't leave the site.
      if (hasPlayerState && window.history.length > 1){
        try{ history.back(); return; }catch(e){}
      }
      try{ history.replaceState({}, "", base); }catch(e){}
    }
  };
}

// Back/forward support
// When user clicks "Zavřít" in detail, also restore route back to list
setModalOnCloseRequest(closePlayerDetailAndRoute);

window.addEventListener("popstate", () => applyRoute());

// Apply route immediately (if user opened /<slug>)
applyRoute();

// Load data
loadAll();
