import { openModal, setModalContent, setModalHeaderMeta } from "./modal.js";

const SHEET_ID = "1y98bzsIRpVv0_cGNfbITapucO5A6izeEz5lTM92ZbIA";
const ELO_SHEET_NAME = "Elo standings";
const DATA_SHEET_NAME = "Data";
const PLAYER_CARDS_SHEET_NAME = "Player cards (CSV)";
const PLAYER_SUMMARY_SHEET_NAME = "Player summary";

const ELO_CSV_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(ELO_SHEET_NAME)}`;
const DATA_CSV_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(DATA_SHEET_NAME)}`;
const PLAYER_CARDS_CSV_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(PLAYER_CARDS_SHEET_NAME)}`;
const PLAYER_SUMMARY_CSV_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(PLAYER_SUMMARY_SHEET_NAME)}`;

const statusEl = document.getElementById("status");
const tbody = document.getElementById("tbody");
const searchEl = document.getElementById("search");
const refreshBtn = document.getElementById("refresh");
const lastDataBadge = document.getElementById("lastDataBadge");

const avgEloEl = document.getElementById("avgElo");
const avgWinrateEl = document.getElementById("avgWinrate");
const totalGamesEl = document.getElementById("totalGames");
const lastTournamentEl = document.getElementById("lastTournament");
const requestUploadBtn = document.getElementById("requestUploadBtn");

const logoImg = document.getElementById("logoImg");
const htmlEl = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const themeLabel = document.getElementById("themeLabel");

let allRows = [];
let lastTournamentText = "";
let playerCardsCache = null;
let playerSummaryCache = null;

function escapeHtml(str){
  return (str ?? "").toString()
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");
}
function normalizeKey(s){
  return (s || "").toString().trim().toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu,"");
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
  avgWinrateEl.textContent = Number.isFinite(avgWinrate) ? `${avgWinrate.toFixed(0)}%` : "—";
  lastTournamentEl.textContent = lastTournamentText || "—";
}

async function loadLastData(){
  lastDataBadge.textContent = `načteno: ${formatNow()}`;
  try{
    const u = new URL(DATA_CSV_URL);
    u.searchParams.set("_", Date.now().toString());
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
    lastTournamentText = "";
    updateInfoBar();
  }
}

function renderStandings(rows){
  const q = normalizeKey(searchEl.value);
  const filtered = rows.filter(r => !q || normalizeKey(r.player).includes(q)).sort((a,b)=>a.rank-b.rank);

  tbody.innerHTML = "";
  if (!filtered.length){
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="9" class="muted">Nic nenalezeno.</td>`;
    tbody.appendChild(tr);
    return;
  }

  for (const r of filtered){
    const peakText = Number.isFinite(r.peak) ? r.peak.toFixed(0) : "";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="rank colRank">${rankCellHtml(r.rank)}</td>
      <td class="playerCol"><button class="playerBtn" type="button">${escapeHtml(r.player)}</button></td>
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

async function loadStandings(){
  statusEl.textContent = "Načítám…";
  refreshBtn.disabled = true;
  try{
    const u = new URL(ELO_CSV_URL);
    u.searchParams.set("_", Date.now().toString());
    const { res, text } = await fetchUtf8Text(u.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (text.trim().startsWith("<")) throw new Error("Místo CSV přišlo HTML.");

    const rows = parseCSV(text);

    const iPlayer = 0, iRating = 1, iGames=2, iWin=3, iLoss=4, iDraw=5, iWinrate=6, iPeak=7;

    const loaded = rows.slice(1).map(r => ({
      player:(r[iPlayer] ?? "").trim(),
      rating:toNumber(r[iRating]),
      peak:toNumber(r[iPeak]),
      games:toNumber(r[iGames]),
      win:toNumber(r[iWin]),
      loss:toNumber(r[iLoss]),
      draw:toNumber(r[iDraw]),
      winrate:(r[iWinrate] ?? "").toString().trim()
    })).filter(x=>x.player);

    loaded.sort((a,b)=>(b.rating||-Infinity)-(a.rating||-Infinity));
    allRows = loaded.map((p,i)=>({ ...p, rank:i+1 }));

    statusEl.textContent = `Načteno: ${allRows.length}`;
    renderStandings(allRows);
    updateInfoBar();
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
  if (clean.length < 2) return `<div class="muted">Graf nelze vykreslit (málo dat).</div>`;

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

function buildHero(playerObj, summary){
  const avgOpp = summary && Number.isFinite(summary.avgOpp) ? summary.avgOpp.toFixed(0) : "—";
  const winStreak = summary && Number.isFinite(summary.winStreak) ? summary.winStreak.toFixed(0) : "—";
  const lossStreak = summary && Number.isFinite(summary.lossStreak) ? summary.lossStreak.toFixed(0) : "—";
  const peakText = Number.isFinite(playerObj.peak) ? playerObj.peak.toFixed(0) : "—";

  return `
    <div class="heroGrid">
      <div class="box boxPad leftPanel">
        <div class="leftTop">
          <div class="heroName">${escapeHtml(playerObj.player)}</div>
          <div class="rankLine">
            <div class="muted">Pořadí v žebříčku</div>
            <span class="rankPill">${rankCellHtml(playerObj.rank)}</span>
          </div>
          <div style="margin-top:10px;">
            <div class="heroEloLabel">aktuální rating</div>
            <div class="heroElo">${Number.isFinite(playerObj.rating) ? playerObj.rating.toFixed(0) : ""}</div>
          </div>
        </div>

        <div class="leftBottom">
          <div class="statsGrid">
            <div class="stat"><b>games</b><span>${safeInt(playerObj.games)}</span></div>
            <div class="stat"><b>winrate</b><span>${escapeHtml(playerObj.winrate || "")}</span></div>
          </div>

          <div class="statsGridRow2">
            <div class="stat statWin"><b>win</b><span>${safeInt(playerObj.win)}</span></div>
            <div class="stat statLoss"><b>loss</b><span>${safeInt(playerObj.loss)}</span></div>
            <div class="stat statDraw"><b>draw</b><span>${safeInt(playerObj.draw)}</span></div>
          </div>
        </div>
      </div>

      <div class="rightCol">
        <div class="box boxPad chartBox">
          <div class="chartHead">
            <b>Vývoj ELO</b>
            <span id="chartMeta" class="muted">Načítám data hráče…</span>
          </div>
          <div id="eloChart" class="muted">Načítám data hráče…</div>
        </div>

        <div class="metaBoxRow">
          <div class="stat"><b>peak elo</b><span>${peakText}</span></div>
          <div class="stat"><b>average opponent rating</b><span>${avgOpp}</span></div>
          <div class="stat statWin"><b>longest win streak</b><span>${winStreak} 🔥</span></div>
          <div class="stat statLoss"><b>longest loss streak</b><span>${lossStreak}</span></div>
        </div>
      </div>
    </div>
  `;
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
      <td colspan="2" class="num">Průměr ELO soupeřů: ${Number.isFinite(avgOpp) ? avgOpp.toFixed(0) : "—"}</td>
      <td colspan="2"></td>
    </tr>
  `;

  return `<div class="tblWrap"><table class="tbl">${head}<tbody>${body}${summaryRow}</tbody></table></div>`;
}

async function loadPlayerDetail(playerObj){
  setModalHeaderMeta({ title: playerObj.player, subtitle: "Detail hráče" });
  setModalContent(`<div class="muted">Načítám…</div>`);

  try{
    const [allCards, summary] = await Promise.all([loadPlayerCards(), getSummaryForPlayer(playerObj.player)]);
    const wanted = playerObj.player.trim();
    const cards = allCards.filter(r => r.player.trim() === wanted);

    if (!cards.length){
      setModalContent(buildHero(playerObj, summary) +
        `<div class="bigError"><div class="icon">❌</div> Podrobná data hráče nenalezena</div>`);
      return;
    }

    const sortedAll = cards.slice().sort((a,b) => (a.matchId||0) - (b.matchId||0));

    const groups = new Map();
    const order = [];
    for (const r of sortedAll){
      const key = (r.tournamentDetail || "Neznámé").trim();
      if (!groups.has(key)){ groups.set(key, []); order.push(key); }
      groups.get(key).push(r);
    }

    const sectionsHtml = order.map(key => {
      const rows = groups.get(key).slice().sort((a,b)=>(a.matchId||0)-(b.matchId||0));
      return `<div class="sectionTitle">${escapeHtml(key)}</div>${buildTournamentTable(rows)}`;
    }).join("");

    setModalContent(buildHero(playerObj, summary) + sectionsHtml);

    const chartEl = document.getElementById("eloChart");
    const chartMeta = document.getElementById("chartMeta");

    const points = sortedAll
      .filter(r => Number.isFinite(r.matchId) && Number.isFinite(r.elo))
      .map(r => ({ matchId:r.matchId, elo:r.elo }));

    chartEl.innerHTML = buildSvgLineChartEqualX(points);

    if (points.length){
      const last = points[points.length - 1];
      chartMeta.textContent = `zápasů: ${points.length} • poslední Match ID: ${last.matchId.toFixed(0)} • poslední ELO: ${last.elo.toFixed(0)}`;
    } else {
      chartMeta.textContent = "Nelze vykreslit (chybí Match ID/ELO)";
      chartEl.innerHTML = `<div class="muted">Graf nelze vykreslit (chybí Match ID/ELO v datech hráče).</div>`;
    }

  } catch (e){
    setModalContent(`<div class="bigError"><div class="icon">❌</div> Chyba při načítání: ${escapeHtml(String(e?.message || e))}</div>`);
  }
}

async function loadAll(){
  await Promise.all([loadStandings(), loadLastData()]);
  playerCardsCache = null;
  playerSummaryCache = null;
}

/* THEME + LOGO swap */
function syncLogo(){
  const theme = htmlEl.getAttribute("data-theme") || "dark";
  logoImg.src = (theme === "light") ? "logo2.png" : "logo.png";
}
function setTheme(theme){
  htmlEl.setAttribute("data-theme", theme);
  themeLabel.textContent = (theme === "dark") ? "☀️ Světlý" : "Tmavý 🌙";
  localStorage.setItem("theme", theme);
  syncLogo();
}
(function initTheme(){
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") setTheme(saved);
  else setTheme("dark");
})();
themeToggle.addEventListener("click", () => {
  const cur = htmlEl.getAttribute("data-theme") || "dark";
  setTheme(cur === "dark" ? "light" : "dark");
});

/* Events */
requestUploadBtn.addEventListener("click", () => {
  window.location.href = "https://forms.gle/Y7aHApF5NLFLw6MP9";
});
refreshBtn.addEventListener("click", loadAll);
searchEl.addEventListener("input", () => renderStandings(allRows));

tbody.addEventListener("click", (e) => {
  const btn = e.target.closest(".playerBtn");
  if (!btn) return;
  openModal({ title: btn._playerObj.player, subtitle: "Detail hráče", html: `<div class="muted">Načítám…</div>` });
  loadPlayerDetail(btn._playerObj);
});

/* Init */
loadAll();
