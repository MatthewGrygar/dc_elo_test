// dataFetchers.ts v2.5 — ELO & DCPR kompletní datová vrstva

const SHEET_ID = "1y98bzsIRpVv0_cGNfbITapucO5A6izeEz5lTM92ZbIA";

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    const row: string[] = []; let inQ = false, cur = "";
    for (const ch of line) {
      if (ch === '"') inQ = !inQ;
      else if (ch === "," && !inQ) { row.push(cur.trim()); cur = ""; }
      else cur += ch;
    }
    row.push(cur.trim()); rows.push(row);
  }
  return rows;
}

async function sheet(name: string): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;
  try { const res = await fetch(url, { next: { revalidate: 300 } }); if (!res.ok) return []; return parseCSV(await res.text()); }
  catch { return []; }
}

const pf = (s: string) => { const n = parseFloat((s ?? "").replace(/[^0-9.\-]/g, "")); return isNaN(n) ? 0 : n; };
const pi = (s: string) => Math.round(pf(s));
// Winrate stored in sheets as 0–1 or 0–100; normalize to 0–100
const wrPct = (s: string) => { const v = pf(s); return v > 1 ? v : v * 100; };

function parseDate(s: string): Date | null {
  if (!s) return null;
  s = s.trim();
  // Czech format: dd.mm.yyyy (primary format in the sheets)
  if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(s)) {
    const p = s.split(".");
    const d = new Date(+p[2], +p[1]-1, +p[0]);
    if (!isNaN(d.getTime())) return d;
  }
  // ISO yyyy-mm-dd fallback
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const iso = new Date(s + "T00:00:00");
    if (!isNaN(iso.getTime())) return iso;
  }
  return null;
}

const oppName = (s: string) => { const m = s?.match(/^(.+?)\s*\(\d+\)/); return m ? m[1].trim() : (s ?? "").trim(); };
const oppEloFn = (s: string) => { const m = s?.match(/\((\d+)\)/); return m ? parseInt(m[1]) : 0; };

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = arr.reduce((a,b) => a+b,0)/arr.length;
  return Math.sqrt(arr.reduce((s,x) => s+(x-m)**2,0)/arr.length);
}
function median(arr: number[]): number {
  if (!arr.length) return 0;
  const s = [...arr].sort((a,b) => a-b); const m = Math.floor(s.length/2);
  return s.length%2===0 ? (s[m-1]+s[m])/2 : s[m];
}
function pearson(xs: number[], ys: number[]): number {
  const n = xs.length; if (n<2) return 0;
  const mx = xs.reduce((a,b)=>a+b)/n, my = ys.reduce((a,b)=>a+b)/n;
  const num = xs.reduce((s,x,i) => s+(x-mx)*(ys[i]-my),0);
  const den = Math.sqrt(xs.reduce((s,x)=>s+(x-mx)**2,0)*ys.reduce((s,y)=>s+(y-my)**2,0));
  return den===0?0:num/den;
}
function linreg(xs: number[], ys: number[]): {slope:number;intercept:number} {
  const n=xs.length; if(n<2) return {slope:0,intercept:ys[0]??0};
  const mx=xs.reduce((a,b)=>a+b)/n, my=ys.reduce((a,b)=>a+b)/n;
  const slope=xs.reduce((s,x,i)=>s+(x-mx)*(ys[i]-my),0)/(xs.reduce((s,x)=>s+(x-mx)**2,0)||1);
  return {slope, intercept: my-slope*mx};
}
function giniCoeff(values: number[]): number {
  if(!values.length) return 0;
  const sorted=[...values].sort((a,b)=>a-b); const n=sorted.length;
  const sum=sorted.reduce((a,b)=>a+b,0); if(sum===0) return 0;
  return (2*sorted.reduce((s,e,i)=>s+(i+1)*e,0))/(n*sum)-(n+1)/n;
}

const MN=["Led","Úno","Bře","Dub","Kvě","Čvn","Čvc","Srp","Zář","Říj","Lis","Pro"];
const DN=["Neděle","Pondělí","Úterý","Středa","Čtvrtek","Pátek","Sobota"];
const periodKey=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
const periodLabel=(k:string)=>{const[y,m]=k.split("-");return `${MN[parseInt(m)-1]} ${y}`;};

// ── TYPES ──────────────────────────────────────────────────────────────────────

export interface GeneralStats {
  playerCount:number; totalMatches:number; avgElo:number; medianElo:number;
  activePlayers30d:number; matchesLast30d:number;
  totalWins:number; totalLosses:number; totalDraws:number; globalWinrate:number; avgGamesPerPlayer:number;
  communityWinParityIndex:number; giniCoefficient:number; serverHealthScore:number;
  kFactorEffectiveness:number; inflationIndex:number; fairMatchPct:number; avgMatchEloDelta:number;
  highestElo:{name:string;value:number}; lowestElo:{name:string;value:number}; peakEloEver:{name:string;value:number};
  mostActive:{name:string;games:number};
  biggestGain30d:{name:string;change:number}; biggestDrop30d:{name:string;change:number};
  mostImprovedMonth:{name:string;gain:number}; biggestDropperMonth:{name:string;loss:number};
  bestUpset:{winner:string;loser:string;diff:number;date:string;tournament:string};
  biggestSingleGain:{player:string;value:number;date:string;opp:string;tournament:string};
  biggestSingleLoss:{player:string;value:number;date:string;opp:string;tournament:string};
  mostPlayedTournament:{name:string;matches:number}; mostPlayedTournamentType:{name:string;games:number};
  longestActivePlayer:{name:string;days:number;first:string;last:string};
  rivalryTop5:{a:string;b:string;games:number}[];
  eloDistribution:{bracket:string;count:number;pct:number}[];
  matchFreqDistribution:{label:string;count:number;pct:number}[];
  vtDistribution:{label:string;vt:string;count:number}[];
  vtScatter:{name:string;elo:number;vt:string}[];
  avgMatchmakingDiff:number;
  totalGames:number;
}

export interface AnalyticsData {
  eloHistogram:{x:number;bucket:string;count:number;gauss:number}[];
  top10:{name:string;elo:number;peak:number;winrate:number;games:number;rank:number}[];
  activityHeatmap:{period:string;label:string;count:number}[];
  avgEloTrend:{period:string;label:string;avgElo:number;trend:number}[];
  medianEloTrend:{period:string;label:string;medianElo:number}[];
  winrateDistribution:{bucket:string;from:number;count:number;gauss:number}[];
  eloVsGames:{name:string;games:number;elo:number}[];
  gamesOverTime:{period:string;label:string;games:number}[];
  top5History:{period:string;label:string;[k:string]:number|string}[];
  top10History:{period:string;label:string;[k:string]:number|string}[];
  top15History:{period:string;label:string;[k:string]:number|string}[];
  tournamentPie:{name:string;count:number}[];
  matchFreqHeatmap:{dow:number;hour:number;label:string;count:number}[];
  giniOverTime:{period:string;label:string;gini:number}[];
  eloChangeDistribution:{x:number;bucket:string;count:number}[];
  rivalryNetwork:{nodes:{id:string;elo:number;games:number}[];links:{source:string;target:string;games:number;winner:string}[]};
  newPlayerTrajectory:{gameNum:number;avgElo:number}[];
  bumpsChart:{period:string;label:string;[k:string]:number|string}[];
  communityWinrateVsOpp:{
    byOppElo:{bucket:number;label:string;games:number;wins:number;draws:number;losses:number;winrate:number;avgEloDiff:number;theorWR:number}[];
    byEloDiff:{bucket:number;label:string;games:number;winrate:number;theorWR:number}[];
    scatter:{oppElo:number;myElo:number;eloDiff:number;result:number}[];
    avgCommunityElo:number;
  };
}

export interface PlayerStats {
  name:string; mode:"ELO"|"DCPR";
  currentElo:number; peakElo:number; historicMin:number; eloRange:number;
  peakRetention:number; lastMatchDate:string; daysSincePeak:number;
  totalGames:number; wins:number; losses:number; draws:number;
  winrate:number; bayesianWR:string;
  gamesLast7d:number; gamesLast30d:number;
  eloChange7d:number; eloChange30d:number; eloChangeThisWeek:number; eloChangeLastWeek:number;
  avgGamesPerActiveDay:number; bestDayOfWeek:string; avgGapBetweenGames:number; longestPause:number;
  avgDelta:number; avgGainPerWin:number; avgLossPerLoss:number;
  biggestGain:number; biggestGainDate:string; biggestGainOpp:string; biggestGainTournament:string;
  biggestLoss:number; biggestLossDate:string; biggestLossOpp:string; biggestLossTournament:string;
  expectedValue:number; gainLossRatio:number; eloEfficiencyRatio:number;
  ladderClimbingRate:number; grindEfficiency:number; momentumAcceleration:number;
  eloCeilingEstimate:number; performanceRating:number;
  expectedWins:number; expectedWinDiff:number; trueSkillSigma:number;
  longestWinStreak:number; longestLoseStreak:number; currentStreak:number; longestUnbeaten:number;
  tiltRecovery:number; comebackRate:number; biggestComeback:number;
  biggestComebackDateMin:string; biggestComebackDatePeak:string;
  avgOppElo:number; highestBeatenElo:number; highestBeatenOpp:string;
  highestLostToElo:number; highestLostToOpp:string;
  wrVsWeaker:number; wrVsSimilar:number; wrVsStronger:number;
  eloBrackets:{bracket:string;games:number;winrate:number;avgDelta:number}[];
  mostPlayedOpp:string; mostPlayedOppGames:number; mostPlayedOppWR:number;
  nemesis:string; nemesisRating:number; prey:string; preyRating:number;
  h2h:{opp:string;games:number;wins:number;losses:number;draws:number;winrate:number;avgDelta:number}[];
  upsetFactor:number; oqaWR:number; upsetRate:number;
  tournamentPerformances:{id:string;games:number;wins:number;losses:number;sumDelta:number;avgDelta:number;perfRating:number;avgOppElo:number}[];
  bestTournamentId:string; bestTournamentPerf:number;
  worstTournamentId:string; worstTournamentPerf:number;
  avgTournamentGain:number; mostPlayedTournamentId:string; uniqueTournaments:number;
  stabilityIndex:number; momentumIndex:number; clutchFactor:number;
  consistencyScore:number; tiltIndex:number; chokingIndex:number;
  clutchUnderPressure:number; hotHandEffect:number; fatigueIndex:number;
  bestMonth:string; bestMonthGain:number; worstMonth:string; worstMonthLoss:number;
}

export interface PlayerCharts {
  eloHistory:{date:string;elo:number;delta:number;opp:string;result:string}[];
  winrateTrend:{n:number;date:string;wr:number}[];
  deltaHistogram:{x:number;bucket:string;count:number}[];
  bracketWR:{bracket:string;games:number;winrate:number;avgDelta:number}[];
  rollingMomentum:{n:number;date:string;momentum:number}[];
  weekdayPerformance:{dow:string;games:number;winrate:number}[];
  streakTimeline:{startDate:string;endDate:string;length:number;type:"win"|"lose"}[];
  h2hTop10:{opp:string;games:number;winrate:number;avgDelta:number}[];
  tournamentPerf:{id:string;avgDelta:number;games:number;perfRating:number}[];
  percentileHistory:{n:number;percentile:number}[];
  expectedVsActual:{n:number;expected:number;actual:number}[];
  volatilityHistory:{n:number;volatility:number}[];
  winLossHeatmap:{myBucket:number;oppBucket:number;myLabel:string;oppLabel:string;winrate:number;games:number}[];
  sessionAnalytics:{date:string;startElo:number;endElo:number;delta:number;games:number}[];
  perfRatingByTournament:{id:string;perfRating:number;avgDelta:number;games:number}[];
  communityVsPlayerHistogram:{x:number;bucket:string;community:number;player:number}[];
  scatterSigmoid:{x:number;sigmoid:number;result:number}[];
}

export interface PlayerRecordsData {
  absoluteRecords:{label:string;value:string;date?:string;context?:string}[];
  gainsRecords:{label:string;value:string;date?:string;context?:string}[];
  streakRecords:{label:string;value:string;date?:string;context?:string}[];
  matchRecords:{label:string;value:string;date?:string;context?:string}[];
  opponentRecords:{label:string;value:string;date?:string;context?:string}[];
  tournamentRecords:{label:string;value:string;date?:string;context?:string}[];
}

export interface RecordEntry {value:string;player?:string;detail?:string;detail2?:string;isAllTime?:boolean;}
export interface RecordCategory {id:string;title:string;icon:string;records:{label:string;entry:RecordEntry|null}[];}
export interface RecordsData {categories:RecordCategory[];}

export interface PlayerDetailData {
  summary: {
    name:string; currentElo:number; peakElo:number; minElo:number;
    wins:number; losses:number; draws:number; winrate:number; // 0-1
    lastMatch:string; totalGames:number; avgOppElo:number;
    longestWinStreak:number; longestLoseStreak:number;
    // new
    daysSincePeak:number; bayesianWR:string;
  };
  computed: {
    eloRange:number; peakRetention:number; games7d:number; games30d:number;
    eloChange7d:number; eloChange30d:number;
    avgDelta:number; avgWinDelta:number; avgLossDelta:number; ev:number;
    biggestSingleGain:number; biggestSingleLoss:number;
    currentStreak:{type:"win"|"lose"|"draw";length:number};
    stabilityIndex:number; momentumIndex:number; consistencyScore:number;
    clutchFactor:number; upsetRate:number; gainLossRatio:number;
    winVsWeaker:number; winVsSimilar:number; winVsStronger:number;
    biggestUpset:number; hardestLoss:number;
    mostPlayedOpponent:{name:string;games:number;winrate:number};
    bestOpponent:{name:string;winrate:number};
    worstOpponent:{name:string;winrate:number};
    // new — aktivita
    eloChangeThisWeek:number; eloChangeLastWeek:number;
    avgGamesPerActiveDay:number; bestDayOfWeek:string;
    avgGapBetweenGames:number; longestPause:number;
    // new — ELO změny
    eloEfficiencyRatio:number; ladderClimbingRate:number; grindEfficiency:number;
    momentumAcceleration:number; eloCeilingEstimate:number;
    performanceRating:number; expectedWins:number; expectedWinDiff:number;
    trueSkillSigma:number;
    // new — streaky
    longestUnbeaten:number; tiltRecovery:number; comebackRate:number;
    biggestComeback:number;
    // new — pokročilé indexy
    tiltIndex:number; chokingIndex:number; clutchUnderPressure:number;
    hotHandEffect:number; fatigueIndex:number;
    bestMonth:string; bestMonthGain:number;
    worstMonth:string; worstMonthLoss:number;
    // new — soupeřský blok
    upsetFactor:number; oqaWR:number;
    nemesis:string; nemesisWR:number;
    prey:string; preyWR:number;
    eloBrackets:{bracket:string;games:number;winrate:number;avgDelta:number}[];
  };
  eloTrend:{date:string;elo:number;delta:number;result:string;opponent:string}[];
  eloTrendByDate:{date:string;elo:number}[]; // last game ELO per day
  rollingMomentum:{gameIndex:number;momentum:number}[];
  deltaDistribution:{bucket:string;count:number;positive:boolean}[];
  weekdayPerf:{day:string;shortDay:string;games:number;winrate:number}[];
  winrateVsOpp:{bucket:string;wr:number;games:number}[];
  opponents:{name:string;games:number;wins:number;losses:number;draws:number;winrate:number;avgDelta:number;lastDate:string}[];
  tournamentPerf:{name:string;games:number;wins:number;losses:number;totalDelta:number;avgDelta:number}[];
  streaks:{type:"win"|"lose";length:number;startDate:string}[];
  matchHistory:{
    matchId:string; date:string; tournament:string; tournamentType:string;
    opponent:string; opponentElo:number; myEloBefore:number; myEloAfter:number;
    delta:number; result:"Won"|"Lost"|"Draw"; resultDetail:string;
  }[];
}

// ── GENERAL STATS ──────────────────────────────────────────────────────────────
export async function fetchGeneralStats(mode:"ELO"|"DCPR", nameFilter?: (n: string) => boolean): Promise<GeneralStats> {
  const sSheet=mode==="ELO"?"Elo standings":"Tournament_Elo";
  const cSheet=mode==="ELO"?"Player cards (CSV)":"Player cards (CSV) - Tournament";
  const sumSheet=mode==="ELO"?"Player summary":"Player summary - Tournament";
  const [standings,cards,summary]=await Promise.all([sheet(sSheet),sheet(cSheet),sheet(sumSheet)]);
  const sRows=standings.slice(1).filter(r=>{const n=r[0]?.trim();return n&&(!nameFilter||nameFilter(n));});
  const cRows=cards.slice(1).filter(r=>{const n=r[0]?.trim();return n&&(!nameFilter||nameFilter(n));});
  const sumRows=summary.slice(1).filter(r=>{const n=r[0]?.trim();return n&&(!nameFilter||nameFilter(n));});

  const now=new Date();
  const ago30=new Date(now.getTime()-30*86400_000);
  const ago6mo=new Date(now.getTime()-180*86400_000);
  const thisMonthKey=periodKey(now);

  const eloValues=sRows.map(r=>pf(r[1])).filter(e=>e>0);
  const avgElo=eloValues.length?Math.round(eloValues.reduce((a,b)=>a+b)/eloValues.length):0;
  const medianElo=Math.round(median(eloValues));
  const giniCoefficient=Math.round(giniCoeff(eloValues)*1000)/1000;

  const maxEloRow=sRows.reduce((b,r)=>pf(r[1])>pf(b[1])?r:b,sRows[0]??[]);
  const minEloRow=sRows.reduce((b,r)=>pf(r[1])<pf(b[1])?r:b,sRows[0]??[]);
  const peakRow=sRows.reduce((b,r)=>pf(r[7])>pf(b[7])?r:b,sRows[0]??[]);
  const maxMatchId=cRows.reduce((m,r)=>Math.max(m,pi(r[1])),0);
  const totalWins=sRows.reduce((s,r)=>s+pi(r[3]),0);
  const totalLosses=sRows.reduce((s,r)=>s+pi(r[4]),0);
  const totalDraws=sRows.reduce((s,r)=>s+pi(r[5]),0);
  const totalGamesAll=sRows.reduce((s,r)=>s+pi(r[2]),0);
  const globalWinrate=totalGamesAll>0?Math.round(totalWins/totalGamesAll*1000)/10:0;
  const avgGamesPerPlayer=sRows.length>0?Math.round(totalGamesAll/sRows.length):0;
  const communityWinParityIndex=sRows.length>0?Math.round(sRows.filter(r=>wrPct(r[6])>50).length/sRows.length*100):0;
  const activePlayers30d=sumRows.filter(r=>{const d=parseDate(r[9]);return d&&d>=ago30;}).length;

  const matchMids30=new Set<string>();
  for(const r of cRows){const d=parseDate(r[4]);if(d&&d>=ago30)matchMids30.add(r[1]);}
  const matchesLast30d=matchMids30.size;

  const mostActiveRow=sRows.reduce((b,r)=>pi(r[2])>pi(b[2])?r:b,sRows[0]??[]);

  const gain30=new Map<string,number>();
  for(const r of cRows){const d=parseDate(r[4]);if(!d||d<ago30)continue;const n=r[0]?.trim();gain30.set(n,(gain30.get(n)??0)+pf(r[7]));}
  let g30Name="",g30Val=-Infinity,d30Name="",d30Val=Infinity;
  for(const[n,v]of gain30){if(v>g30Val){g30Val=v;g30Name=n;}if(v<d30Val){d30Val=v;d30Name=n;}}

  const gainMonth=new Map<string,number>();
  for(const r of cRows){const d=parseDate(r[4]);if(!d||periodKey(d)!==thisMonthKey)continue;const n=r[0]?.trim();gainMonth.set(n,(gainMonth.get(n)??0)+pf(r[7]));}
  let mipName="",mipGain=-Infinity,bdName="",bdLoss=Infinity;
  for(const[n,v]of gainMonth){if(v>mipGain){mipGain=v;mipName=n;}if(v<bdLoss){bdLoss=v;bdName=n;}}

  let upsetDiff=0,upsetW="",upsetL="",upsetDate="",upsetT="";
  let maxGainVal=0,maxGainPl="",maxGainDate="",maxGainOpp="",maxGainT="";
  let minLossVal=0,minLossPl="",minLossDate="",minLossOpp="",minLossT="";
  for(const r of cRows){
    const d=pf(r[7]),e=pf(r[8]),myE=e-d,oe=oppEloFn(r[5]??""),res=r[6]?.trim()??"";
    const name=r[0]?.trim(),date=r[4]?.trim(),t=`${r[3]?.trim()} ${r[4]?.trim()}`;
    if(d>maxGainVal){maxGainVal=d;maxGainPl=name;maxGainDate=date;maxGainOpp=oppName(r[5]??"");maxGainT=t;}
    if(d<minLossVal){minLossVal=d;minLossPl=name;minLossDate=date;minLossOpp=oppName(r[5]??"");minLossT=t;}
    if(oe>0&&res.startsWith("Won")&&(oe-myE)>upsetDiff){upsetDiff=oe-myE;upsetW=name;upsetL=oppName(r[5]??"");upsetDate=date;upsetT=t;}
  }

  const tournamentMids=new Map<string,Set<string>>();
  const typeCount=new Map<string,number>();
  for(const r of cRows){
    const tid=`${r[3]?.trim()} ${r[4]?.trim()}`.trim(),mid=r[1]?.trim(),type=r[2]?.trim();
    if(tid&&mid){if(!tournamentMids.has(tid))tournamentMids.set(tid,new Set());tournamentMids.get(tid)!.add(mid);}
    if(type)typeCount.set(type,(typeCount.get(type)??0)+1);
  }
  let bestT="",bestTGames=0;
  for(const[n,mids]of tournamentMids)if(mids.size>bestTGames){bestTGames=mids.size;bestT=n;}
  let bestType="",bestTypeGames=0;
  for(const[n,c]of typeCount)if(c>bestTypeGames){bestTypeGames=c;bestType=n;}

  const matchPl=new Map<string,{elo:number;name:string}[]>();
  for(const r of cRows){const mid=r[1]?.trim();if(!mid)continue;if(!matchPl.has(mid))matchPl.set(mid,[]);matchPl.get(mid)!.push({elo:pf(r[8])-pf(r[7]),name:r[0]?.trim()});}
  const diffs:number[]=[];
  for(const[,pl]of matchPl)if(pl.length>=2)diffs.push(Math.abs(pl[0].elo-pl[1].elo));
  const avgMatchEloDelta=diffs.length?Math.round(diffs.reduce((a,b)=>a+b)/diffs.length):0;
  const fairMatchPct=diffs.length?Math.round(diffs.filter(d=>d<=100).length/diffs.length*100):0;

  const pairMap=new Map<string,{a:string;b:string;count:number}>();
  for(const[,pl]of matchPl){
    if(pl.length<2)continue;
    const key=[pl[0].name,pl[1].name].sort().join("|||");
    if(!pairMap.has(key))pairMap.set(key,{a:pl[0].name,b:pl[1].name,count:0});
    pairMap.get(key)!.count++;
  }
  const rivalryTop5=[...pairMap.values()].sort((a,b)=>b.count-a.count).slice(0,5).map(r=>({a:r.a,b:r.b,games:r.count}));

  const playerSpan=new Map<string,{min:Date;max:Date;first:string;last:string}>();
  for(const r of cRows){
    const n=r[0]?.trim(),d=parseDate(r[4]);if(!n||!d)continue;
    const cur=playerSpan.get(n);
    if(!cur){playerSpan.set(n,{min:d,max:d,first:r[4],last:r[4]});continue;}
    if(d<cur.min){cur.min=d;cur.first=r[4];}
    if(d>cur.max){cur.max=d;cur.last=r[4];}
  }
  let longestName="",longestDays=0,longestFirst="",longestLast="";
  for(const[n,{min,max,first,last}]of playerSpan){
    const days=Math.floor((max.getTime()-min.getTime())/86400_000);
    if(days>longestDays){longestDays=days;longestName=n;longestFirst=first;longestLast=last;}
  }

  const kfE:number[]=[],kfA:number[]=[];
  for(const r of cRows){
    const oe=oppEloFn(r[5]??"");if(!oe)continue;
    const myE=pf(r[8])-pf(r[7]);
    kfE.push(1/(1+Math.pow(10,(oe-myE)/400)));
    kfA.push(r[6]?.startsWith("Won")?1:r[6]?.startsWith("Draw")?0.5:0);
  }
  const kFactorEffectiveness=Math.round(pearson(kfE,kfA)*1000)/1000;

  const eloHist=new Map<string,Map<string,number>>();
  for(const r of cRows){const n=r[0]?.trim(),d=parseDate(r[4]);if(!n||!d)continue;if(!eloHist.has(n))eloHist.set(n,new Map());eloHist.get(n)!.set(periodKey(d),pf(r[8]));}
  const elosBefore6mo:number[]=[];
  for(const[,hist]of eloHist){const before=[...hist.entries()].filter(([k])=>k<=periodKey(ago6mo)).sort(([a],[b])=>b.localeCompare(a));if(before.length)elosBefore6mo.push(before[0][1]);}
  const avgBefore=elosBefore6mo.length?elosBefore6mo.reduce((a,b)=>a+b)/elosBefore6mo.length:avgElo;
  const inflationIndex=Math.round(avgElo-avgBefore);

  const A=activePlayers30d>0&&sRows.length>0?(activePlayers30d/sRows.length)*100:0;
  const B=Math.max(0,100-Math.abs(avgElo-1500)/5);
  const C=Math.max(0,100-giniCoefficient*100);
  const serverHealthScore=Math.round(A*0.4+B*0.3+C*0.3);

  const eloDistribution=[
    {bracket:"<1400",min:0,max:1399},{bracket:"1400–1600",min:1400,max:1599},
    {bracket:"1600–1800",min:1600,max:1799},{bracket:"1800–2000",min:1800,max:1999},
    {bracket:">2000",min:2000,max:Infinity},
  ].map(b=>{const count=eloValues.filter(e=>e>=b.min&&e<=b.max).length;return{bracket:b.bracket,count,pct:eloValues.length>0?Math.round(count/eloValues.length*100):0};});

  const gpp=sRows.map(r=>pi(r[2]));
  const matchFreqDistribution=[
    {label:"Casual (<10)",min:0,max:9},{label:"Occasional (10–49)",min:10,max:49},
    {label:"Regular (50–149)",min:50,max:149},{label:"Veteran (150+)",min:150,max:Infinity},
  ].map(g=>{const count=gpp.filter(n=>n>=g.min&&n<=g.max).length;return{label:g.label,count,pct:sRows.length>0?Math.round(count/sRows.length*100):0};});

  // VT class distribution + scatter — always from Tournament_Elo (col I = VT, col B = rating)
  const vtSheet=await sheet("Tournament_Elo");
  const vtRows=vtSheet.slice(1).filter(r=>r[0]?.trim());
  const vtMeta:{VT1:"Class A";VT2:"Class B";VT3:"Class C";VT4:"Class D"}={VT1:"Class A",VT2:"Class B",VT3:"Class C",VT4:"Class D"};
  const vtCounts={VT1:0,VT2:0,VT3:0,VT4:0};
  const vtScat:{name:string;elo:number;vt:string}[]=[];
  for(const r of vtRows){
    const vt=(r[8]?.trim()||"") as keyof typeof vtCounts;
    const elo=pf(r[1]);
    const name=r[0]?.trim();
    if(vt in vtCounts&&elo>0&&name){
      vtCounts[vt]++;
      vtScat.push({name,elo:Math.round(elo),vt:vtMeta[vt]});
    }
  }
  const vtDist=[
    {label:"Class A",vt:"VT1",count:vtCounts.VT1},
    {label:"Class B",vt:"VT2",count:vtCounts.VT2},
    {label:"Class C",vt:"VT3",count:vtCounts.VT3},
    {label:"Class D",vt:"VT4",count:vtCounts.VT4},
  ];

  return {
    playerCount:sRows.length,totalMatches:maxMatchId,avgElo,medianElo,activePlayers30d,matchesLast30d,
    totalWins,totalLosses,totalDraws,globalWinrate,avgGamesPerPlayer,
    communityWinParityIndex,giniCoefficient,serverHealthScore,kFactorEffectiveness,inflationIndex,fairMatchPct,avgMatchEloDelta,
    avgMatchmakingDiff:avgMatchEloDelta,
    totalGames:Math.round(totalGamesAll/2),
    highestElo:{name:maxEloRow[0]??"",value:Math.round(pf(maxEloRow[1]??"0"))},
    lowestElo:{name:minEloRow[0]??"",value:Math.round(pf(minEloRow[1]??"0"))},
    peakEloEver:{name:peakRow[0]??"",value:Math.round(pf(peakRow[7]??"0"))},
    mostActive:{name:mostActiveRow[0]??"",games:pi(mostActiveRow[2]??"0")},
    biggestGain30d:{name:g30Name,change:Math.round(isFinite(g30Val)?g30Val:0)},
    biggestDrop30d:{name:d30Name,change:Math.round(isFinite(d30Val)?d30Val:0)},
    mostImprovedMonth:{name:mipName,gain:Math.round(isFinite(mipGain)?mipGain:0)},
    biggestDropperMonth:{name:bdName,loss:Math.round(isFinite(bdLoss)?bdLoss:0)},
    bestUpset:{winner:upsetW,loser:upsetL,diff:Math.round(upsetDiff),date:upsetDate,tournament:upsetT},
    biggestSingleGain:{player:maxGainPl,value:Math.round(maxGainVal),date:maxGainDate,opp:maxGainOpp,tournament:maxGainT},
    biggestSingleLoss:{player:minLossPl,value:Math.round(minLossVal),date:minLossDate,opp:minLossOpp,tournament:minLossT},
    mostPlayedTournament:{name:bestT,matches:bestTGames},
    mostPlayedTournamentType:{name:bestType,games:bestTypeGames},
    longestActivePlayer:{name:longestName,days:longestDays,first:longestFirst,last:longestLast},
    rivalryTop5,eloDistribution,matchFreqDistribution,vtDistribution:vtDist,vtScatter:vtScat,
  };
}

// ── ANALYTICS DATA ─────────────────────────────────────────────────────────────
export async function fetchAnalyticsData(mode:"ELO"|"DCPR", nameFilter?: (n: string) => boolean): Promise<AnalyticsData> {
  const sSheet=mode==="ELO"?"Elo standings":"Tournament_Elo";
  const cSheet=mode==="ELO"?"Player cards (CSV)":"Player cards (CSV) - Tournament";
  const [standings,cards]=await Promise.all([sheet(sSheet),sheet(cSheet)]);
  const sRows=standings.slice(1).filter(r=>{const n=r[0]?.trim();return n&&(!nameFilter||nameFilter(n));});
  const cRows=cards.slice(1).filter(r=>{const n=r[0]?.trim();return n&&(!nameFilter||nameFilter(n));});

  const eloValues=sRows.map(r=>pf(r[1])).filter(e=>e>0);
  const eloMean=eloValues.reduce((a,b)=>a+b,0)/(eloValues.length||1);
  const eloSd=stdDev(eloValues)||1;
  const histBuckets=new Map<number,number>();
  for(const e of eloValues){const b=Math.floor(e/50)*50;histBuckets.set(b,(histBuckets.get(b)??0)+1);}
  const gaussNorm=eloValues.length*50;
  const eloHistogram=[...histBuckets.keys()].sort((a,b)=>a-b).map(x=>({
    x,bucket:`${x}–${x+49}`,count:histBuckets.get(x)??0,
    gauss:Math.round(gaussNorm/(eloSd*Math.sqrt(2*Math.PI))*Math.exp(-((x+25-eloMean)**2)/(2*eloSd**2))*10)/10,
  }));

  const top10=sRows.slice().sort((a,b)=>pf(b[1])-pf(a[1])).slice(0,10).map((r,i)=>{
    const w=pi(r[3]),l=pi(r[4]);
    return{name:r[0],elo:Math.round(pf(r[1])),peak:Math.round(pf(r[7])),
      winrate:(w+l)>0?Math.round(w/(w+l)*100):0,games:pi(r[2]),rank:i+1};
  });

  const matchByMonth=new Map<string,Set<string>>();
  const eloByMonth=new Map<string,number[]>();
  const playerEloSnap=new Map<string,Map<string,number>>();
  for(const r of cRows){
    const d=parseDate(r[4]);if(!d)continue;
    const key=periodKey(d),mid=r[1]?.trim(),n=r[0]?.trim();
    if(mid){if(!matchByMonth.has(key))matchByMonth.set(key,new Set());matchByMonth.get(key)!.add(mid);}
    if(!eloByMonth.has(key))eloByMonth.set(key,[]);
    eloByMonth.get(key)!.push(pf(r[8]));
    if(n){if(!playerEloSnap.has(n))playerEloSnap.set(n,new Map());playerEloSnap.get(n)!.set(key,pf(r[8]));}
  }
  const activityHeatmap=[...matchByMonth.entries()].sort(([a],[b])=>a.localeCompare(b))
    .map(([k,mids])=>({period:k,label:periodLabel(k),count:mids.size}));
  const gamesOverTime=activityHeatmap.map(m=>({period:m.period,label:m.label,games:m.count}));

  const avgEloMonths=[...eloByMonth.entries()].sort(([a],[b])=>a.localeCompare(b))
    .map(([k,elos])=>({period:k,label:periodLabel(k),avgElo:Math.round(elos.reduce((a,b)=>a+b)/elos.length)}));
  const tXs=avgEloMonths.map((_,i)=>i),tYs=avgEloMonths.map(m=>m.avgElo);
  const{slope:tS,intercept:tI}=linreg(tXs,tYs);
  const avgEloTrend=avgEloMonths.map((m,i)=>({...m,trend:Math.round(tS*i+tI)}));

  // Median ELO trend — median of all player ELOs recorded in that month
  const medianEloTrend=[...eloByMonth.entries()].sort(([a],[b])=>a.localeCompare(b))
    .map(([k,elos])=>({period:k,label:periodLabel(k),medianElo:Math.round(median(elos))}));

  const wrValues=sRows.map(r=>{const w=pi(r[3]),l=pi(r[4]);return(w+l)>0?w/(w+l)*100:0;}).filter(w=>w>=0&&w<=100);
  const wrMean=wrValues.reduce((a,b)=>a+b,0)/(wrValues.length||1);
  const wrSd=stdDev(wrValues)||1;
  const wrBuckets=new Map<number,number>();
  for(const w of wrValues){const b=Math.floor(w/5)*5;wrBuckets.set(b,(wrBuckets.get(b)??0)+1);}
  const wrGaussNorm=wrValues.length*5;
  const winrateDistribution=[...wrBuckets.keys()].sort((a,b)=>a-b).map(x=>({
    bucket:`${x}%`,from:x,count:wrBuckets.get(x)??0,
    gauss:Math.round(wrGaussNorm/(wrSd*Math.sqrt(2*Math.PI))*Math.exp(-((x+2.5-wrMean)**2)/(2*wrSd**2))*10)/10,
  }));

  const eloVsGames=sRows.map(r=>({name:r[0],games:pi(r[2]),elo:Math.round(pf(r[1]))})).filter(d=>d.games>0);

  const top5names=sRows.slice().sort((a,b)=>pf(b[1])-pf(a[1])).slice(0,5).map(r=>r[0]);
  const top10names2=sRows.slice().sort((a,b)=>pf(b[1])-pf(a[1])).slice(0,10).map(r=>r[0]);
  const top15names=sRows.slice().sort((a,b)=>pf(b[1])-pf(a[1])).slice(0,15).map(r=>r[0]);
  const allMonths=[...new Set(cRows.map(r=>{const d=parseDate(r[4]);return d?periodKey(d):null;}).filter(Boolean) as string[])].sort();
  const top5History=allMonths.map(period=>{
    const obj:{period:string;label:string;[k:string]:number|string}={period,label:periodLabel(period)};
    for(const n of top5names){const m=playerEloSnap.get(n);if(m?.has(period))obj[n]=Math.round(m.get(period)!);}
    return obj;
  }).filter(row=>top5names.some(n=>row[n]!==undefined));
  const top10History=allMonths.map(period=>{
    const obj:{period:string;label:string;[k:string]:number|string}={period,label:periodLabel(period)};
    for(const n of top10names2){const m=playerEloSnap.get(n);if(m?.has(period))obj[n]=Math.round(m.get(period)!);}
    return obj;
  }).filter(row=>top10names2.some(n=>row[n]!==undefined));
  const top15History=allMonths.map(period=>{
    const obj:{period:string;label:string;[k:string]:number|string}={period,label:periodLabel(period)};
    for(const n of top15names){const m=playerEloSnap.get(n);if(m?.has(period))obj[n]=Math.round(m.get(period)!);}
    return obj;
  }).filter(row=>top15names.some(n=>row[n]!==undefined));

  // tournamentPie — use col D (tournament_detail) per unique Match ID
  const detailMids=new Map<string,Set<string>>();
  for(const r of cRows){
    const detail=(r[3]?.trim()||"Neznámý"),mid=r[1]?.trim();
    if(!detailMids.has(detail))detailMids.set(detail,new Set());
    if(mid)detailMids.get(detail)!.add(mid);
  }
  const tournamentPie=[...detailMids.entries()].map(([name,mids])=>({name,count:mids.size})).sort((a,b)=>b.count-a.count).slice(0,12);

  const heatData=new Map<string,number>();
  for(const r of cRows){const d=parseDate(r[4]);if(!d)continue;const key=`${d.getDay()}-${d.getHours()}`;heatData.set(key,(heatData.get(key)??0)+1);}
  const dowL=["Ne","Po","Út","St","Čt","Pá","So"];
  const matchFreqHeatmap:AnalyticsData["matchFreqHeatmap"]=[];
  for(let dow=0;dow<7;dow++)for(let hour=0;hour<24;hour++)matchFreqHeatmap.push({dow,hour,label:dowL[dow],count:heatData.get(`${dow}-${hour}`)??0});

  const giniMonths=[...new Set([...playerEloSnap.values()].flatMap(m=>[...m.keys()]))].sort();
  const giniOverTime=giniMonths.map(period=>{
    const elos=[...playerEloSnap.values()].map(m=>{const keys=[...m.keys()].filter(k=>k<=period).sort();return keys.length?m.get(keys[keys.length-1])!:null;}).filter(Boolean) as number[];
    return{period,label:periodLabel(period),gini:Math.round(giniCoeff(elos)*1000)/1000};
  });

  const deltaValues=cRows.map(r=>pf(r[7])).filter(d=>isFinite(d)&&d!==0);
  const deltaBuckets=new Map<number,number>();
  for(const d of deltaValues){const b=Math.floor(d/5)*5;deltaBuckets.set(b,(deltaBuckets.get(b)??0)+1);}
  const eloChangeDistribution=[...deltaBuckets.keys()].sort((a,b)=>a-b).map(x=>({x,bucket:`${x>=0?"+":""}${x}`,count:deltaBuckets.get(x)??0}));

  const matchPlayers=new Map<string,string[]>();
  for(const r of cRows){const mid=r[1]?.trim(),n=r[0]?.trim();if(!mid||!n)continue;if(!matchPlayers.has(mid))matchPlayers.set(mid,[]);if(!matchPlayers.get(mid)!.includes(n))matchPlayers.get(mid)!.push(n);}
  const pairCount=new Map<string,{a:string;b:string;count:number;winsA:number}>();
  for(const[mid,pl]of matchPlayers){
    if(pl.length<2)continue;
    const key=pl.slice().sort().join("|||");
    if(!pairCount.has(key))pairCount.set(key,{a:pl[0],b:pl[1],count:0,winsA:0});
    pairCount.get(key)!.count++;
    const row=cRows.find(r=>r[0]?.trim()===pl[0]&&r[1]?.trim()===mid);
    if(row?.[6]?.startsWith("Won"))pairCount.get(key)!.winsA++;
  }
  const topRiv=[...pairCount.values()].sort((a,b)=>b.count-a.count).slice(0,20);
  const netPlayers=new Set(topRiv.flatMap(r=>[r.a,r.b]));
  const pElo=new Map(sRows.map(r=>[r[0],Math.round(pf(r[1]))]));
  const pGames=new Map(sRows.map(r=>[r[0],pi(r[2])]));
  const rivalryNetwork={
    nodes:[...netPlayers].map(id=>({id,elo:pElo.get(id)??1500,games:pGames.get(id)??0})),
    links:topRiv.map(r=>({source:r.a,target:r.b,games:r.count,winner:r.winsA>r.count/2?r.a:r.b})),
  };

  const playerCardsSorted=new Map<string,string[][]>();
  for(const r of cRows){const n=r[0]?.trim();if(!n)continue;if(!playerCardsSorted.has(n))playerCardsSorted.set(n,[]);playerCardsSorted.get(n)!.push(r);}
  const gameNumElos=new Map<number,number[]>();
  for(const[,rows]of playerCardsSorted){
    rows.sort((a,b)=>pi(a[1])-pi(b[1]));
    rows.forEach((r,idx)=>{const gn=idx+1;if(gn<=30){if(!gameNumElos.has(gn))gameNumElos.set(gn,[]);gameNumElos.get(gn)!.push(pf(r[8]));}});
  }
  const newPlayerTrajectory=Array.from({length:30},(_,i)=>{const elos=gameNumElos.get(i+1)??[];return{gameNum:i+1,avgElo:elos.length?Math.round(elos.reduce((a,b)=>a+b)/elos.length):0};}).filter(p=>p.avgElo>0);

  const top10names=sRows.slice().sort((a,b)=>pf(b[1])-pf(a[1])).slice(0,10).map(r=>r[0]);
  const recentMonths=allMonths.slice(-12);
  const bumpsChart=recentMonths.map(period=>{
    const eloAtP=new Map<string,number>();
    for(const n of top10names){const m=playerEloSnap.get(n);if(!m)continue;const vk=[...m.keys()].filter(k=>k<=period).sort();if(vk.length)eloAtP.set(n,m.get(vk[vk.length-1])!);}
    const ranked=[...eloAtP.entries()].sort(([,a],[,b])=>b-a);
    const obj:{period:string;label:string;[k:string]:number|string}={period,label:periodLabel(period)};
    ranked.forEach(([name],rank)=>{obj[name]=rank+1;});
    return obj;
  });

  // ── Community Winrate vs. Opp ELO ──────────────────────────────────────────
  // Deduplicate: one record per match (lower matchId row wins tie by player name sort)
  const seenMids=new Set<string>();
  const dedupRows:string[][]=[];
  for(const r of [...cRows].sort((a,b)=>a[0]?.localeCompare(b[0]??"")?? 0)){
    const mid=r[1]?.trim(); if(!mid||seenMids.has(mid))continue; seenMids.add(mid); dedupRows.push(r);
  }
  // Theoretical WR uses constant 1135 (DC ELO design: 200pt diff → ~60%, not 76%)
  const sigmoid=(diff:number)=>Math.round(1/(1+Math.pow(10,-diff/1135))*100*10)/10;

  // Variant B: by absolute opponent ELO buckets of 50
  const oppEloBuckets=new Map<number,{w:number;d:number;l:number;diffs:number[]}>();
  for(const r of dedupRows){
    const oe=oppEloFn(r[5]??"");const delta=pf(r[7]);const myE=pf(r[8])-delta;
    if(!oe||!isFinite(myE))continue;
    const b=Math.floor(oe/50)*50;const v=oppEloBuckets.get(b)??{w:0,d:0,l:0,diffs:[]};
    const res=r[6]?.trim()??"";
    if(res.startsWith("Won"))v.w++;else if(res.startsWith("Lost"))v.l++;else v.d++;
    v.diffs.push(oe-myE);
    oppEloBuckets.set(b,v);
  }
  const byOppElo=[...oppEloBuckets.entries()]
    .filter(([,v])=>v.w+v.d+v.l>=5)
    .sort(([a],[b])=>a-b)
    .map(([b,v])=>{
      const games=v.w+v.d+v.l;
      const winrate=(v.w+v.l)>0?Math.round(v.w/(v.w+v.l)*100*10)/10:0;
      const avgEloDiff=Math.round(v.diffs.reduce((a,c)=>a+c,0)/v.diffs.length);
      return{bucket:b,label:`${b}–${b+49}`,games,wins:v.w,draws:v.d,losses:v.l,winrate,avgEloDiff,theorWR:sigmoid(-avgEloDiff)};
    });

  // Variant C: by ELO diff (my ELO − opp ELO), buckets of 50
  const eloDiffBuckets=new Map<number,{w:number;d:number;l:number}>();
  for(const r of dedupRows){
    const oe=oppEloFn(r[5]??"");const delta=pf(r[7]);const myE=pf(r[8])-delta;
    if(!oe||!isFinite(myE))continue;
    const diff=myE-oe; const b=Math.floor(diff/50)*50;
    const v=eloDiffBuckets.get(b)??{w:0,d:0,l:0};
    const res=r[6]?.trim()??"";
    if(res.startsWith("Won"))v.w++;else if(res.startsWith("Lost"))v.l++;else v.d++;
    eloDiffBuckets.set(b,v);
  }
  const byEloDiff=[...eloDiffBuckets.entries()]
    .filter(([,v])=>v.w+v.d+v.l>=5)
    .sort(([a],[b])=>a-b)
    .map(([b,v])=>{
      const games=v.w+v.d+v.l;
      const winrate=(v.w+v.l)>0?Math.round(v.w/(v.w+v.l)*100*10)/10:0;
      return{bucket:b,label:b>=0?`+${b}`:`${b}`,games,winrate,theorWR:sigmoid(b+25)};
    });

  // Variant A: scatter sample (max 2000 pts to keep perf)
  const allScatter=dedupRows.map(r=>{
    const oe=oppEloFn(r[5]??"");const delta=pf(r[7]);const myE=pf(r[8])-delta;
    if(!oe||!isFinite(myE))return null;
    const res=r[6]?.trim()??"";
    const result=res.startsWith("Won")?1:res.startsWith("Lost")?0:0.5;
    return{oppElo:Math.round(oe),myElo:Math.round(myE),eloDiff:Math.round(myE-oe),result};
  }).filter(Boolean) as {oppElo:number;myElo:number;eloDiff:number;result:number}[];
  // Sample evenly if too many
  const scatter=allScatter.length>2000
    ? allScatter.filter((_,i)=>i%Math.ceil(allScatter.length/2000)===0)
    : allScatter;

  const avgCommunityEloVal=sRows.length>0?Math.round(sRows.reduce((s,r)=>s+pf(r[1]),0)/sRows.length):1500;
  const communityWinrateVsOpp={byOppElo,byEloDiff,scatter,avgCommunityElo:avgCommunityEloVal};

  return{eloHistogram,top10,activityHeatmap,avgEloTrend,medianEloTrend,winrateDistribution,eloVsGames,gamesOverTime,top5History,top10History,top15History,tournamentPie,matchFreqHeatmap,giniOverTime,eloChangeDistribution,rivalryNetwork,newPlayerTrajectory,bumpsChart,communityWinrateVsOpp};
}

// ── PLAYER LIST ────────────────────────────────────────────────────────────────
export async function fetchPlayerList(mode:"ELO"|"DCPR"): Promise<string[]> {
  const rows=await sheet(mode==="ELO"?"Elo standings":"Tournament_Elo");
  return rows.slice(1).filter(r=>r[0]?.trim()).map(r=>r[0].trim()).sort();
}


// ── PLAYER DETAIL ──────────────────────────────────────────────────────────────
export async function fetchPlayerDetail(mode:"ELO"|"DCPR",playerName:string): Promise<PlayerDetailData|null> {
  const cSheet=mode==="ELO"?"Player cards (CSV)":"Player cards (CSV) - Tournament";
  const sumSheet=mode==="ELO"?"Player summary":"Player summary - Tournament";
  const [allCards,summary]=await Promise.all([sheet(cSheet),sheet(sumSheet)]);
  const allCRows=allCards.slice(1).filter(r=>r[0]?.trim());
  const pCards=allCRows.filter(r=>r[0]?.trim()===playerName);
  if(!pCards.length) return null;

  pCards.sort((a,b)=>{
    const da=parseDate(a[4])?.getTime()??0,db=parseDate(b[4])?.getTime()??0;
    return da!==db?da-db:pi(a[1])-pi(b[1]);
  });

  const sumRow=summary.slice(1).find(r=>r[0]?.trim()===playerName)??[];
  const now=new Date();
  const ago7=new Date(now.getTime()-7*86400_000);
  const ago30=new Date(now.getTime()-30*86400_000);

  const elos=pCards.map(r=>pf(r[8]));
  const deltas=pCards.map(r=>pf(r[7]));
  const results=pCards.map(r=>r[6]?.trim()??"");
  const dates=pCards.map(r=>parseDate(r[4]));
  const totalGames=pCards.length;
  const wins=results.filter(r=>r.startsWith("Won")).length;
  const losses=results.filter(r=>r.startsWith("Lost")).length;
  const draws=results.filter(r=>r.startsWith("Draw")).length;

  const currentElo=pf(sumRow[1]??"0")||(elos[elos.length-1]??1500);
  const peakElo=pf(sumRow[2]??"0")||Math.max(...elos);
  const minElo=pf(sumRow[3]??"0")||Math.min(...elos.filter(e=>e>0));
  const lastMatch=sumRow[9]??pCards[pCards.length-1]?.[4]??"";

  const games7d=pCards.filter(r=>{const d=parseDate(r[4]);return d&&d>=ago7;}).length;
  const games30d=pCards.filter(r=>{const d=parseDate(r[4]);return d&&d>=ago30;}).length;
  const eloChange7d=Math.round(pCards.filter(r=>{const d=parseDate(r[4]);return d&&d>=ago7;}).reduce((s,r)=>s+pf(r[7]),0));
  const eloChange30d=Math.round(pCards.filter(r=>{const d=parseDate(r[4]);return d&&d>=ago30;}).reduce((s,r)=>s+pf(r[7]),0));

  const winD=pCards.filter(r=>r[6]?.startsWith("Won")).map(r=>pf(r[7]));
  const lossD=pCards.filter(r=>r[6]?.startsWith("Lost")).map(r=>pf(r[7]));
  const avgDelta=totalGames>0?Math.round(deltas.reduce((a,b)=>a+b)/totalGames*10)/10:0;
  const avgWinDelta=winD.length?Math.round(winD.reduce((a,b)=>a+b)/winD.length*10)/10:0;
  const avgLossDelta=lossD.length?Math.round(lossD.reduce((a,b)=>a+b)/lossD.length*10)/10:0;
  const ev=Math.round((avgWinDelta*(wins/totalGames||0)+avgLossDelta*(losses/totalGames||0))*10)/10;
  const maxDI=deltas.indexOf(Math.max(...deltas));
  const minDI=deltas.indexOf(Math.min(...deltas));

  // Streaks
  let maxWin=0,maxLose=0,curW=0,curL=0,wSI=0,lSI=0,twS=0,tlS=0,wEI=0,lEI=0;
  for(let i=0;i<results.length;i++){
    const r=results[i];
    if(r.startsWith("Won")){curW++;curL=0;if(curW===1)twS=i;if(curW>maxWin){maxWin=curW;wSI=twS;wEI=i;}}
    else if(r.startsWith("Lost")){curL++;curW=0;if(curL===1)tlS=i;if(curL>maxLose){maxLose=curL;lSI=tlS;lEI=i;}}
    else{curW=0;curL=0;}
  }
  let currentStreakLen=0,currentStreakType:"win"|"lose"|"draw"="draw";
  for(let i=results.length-1;i>=0;i--){
    if(i===results.length-1){currentStreakType=results[i].startsWith("Won")?"win":results[i].startsWith("Lost")?"lose":"draw";currentStreakLen=1;}
    else{if(currentStreakType==="win"&&results[i].startsWith("Won"))currentStreakLen++;else if(currentStreakType==="lose"&&results[i].startsWith("Lost"))currentStreakLen++;else break;}
  }

  // Stability / Momentum / Consistency
  const sdD=stdDev(deltas);
  const stabilityIndex=Math.round(Math.max(0,100-sdD*2));
  const last20=results.slice(-20);
  const momentumIndex=Math.round(last20.filter(r=>r.startsWith("Won")).length/Math.max(last20.length,1)*100);
  const blocks:string[][]=[];for(let i=0;i<results.length;i+=10)blocks.push(results.slice(i,i+10));
  const blockWRs=blocks.filter(b=>b.length===10).map(b=>b.filter(r=>r.startsWith("Won")).length/10*100);
  const consistencyScore=blockWRs.length>=5?Math.round(Math.max(0,100-stdDev(blockWRs)*3)):0;

  // Vs opponent ELO brackets
  const vsW=pCards.filter(r=>{const myE=pf(r[8])-pf(r[7]),oe=oppEloFn(r[5]??"");return oe>0&&oe<myE-100;});
  const vsS=pCards.filter(r=>{const myE=pf(r[8])-pf(r[7]),oe=oppEloFn(r[5]??"");return oe>0&&Math.abs(oe-myE)<=100;});
  const vsStr=pCards.filter(r=>{const myE=pf(r[8])-pf(r[7]),oe=oppEloFn(r[5]??"");return oe>0&&oe>myE+100;});
  const wrf=(arr:string[][])=>{const w=arr.filter(r=>r[6]?.startsWith("Won")).length,l=arr.filter(r=>r[6]?.startsWith("Lost")).length;return(w+l)>0?Math.round(w/(w+l)*100):0;};
  const bigUpsets=pCards.filter(r=>{const myE=pf(r[8])-pf(r[7]),oe=oppEloFn(r[5]??"");return r[6]?.startsWith("Won")&&oe>myE+150;});

  // Biggest upset / hardest loss ELO
  const winElos=pCards.filter(r=>r[6]?.startsWith("Won")).map(r=>oppEloFn(r[5]??"")).filter(e=>e>0);
  const lossElos=pCards.filter(r=>r[6]?.startsWith("Lost")).map(r=>oppEloFn(r[5]??"")).filter(e=>e>0);

  // Opponents map
  const oppMap=new Map<string,{wins:number;losses:number;draws:number;games:number;deltaSum:number;lastDate:string}>();
  for(let i=0;i<pCards.length;i++){
    const on=oppName(pCards[i][5]??"");if(!on)continue;
    const v=oppMap.get(on)??{wins:0,losses:0,draws:0,games:0,deltaSum:0,lastDate:""};
    v.games++;v.deltaSum+=deltas[i];
    if(results[i].startsWith("Won"))v.wins++;else if(results[i].startsWith("Lost"))v.losses++;else v.draws++;
    if(dates[i]&&pCards[i][4]>v.lastDate)v.lastDate=pCards[i][4];
    oppMap.set(on,v);
  }
  const sortedOpps=[...oppMap.entries()].sort(([,a],[,b])=>b.games-a.games);
  const top5Opps=sortedOpps.filter(([,v])=>v.games>=3).sort(([,a],[,b])=>b.wins/b.games-a.wins/a.games);
  const bot5Opps=sortedOpps.filter(([,v])=>v.games>=3).sort(([,a],[,b])=>a.wins/a.games-b.wins/b.games);
  const avgOppElo=pCards.map(r=>oppEloFn(r[5]??"")).filter(e=>e>0).reduce((s,e,_,a)=>s+e/a.length,0);

  // Tournament perf
  const tMap=new Map<string,{sum:number;wins:number;losses:number;draws:number}>();
  for(let i=0;i<pCards.length;i++){
    const tType=pCards[i][2]?.trim();const tid=tType==="FNM"?`${pCards[i][3]?.trim()} ${pCards[i][4]?.trim()}`.trim():pCards[i][3]?.trim()??"";if(!tid)continue;
    const v=tMap.get(tid)??{sum:0,wins:0,losses:0,draws:0};
    v.sum+=deltas[i];
    if(results[i].startsWith("Won"))v.wins++;else if(results[i].startsWith("Lost"))v.losses++;else v.draws++;
    tMap.set(tid,v);
  }

  // Streaks list for timeline
  const streakList:{type:"win"|"lose";length:number;startDate:string}[]=[];
  let curST:"win"|"lose"|null=null,curSLen=0,curSSt=0;
  for(let i=0;i<=results.length;i++){
    const r=i<results.length?results[i]:"";
    const iW=r.startsWith("Won"),iL=r.startsWith("Lost");
    if(curST==="win"&&iW){curSLen++;continue;}
    if(curST==="lose"&&iL){curSLen++;continue;}
    if(curST&&curSLen>=2)streakList.push({type:curST,length:curSLen,startDate:pCards[curSSt]?.[4]??""});
    curST=iW?"win":iL?"lose":null;curSSt=i;curSLen=curST?1:0;
  }

  // Charts data
  const eloTrend=pCards.map(r=>({date:r[4]?.trim()??"",elo:Math.round(pf(r[8])),delta:Math.round(pf(r[7])),result:r[6]?.trim()??"",opponent:oppName(r[5]??"")}));

  const rollingMomentum=pCards.slice(19).map((_,i)=>({gameIndex:i+20,momentum:Math.round(results.slice(i,i+20).filter(r=>r.startsWith("Won")).length/20*100)}));

  const dhB=new Map<number,number>();for(const d of deltas){const b=Math.floor(d/5)*5;dhB.set(b,(dhB.get(b)??0)+1);}
  const deltaDistribution=[...dhB.keys()].sort((a,b)=>a-b).map(x=>({bucket:`${x>=0?"+":""}${x}`,count:dhB.get(x)??0,positive:x>=0}));

  const wdMap=new Map<number,{w:number;l:number;t:number}>();
  for(let i=0;i<pCards.length;i++){const d=dates[i];if(!d)continue;const v=wdMap.get(d.getDay())??{w:0,l:0,t:0};v.t++;if(results[i].startsWith("Won"))v.w++;else if(results[i].startsWith("Lost"))v.l++;wdMap.set(d.getDay(),v);}
  const dayNames=["Neděle","Pondělí","Úterý","Středa","Čtvrtek","Pátek","Sobota"];
  const shortDays=["Ne","Po","Út","St","Čt","Pá","So"];
  const weekdayPerf=[0,1,2,3,4,5,6].map(dow=>{const v=wdMap.get(dow)??{w:0,l:0,t:0};return{day:dayNames[dow],shortDay:shortDays[dow],games:v.t,winrate:(v.w+v.l)>0?Math.round(v.w/(v.w+v.l)*100):0};});

  const wrVBuckets=new Map<number,{w:number;l:number;t:number}>();
  for(let i=0;i<pCards.length;i++){const oe=oppEloFn(pCards[i][5]??"");if(!oe)continue;const b=Math.floor(oe/50)*50;const v=wrVBuckets.get(b)??{w:0,l:0,t:0};v.t++;if(results[i].startsWith("Won"))v.w++;else if(results[i].startsWith("Lost"))v.l++;wrVBuckets.set(b,v);}
  const winrateVsOpp=[...wrVBuckets.keys()].sort((a,b)=>a-b).map(b=>{const bv=wrVBuckets.get(b)!;return{bucket:`${b}`,wr:(bv.w+bv.l)>0?Math.round(bv.w/(bv.w+bv.l)*100):0,games:bv.t};});

  const opponents=sortedOpps.slice(0,30).map(([name,v])=>({name,games:v.games,wins:v.wins,losses:v.losses,draws:v.draws,winrate:(v.wins+v.losses)>0?Math.round(v.wins/(v.wins+v.losses)*100):0,avgDelta:Math.round(v.deltaSum/v.games),lastDate:v.lastDate}));
  const tournamentPerf=[...tMap.entries()].sort(([,a],[,b])=>Math.abs(b.sum)-Math.abs(a.sum)).slice(0,20).map(([name,v])=>({name:name.length>30?name.slice(0,30)+"…":name,games:v.wins+v.losses+v.draws,wins:v.wins,losses:v.losses,totalDelta:Math.round(v.sum),avgDelta:v.wins+v.losses+v.draws>0?Math.round(v.sum/(v.wins+v.losses+v.draws)):0}));

  const matchHistory=[...pCards].reverse().map(r=>{
    const delta=pf(r[7]);
    const myEloAfter=pf(r[8]);
    const myEloBefore=myEloAfter-delta;
    const res=r[6]?.trim()??"";
    return{
      matchId:r[1]?.trim()??"",
      date:r[4]?.trim()??"",
      tournament:r[2]?.trim()==="FNM"?`${r[3]?.trim()??""} ${r[4]?.trim()??""}`.trim():r[3]?.trim()??"",
      tournamentType:r[2]?.trim()??"",
      opponent:oppName(r[5]??""),
      opponentElo:oppEloFn(r[5]??""),
      myEloBefore:Math.round(myEloBefore),
      myEloAfter:Math.round(myEloAfter),
      delta:Math.round(delta),
      result:(res.startsWith("Won")?"Won":res.startsWith("Lost")?"Lost":"Draw") as "Won"|"Lost"|"Draw",
      resultDetail:res,
    };
  });

  // ── ELO trend by date (last game ELO per day) ──
  const dateEloMap=new Map<string,number>();
  for(const r of pCards){const d=r[4]?.trim();if(d)dateEloMap.set(d,Math.round(pf(r[8])));}
  const eloTrendByDate=[...dateEloMap.entries()].sort(([a],[b])=>{const da=parseDate(a)?.getTime()??0,db=parseDate(b)?.getTime()??0;return da-db;}).map(([date,elo])=>({date,elo}));

  // ── NEW computed metrics ──

  // Aktivita
  const thisMon=new Date(now);thisMon.setDate(now.getDate()-((now.getDay()+6)%7));
  const lastMon=new Date(thisMon.getTime()-7*86400_000);
  const eloChangeThisWeek=Math.round(pCards.filter(r=>{const d=parseDate(r[4]);return d&&d>=thisMon;}).reduce((s,r)=>s+pf(r[7]),0));
  const eloChangeLastWeek=Math.round(pCards.filter(r=>{const d=parseDate(r[4]);return d&&d>=lastMon&&d<thisMon;}).reduce((s,r)=>s+pf(r[7]),0));
  const uniqueDates=new Set(pCards.map(r=>r[4]?.trim()).filter(Boolean));
  const avgGamesPerActiveDay=uniqueDates.size>0?Math.round(totalGames/uniqueDates.size*10)/10:0;
  const dowCount=new Map<number,number>();
  for(const r of pCards){const d=parseDate(r[4]);if(d)dowCount.set(d.getDay(),(dowCount.get(d.getDay())??0)+1);}
  const dayNames2=["Neděle","Pondělí","Úterý","Středa","Čtvrtek","Pátek","Sobota"];
  const bestDowE=[...dowCount.entries()].sort(([,a],[,b])=>b-a)[0];
  const bestDayOfWeek=bestDowE?dayNames2[bestDowE[0]]:"—";
  const validDts=dates.filter(Boolean) as Date[];
  const gaps2=validDts.slice(1).map((d,i)=>Math.floor((d.getTime()-validDts[i].getTime())/86400_000));
  const avgGapBetweenGames=gaps2.length?Math.round(gaps2.reduce((a,b)=>a+b)/gaps2.length*10)/10:0;
  const longestPause=gaps2.length?Math.max(...gaps2):0;

  // ELO změny
  const firstElo=elos[0]??1500;
  const eloEfficiencyRatio=totalGames>0?Math.round((currentElo-firstElo)/totalGames*100)/100:0;
  const monthlyMap2=new Map<string,{start:number;end:number}>();
  for(const r of pCards){const d=parseDate(r[4]);if(!d)continue;const k=periodKey(d),e=pf(r[8]);if(!monthlyMap2.has(k))monthlyMap2.set(k,{start:e,end:e});monthlyMap2.get(k)!.end=e;}
  const monthlyChanges2=[...monthlyMap2.values()].map(m=>m.end-m.start);
  const ladderClimbingRate=monthlyChanges2.length?Math.round(monthlyChanges2.reduce((a,b)=>a+b)/monthlyChanges2.length*10)/10:0;
  const grindEfficiency=totalGames>0?Math.round((currentElo-1500)/totalGames*100)/100:0;
  const last50=elos.slice(-50);
  const l50xs=last50.map((_,i)=>totalGames-last50.length+i);
  const{slope:cS,intercept:cI}=linreg(l50xs,last50);
  const eloCeilingEstimate=Math.round(cS*(totalGames+50)+cI);
  const last50mom=elos.slice(-50);
  const ma10=last50mom.map((_,i,arr)=>{if(i<9)return null;return arr.slice(i-9,i+1).reduce((s,e)=>s+e,0)/10;}).filter(Boolean) as number[];
  const d1m=ma10.slice(1).map((v,i)=>v-ma10[i]);
  const momentumAcceleration=d1m.length>=2?Math.round(d1m[d1m.length-1]-d1m[d1m.length-2]*100)/100:0;
  const avgOppEloAll=pCards.map(r=>oppEloFn(r[5]??"")).filter(e=>e>0).reduce((s,e,_,a)=>s+e/a.length,0);
  const performanceRating=Math.round(avgOppEloAll+400*(wins-losses)/(totalGames||1));
  let expWins2=0;
  for(let i=0;i<pCards.length;i++){const myE=elos[i]-deltas[i],oe=oppEloFn(pCards[i][5]??"");if(!oe)continue;expWins2+=1/(1+Math.pow(10,(oe-myE)/400));}
  const expectedWins=Math.round(expWins2*10)/10;
  const expectedWinDiff=Math.round((wins-expWins2)*10)/10;
  const trueSkillSigma=Math.round(350/Math.sqrt(totalGames+1));

  // Streaks extra
  let longestUnbeaten=0,curU3=0;
  for(const r of results){if(!r.startsWith("Lost")){curU3++;if(curU3>longestUnbeaten)longestUnbeaten=curU3;}else curU3=0;}
  const loseStreaks3:number[][]=[];let curLS3:number[]=[];
  for(let i=0;i<results.length;i++){if(results[i].startsWith("Lost"))curLS3.push(i);else{if(curLS3.length>=3)loseStreaks3.push([...curLS3]);curLS3=[];}}
  if(curLS3.length>=3)loseStreaks3.push(curLS3);
  const tiltRecs=loseStreaks3.map(ls=>{const post=results.slice(ls[ls.length-1]+1,ls[ls.length-1]+6);return post.length>0?post.filter(r=>r.startsWith("Won")).length/post.length*100:0;});
  const tiltRecovery=tiltRecs.length?Math.round(tiltRecs.reduce((a,b)=>a+b)/tiltRecs.length):0;
  const cbAttempts=loseStreaks3.map(ls=>{const eloStart=elos[ls[0]]??0;return elos.slice(ls[ls.length-1]+1).some(e=>e>=eloStart)?1:0;});
  const comebackRate=loseStreaks3.length>0?Math.round(cbAttempts.filter(Boolean).length/loseStreaks3.length*100):0;
  let biggestComeback=0;
  for(let i=0;i<elos.length;i++){let lMin=elos[i],lMI=i;for(let j=i+1;j<elos.length;j++){if(elos[j]<lMin){lMin=elos[j];lMI=j;}const cb=elos[j]-lMin;if(cb>biggestComeback)biggestComeback=cb;};if(lMI>i)i=lMI;}

  // Pokročilé indexy
  const postLossWRs=pCards.map((_,i)=>{if(!results[i].startsWith("Lost"))return null;const post=results.slice(i+1,i+6);return post.length?post.filter(r=>r.startsWith("Won")).length/post.length*100:null;}).filter(v=>v!==null) as number[];
  const tiltIndex=postLossWRs.length>=10?Math.round(postLossWRs.reduce((a,b)=>a+b)/postLossWRs.length):0;
  const chokeSit=pCards.filter((_,i)=>{if(i<3)return false;const myE=pf(pCards[i][8])-pf(pCards[i][7]),oe=oppEloFn(pCards[i][5]??"");return myE>oe+100&&results.slice(i-3,i).every(r=>r.startsWith("Won"));});
  const chokingIndex=chokeSit.length>0?Math.round(chokeSit.filter(r=>r[6]?.startsWith("Lost")).length/chokeSit.length*100):0;
  const cupSit=pCards.filter((_,i)=>{if(i<2)return false;const myE=pf(pCards[i][8])-pf(pCards[i][7]),oe=oppEloFn(pCards[i][5]??"");return oe>myE&&results.slice(i-2,i).every(r=>r.startsWith("Lost"));});
  const clutchUnderPressure=cupSit.length>0?Math.round(cupSit.filter(r=>r[6]?.startsWith("Won")).length/cupSit.length*100):0;
  const hhX=results.slice(0,-1).map(r=>r.startsWith("Won")?1:r.startsWith("Draw")?0.5:0);
  const hhY=results.slice(1).map(r=>r.startsWith("Won")?1:r.startsWith("Draw")?0.5:0);
  const hotHandEffect=Math.round(pearson(hhX,hhY)*100)/100;
  const posWR=new Map<number,{w:number;t:number}>();
  for(const ud of uniqueDates){const dg=pCards.filter(r=>r[4]?.trim()===ud);dg.forEach((r,pos)=>{const p=pos+1;const v=posWR.get(p)??{w:0,t:0};v.t++;if(r[6]?.startsWith("Won"))v.w++;posWR.set(p,v);});}
  const eWR=[1,2,3].reduce((s,p)=>{const v=posWR.get(p);return v?s+v.w/v.t:s;},0)/3;
  const lEntries=[...posWR.entries()].filter(([p])=>p>=4);
  const lWR=lEntries.length?lEntries.reduce((s,[,v])=>s+v.w/v.t,0)/lEntries.length:eWR;
  const fatigueIndex=Math.round((eWR-lWR)*100);
  const monthGains2=new Map<string,number>();
  for(let i=0;i<pCards.length;i++){const d=dates[i];if(!d)continue;monthGains2.set(periodKey(d),(monthGains2.get(periodKey(d))??0)+deltas[i]);}
  const bestME=[...monthGains2.entries()].reduce((b,e)=>e[1]>(b?.[1]??-Infinity)?e:b,null as [string,number]|null);
  const worstME=[...monthGains2.entries()].reduce((b,e)=>e[1]<(b?.[1]??Infinity)?e:b,null as [string,number]|null);

  // Soupeřský blok extra
  const eloBracketsArr=[
    {bracket:"<1400",min:0,max:1399},{bracket:"1400–1600",min:1400,max:1599},
    {bracket:"1600–1800",min:1600,max:1799},{bracket:"1800–2000",min:1800,max:1999},{bracket:">2000",min:2000,max:9999},
  ].map(b=>{
    const rows=pCards.filter(r=>{const oe=oppEloFn(r[5]??"");return oe>=b.min&&oe<=b.max;});
    const bW=rows.filter(r=>r[6]?.startsWith("Won")).length;
    const bD=rows.map(r=>pf(r[7]));
    return{bracket:b.bracket,games:rows.length,winrate:rows.length>0?Math.round(bW/rows.length*100):0,avgDelta:bD.length?Math.round(bD.reduce((a,b)=>a+b)/bD.length):0};
  });
  let oqaN=0,oqaD=0;
  for(let i=0;i<pCards.length;i++){const oe=oppEloFn(pCards[i][5]??"");if(!oe)continue;oqaN+=(results[i].startsWith("Won")?1:0)*oe;oqaD+=oe;}
  const oqaWR=oqaD>0?Math.round(oqaN/oqaD*100*10)/10:0;
  const upsetWins=pCards.filter((r,i)=>{const myE=elos[i]-deltas[i],oe=oppEloFn(r[5]??"");return results[i].startsWith("Won")&&oe>myE;});
  const upsetFactor=upsetWins.length?Math.round(upsetWins.reduce((s,r,i)=>s+(oppEloFn(r[5]??"")-(elos[upsetWins.indexOf(r)]-deltas[upsetWins.indexOf(r)])),0)/upsetWins.length):0;
  const oppRatings=[...oppMap.entries()].filter(([,v])=>v.games>=3).map(([name,v])=>({name,wr:v.wins/v.games*100,games:v.games,nemR:(v.losses/v.games)*(v.games/totalGames)*100,preyR:(v.wins/v.games)*(v.games/totalGames)*100}));
  const nemesis=oppRatings.reduce((b,o)=>o.nemR>(b?.nemR??0)?o:b,null as typeof oppRatings[0]|null);
  const prey=oppRatings.reduce((b,o)=>o.preyR>(b?.preyR??0)?o:b,null as typeof oppRatings[0]|null);

  // Bayesian WR
  const z=1.96,nW=totalGames,wW=wins;
  const center=nW>0?(wW/nW+z*z/(2*nW))/(1+z*z/nW):0;
  const marginB=nW>0?z*Math.sqrt((wW/nW*(1-wW/nW)+z*z/(4*nW))/(1+z*z/nW)):0;
  const bayesianWR=`${Math.round(center*100)}% (±${Math.round(marginB*100)}%)`;

  // Days since peak
  const peakIdx=elos.indexOf(Math.max(...elos));
  const peakDateP=parseDate(pCards[peakIdx]?.[4]??"");
  const daysSincePeak=peakDateP?Math.floor((now.getTime()-peakDateP.getTime())/86400_000):0;

  return {
    summary:{name:playerName,currentElo:Math.round(currentElo),peakElo:Math.round(peakElo),minElo:Math.round(minElo),wins,losses,draws,winrate:(wins+losses)>0?wins/(wins+losses):0,lastMatch,totalGames,avgOppElo:Math.round(avgOppEloAll),longestWinStreak:maxWin,longestLoseStreak:maxLose,daysSincePeak,bayesianWR},
    computed:{
      eloRange:Math.round(peakElo-minElo),peakRetention:peakElo>0?Math.round(currentElo/peakElo*100):0,
      games7d,games30d,eloChange7d,eloChange30d,avgDelta,avgWinDelta,avgLossDelta,ev,
      biggestSingleGain:Math.round(deltas[maxDI]??0),biggestSingleLoss:Math.round(deltas[minDI]??0),
      currentStreak:{type:currentStreakType,length:currentStreakLen},
      stabilityIndex,momentumIndex,consistencyScore,
      clutchFactor:vsStr.length>0?wrf(vsStr):0,
      upsetRate:totalGames>0?Math.round(bigUpsets.length/totalGames*100):0,
      gainLossRatio:avgLossDelta!==0?Math.round(Math.abs(avgWinDelta/avgLossDelta)*100)/100:0,
      winVsWeaker:wrf(vsW),winVsSimilar:wrf(vsS),winVsStronger:wrf(vsStr),
      biggestUpset:winElos.length?Math.max(...winElos):0,
      hardestLoss:lossElos.length?Math.max(...lossElos):0,
      mostPlayedOpponent:sortedOpps[0]?{name:sortedOpps[0][0],games:sortedOpps[0][1].games,winrate:(sortedOpps[0][1].wins+sortedOpps[0][1].losses)>0?Math.round(sortedOpps[0][1].wins/(sortedOpps[0][1].wins+sortedOpps[0][1].losses)*100):0}:{name:"—",games:0,winrate:0},
      bestOpponent:top5Opps[0]?{name:top5Opps[0][0],winrate:(top5Opps[0][1].wins+top5Opps[0][1].losses)>0?Math.round(top5Opps[0][1].wins/(top5Opps[0][1].wins+top5Opps[0][1].losses)*100):0}:{name:"—",winrate:0},
      worstOpponent:bot5Opps[0]?{name:bot5Opps[0][0],winrate:(bot5Opps[0][1].wins+bot5Opps[0][1].losses)>0?Math.round(bot5Opps[0][1].wins/(bot5Opps[0][1].wins+bot5Opps[0][1].losses)*100):0}:{name:"—",winrate:0},
      eloChangeThisWeek,eloChangeLastWeek,avgGamesPerActiveDay,bestDayOfWeek,avgGapBetweenGames,longestPause,
      eloEfficiencyRatio,ladderClimbingRate,grindEfficiency,momentumAcceleration,eloCeilingEstimate,
      performanceRating,expectedWins,expectedWinDiff,trueSkillSigma,
      longestUnbeaten,tiltRecovery,comebackRate,biggestComeback:Math.round(biggestComeback),
      tiltIndex,chokingIndex,clutchUnderPressure,hotHandEffect,fatigueIndex,
      bestMonth:bestME?periodLabel(bestME[0]):"—",bestMonthGain:bestME?Math.round(bestME[1]):0,
      worstMonth:worstME?periodLabel(worstME[0]):"—",worstMonthLoss:worstME?Math.round(worstME[1]):0,
      upsetFactor,oqaWR,
      nemesis:nemesis?.name??"—",nemesisWR:Math.round(100-(nemesis?.wr??0)),
      prey:prey?.name??"—",preyWR:Math.round(prey?.wr??0),
      eloBrackets:eloBracketsArr,
    },
    eloTrend,eloTrendByDate,rollingMomentum,deltaDistribution,weekdayPerf,winrateVsOpp,opponents,tournamentPerf,streaks:streakList,matchHistory,
  };
}
export async function fetchRecords(mode:"ELO"|"DCPR", nameFilter?: (n: string) => boolean): Promise<RecordsData> {
  const sSheet=mode==="ELO"?"Elo standings":"Tournament_Elo";
  const cSheet=mode==="ELO"?"Player cards (CSV)":"Player cards (CSV) - Tournament";
  const[standings,cards]=await Promise.all([sheet(sSheet),sheet(cSheet)]);
  const sRows=standings.slice(1).filter(r=>{const n=r[0]?.trim();return n&&(!nameFilter||nameFilter(n));});
  const cRows=cards.slice(1).filter(r=>{const n=r[0]?.trim();return n&&(!nameFilter||nameFilter(n));});
  const fmt=(n:number)=>Math.round(n).toLocaleString("cs-CZ");
  const fmtS=(n:number)=>(n>=0?"+":"")+fmt(n);
  const minG=mode==="ELO"?50:20;

  // Build per-player aggregates
  type PAgg={name:string;cards:string[][];elos:number[];deltas:number[];results:string[];dates:(Date|null)[];currentElo:number;peakElo:number;minElo:number;totalGames:number;wins:number;losses:number;winrate:number;sumDelta:number;avgDelta:number;stabilityIdx:number;oqaWR:number;expectedWins:number;maxWinStreak:number;maxLoseStreak:number;maxUnbeaten:number;activeWinStreak:number;winStreakStart:string;winStreakEnd:string;loseStreakStart:string;loseStreakEnd:string;biggestGainVal:number;biggestGainDate:string;biggestGainOpp:string;biggestGainTournament:string;biggestLossVal:number;biggestLossDate:string;biggestLossOpp:string;biggestLossTournament:string;bestDayGain:number;bestDayDate:string;worstDayLoss:number;worstDayLossDate:string;bestMonthGain:number;bestMonthLabel:string;worstMonthLoss:number;worstMonthLabel:string;maxGamesDay:number;maxGamesDayDate:string;maxGamesMonth:number;maxGamesMonthLabel:string;biggestComeback:number;comebackMinDate:string;comebackPeakDate:string;biggestUpset:number;biggestUpsetOpp:string;biggestUpsetDate:string;biggestUpsetTournament:string;avgOppElo:number;careerDays:number;firstGame:string;lastGame:string;longestContinuousActive:number;longestBreak:number;uniqueOpponents:number;mostPlayedOpp:string;mostPlayedOppGames:number;longestRivalryDays:number;longestRivalryOpp:string;uniqueTournaments:number;bestTournamentPerf:number;bestTournamentPerfLabel:string;bestTournamentGain:number;bestTournamentGainLabel:string;worstTournamentLoss:number;worstTournamentLossLabel:string;};

  const byPlayer=new Map<string,string[][]>();
  for(const r of cRows){const n=r[0]?.trim();if(!n)continue;if(!byPlayer.has(n))byPlayer.set(n,[]);byPlayer.get(n)!.push(r);}

  const aggs=new Map<string,PAgg>();
  for(const[name,rows]of byPlayer){
    rows.sort((a,b)=>{const da=parseDate(a[4])?.getTime()??0,db=parseDate(b[4])?.getTime()??0;return da!==db?da-db:pi(a[1])-pi(b[1]);});
    const elos=rows.map(r=>pf(r[8]));
    const deltas=rows.map(r=>pf(r[7]));
    const results=rows.map(r=>r[6]?.trim()??"");
    const dates=rows.map(r=>parseDate(r[4]));
    const wins=results.filter(r=>r.startsWith("Won")).length;
    const losses=results.filter(r=>r.startsWith("Lost")).length;
    const totalGames=rows.length;
    const winrate=(wins+losses)>0?wins/(wins+losses)*100:0;
    const sumDelta=deltas.reduce((a,b)=>a+b,0);
    const avgDelta=totalGames>0?sumDelta/totalGames:0;
    const currentElo=elos[elos.length-1]??0;
    const peakElo=Math.max(...elos);
    const minElo=Math.min(...elos.filter(e=>e>0));
    const sdD=stdDev(deltas);
    const stabilityIdx=Math.max(0,100-sdD*2);
    let oqaN=0,oqaD=0,expW=0;
    for(let i=0;i<rows.length;i++){const myE=elos[i]-deltas[i],oe=oppEloFn(rows[i][5]??"");if(!oe)continue;expW+=1/(1+Math.pow(10,(oe-myE)/400));oqaN+=(results[i].startsWith("Won")?1:0)*oe;oqaD+=oe;}
    const oqaWR=oqaD>0?oqaN/oqaD*100:0;
    let maxWin=0,maxLose=0,maxUnbeaten=0,curW=0,curL=0,curU=0,wSI=0,wEI=0,lSI=0,lEI=0,twS=0,tlS=0;
    for(let i=0;i<results.length;i++){const r=results[i];if(r.startsWith("Won")){curW++;curU++;curL=0;if(curW===1)twS=i;if(curW>maxWin){maxWin=curW;wSI=twS;wEI=i;}if(curU>maxUnbeaten)maxUnbeaten=curU;}else if(r.startsWith("Lost")){curL++;curW=0;curU=0;if(curL===1)tlS=i;if(curL>maxLose){maxLose=curL;lSI=tlS;lEI=i;}}else{curW=0;curU++;if(curU>maxUnbeaten)maxUnbeaten=curU;}}
    let activeWS=0;for(let i=results.length-1;i>=0;i--){if(results[i].startsWith("Won"))activeWS++;else break;}
    const dayMap=new Map<string,{sum:number;count:number}>();
    const monthMap=new Map<string,{sum:number;count:number}>();
    for(let i=0;i<rows.length;i++){const dt=rows[i][4]?.trim();if(!dt)continue;const v=dayMap.get(dt)??{sum:0,count:0};v.sum+=deltas[i];v.count++;dayMap.set(dt,v);const dd=dates[i];if(dd){const k=periodKey(dd);const mv=monthMap.get(k)??{sum:0,count:0};mv.sum+=deltas[i];mv.count++;monthMap.set(k,mv);}}
    let bDG=-Infinity,bDD="",wDL=Infinity,wDLD="",mGDay=0,mGDayD="";
    for(const[dt,{sum,count}]of dayMap){if(sum>bDG){bDG=sum;bDD=dt;}if(sum<wDL){wDL=sum;wDLD=dt;}if(count>mGDay){mGDay=count;mGDayD=dt;}}
    let bMG=-Infinity,bML="",wML2=Infinity,wML2L="",mGMo=0,mGMoL="";
    for(const[k,{sum,count}]of monthMap){const lbl=periodLabel(k);if(sum>bMG){bMG=sum;bML=lbl;}if(sum<wML2){wML2=sum;wML2L=lbl;}if(count>mGMo){mGMo=count;mGMoL=lbl;}}
    const maxDI=deltas.indexOf(Math.max(...deltas)),minDI=deltas.indexOf(Math.min(...deltas));
    let bigUpset=0,buOpp="",buDate="",buT="";
    for(let i=0;i<rows.length;i++){const myE=elos[i]-deltas[i],oe=oppEloFn(rows[i][5]??"");if(oe>0&&results[i].startsWith("Won")&&(oe-myE)>bigUpset){bigUpset=oe-myE;buOpp=oppName(rows[i][5]);buDate=rows[i][4];buT=`${rows[i][3]?.trim()} ${rows[i][4]?.trim()}`;}}
    const oea=rows.map(r=>oppEloFn(r[5]??"")).filter(e=>e>0);
    const avgOE=oea.length?oea.reduce((a,b)=>a+b)/oea.length:0;
    const vd=dates.filter(Boolean) as Date[];
    const cD2=vd.length>=2?Math.floor((vd[vd.length-1].getTime()-vd[0].getTime())/86400_000):0;
    let longestBreak=0,longestCA=0,tmpCA=0;
    for(let i=1;i<vd.length;i++){const gap=Math.floor((vd[i].getTime()-vd[i-1].getTime())/86400_000);if(gap>longestBreak)longestBreak=gap;if(gap<=30){tmpCA+=gap;if(tmpCA>longestCA)longestCA=tmpCA;}else tmpCA=0;}
    let bigCB=0,cbMD="",cbPD="";
    for(let i=0;i<elos.length;i++){let lMin=elos[i],lMI=i;for(let j=i+1;j<elos.length;j++){if(elos[j]<lMin){lMin=elos[j];lMI=j;}const cb=elos[j]-lMin;if(cb>bigCB){bigCB=cb;cbMD=rows[lMI]?.[4]??"";cbPD=rows[j]?.[4]??"";}};if(lMI>i)i=lMI;}
    const oppM=new Map<string,{games:number;dates:Date[]}>();
    for(let i=0;i<rows.length;i++){const on=oppName(rows[i][5]??"");if(!on)continue;const v=oppM.get(on)??{games:0,dates:[]};v.games++;if(dates[i])v.dates.push(dates[i]!);oppM.set(on,v);}
    let mPOpp="",mPG=0,lRD=0,lRO="";
    for(const[on,v]of oppM){if(v.games>mPG){mPG=v.games;mPOpp=on;}if(v.dates.length>=2){const span=Math.floor((v.dates[v.dates.length-1].getTime()-v.dates[0].getTime())/86400_000);if(span>lRD){lRD=span;lRO=on;}}}
    const tM=new Map<string,{sum:number;wins:number;losses:number;oppElos:number[]}>();
    for(let i=0;i<rows.length;i++){const tid=`${rows[i][3]?.trim()} ${rows[i][4]?.trim()}`.trim();if(!tid)continue;const v=tM.get(tid)??{sum:0,wins:0,losses:0,oppElos:[]};v.sum+=deltas[i];if(results[i].startsWith("Won"))v.wins++;else if(results[i].startsWith("Lost"))v.losses++;const oe=oppEloFn(rows[i][5]??"");if(oe>0)v.oppElos.push(oe);tM.set(tid,v);}
    let bTP=-Infinity,bTPL="",bTG=-Infinity,bTGL="",wTL=Infinity,wTLL="";
    for(const[tid,v]of tM){const n2=v.wins+v.losses;if(n2>=3){const ao=v.oppElos.length?v.oppElos.reduce((a,b)=>a+b)/v.oppElos.length:0;const pf2=ao+400*(v.wins-v.losses)/n2;if(pf2>bTP){bTP=pf2;bTPL=tid;}}if(v.sum>bTG){bTG=v.sum;bTGL=tid;}if(v.sum<wTL){wTL=v.sum;wTLL=tid;}}
    aggs.set(name,{name,cards:rows,elos,deltas,results,dates,currentElo,peakElo,minElo,totalGames,wins,losses,winrate,sumDelta:Math.round(sumDelta),avgDelta:Math.round(avgDelta*10)/10,stabilityIdx:Math.round(stabilityIdx),oqaWR:Math.round(oqaWR*10)/10,expectedWins:Math.round(expW*10)/10,maxWinStreak:maxWin,maxLoseStreak:maxLose,maxUnbeaten,activeWinStreak:activeWS,winStreakStart:rows[wSI]?.[4]??"",winStreakEnd:rows[wEI]?.[4]??"",loseStreakStart:rows[lSI]?.[4]??"",loseStreakEnd:rows[lEI]?.[4]??"",biggestGainVal:Math.round(deltas[maxDI]??0),biggestGainDate:rows[maxDI]?.[4]??"",biggestGainOpp:oppName(rows[maxDI]?.[5]??""),biggestGainTournament:`${rows[maxDI]?.[3]?.trim()??""} ${rows[maxDI]?.[4]?.trim()??""}}`.trim(),biggestLossVal:Math.round(deltas[minDI]??0),biggestLossDate:rows[minDI]?.[4]??"",biggestLossOpp:oppName(rows[minDI]?.[5]??""),biggestLossTournament:`${rows[minDI]?.[3]?.trim()??""} ${rows[minDI]?.[4]?.trim()??""}}`.trim(),bestDayGain:Math.round(isFinite(bDG)?bDG:0),bestDayDate:bDD,worstDayLoss:Math.round(isFinite(wDL)?wDL:0),worstDayLossDate:wDLD,bestMonthGain:Math.round(isFinite(bMG)?bMG:0),bestMonthLabel:bML,worstMonthLoss:Math.round(isFinite(wML2)?wML2:0),worstMonthLabel:wML2L,maxGamesDay:mGDay,maxGamesDayDate:mGDayD,maxGamesMonth:mGMo,maxGamesMonthLabel:mGMoL,biggestComeback:Math.round(bigCB),comebackMinDate:cbMD,comebackPeakDate:cbPD,biggestUpset:Math.round(bigUpset),biggestUpsetOpp:buOpp,biggestUpsetDate:buDate,biggestUpsetTournament:buT,avgOppElo:Math.round(avgOE),careerDays:cD2,firstGame:rows[0]?.[4]??"",lastGame:rows[rows.length-1]?.[4]??"",longestContinuousActive:longestCA,longestBreak,uniqueOpponents:oppM.size,mostPlayedOpp:mPOpp,mostPlayedOppGames:mPG,longestRivalryDays:lRD,longestRivalryOpp:lRO,uniqueTournaments:tM.size,bestTournamentPerf:isFinite(bTP)?Math.round(bTP):0,bestTournamentPerfLabel:bTPL,bestTournamentGain:isFinite(bTG)?Math.round(bTG):0,bestTournamentGainLabel:bTGL,worstTournamentLoss:isFinite(wTL)?Math.round(wTL):0,worstTournamentLossLabel:wTLL});
  }

  const aggsArr=[...aggs.values()];
  const maxBy=(key:keyof PAgg,minGames=0)=>aggsArr.filter(a=>a.totalGames>=minGames).reduce((b,a)=>(a[key] as number)>((b?.[key] as number)??-Infinity)?a:b,null as PAgg|null);
  const minBy=(key:keyof PAgg,minGames=0,minV=-Infinity)=>aggsArr.filter(a=>a.totalGames>=minGames&&(a[key] as number)>minV).reduce((b,a)=>(a[key] as number)<((b?.[key] as number)??Infinity)?a:b,null as PAgg|null);
  const e=(value:string,player?:string,detail?:string,detail2?:string,isAllTime?:boolean):RecordEntry=>({value,player,detail,detail2,isAllTime});

  // Community scan
  let cMaxG=0,cMaxGPl="",cMaxGDate="",cMaxGOpp="",cMaxGT="";
  let cMinL=0,cMinLPl="",cMinLDate="",cMinLOpp="",cMinLT="";
  let cUpDiff=0,cUpW="",cUpL="",cUpDate="",cUpT="";
  for(const r of cRows){const d=pf(r[7]),el=pf(r[8]),myE=el-d,oe=oppEloFn(r[5]??""),res=r[6]?.trim()??"",name=r[0]?.trim(),date=r[4]?.trim(),t=`${r[3]?.trim()} ${r[4]?.trim()}`;if(d>cMaxG){cMaxG=d;cMaxGPl=name;cMaxGDate=date;cMaxGOpp=oppName(r[5]??"");cMaxGT=t;}if(d<cMinL){cMinL=d;cMinLPl=name;cMinLDate=date;cMinLOpp=oppName(r[5]??"");cMinLT=t;}if(oe>0&&res.startsWith("Won")&&(oe-myE)>cUpDiff){cUpDiff=oe-myE;cUpW=name;cUpL=oppName(r[5]??"");cUpDate=date;cUpT=t;}}

  const commDayMids=new Map<string,Set<string>>();const commMonthMids=new Map<string,Set<string>>();
  for(const r of cRows){const dt=r[4]?.trim(),mid=r[1]?.trim(),d=parseDate(r[4]);if(dt&&mid){if(!commDayMids.has(dt))commDayMids.set(dt,new Set());commDayMids.get(dt)!.add(mid);}if(d&&mid){const k=periodKey(d);if(!commMonthMids.has(k))commMonthMids.set(k,new Set());commMonthMids.get(k)!.add(mid);}}
  let commMaxDay=0,commMaxDayDate="";for(const[dt,ms]of commDayMids)if(ms.size>commMaxDay){commMaxDay=ms.size;commMaxDayDate=dt;}
  let commMaxMonth=0,commMaxMonthLabel="";for(const[k,ms]of commMonthMids)if(ms.size>commMaxMonth){commMaxMonth=ms.size;commMaxMonthLabel=periodLabel(k);}

  const matchPl=new Map<string,{name:string;elo:number;date:string;t:string;result:string}[]>();
  for(const r of cRows){const mid=r[1]?.trim();if(!mid)continue;if(!matchPl.has(mid))matchPl.set(mid,[]);matchPl.get(mid)!.push({name:r[0]?.trim(),elo:pf(r[8])-pf(r[7]),date:r[4]?.trim(),t:`${r[3]?.trim()} ${r[4]?.trim()}`,result:r[6]?.trim()??""});}
  let bigMatchD=0,bigMatchA="",bigMatchAE=0,bigMatchB2="",bigMatchBE=0,bigMatchDate="",bigMatchT="";
  for(const[,pl]of matchPl){if(pl.length<2)continue;const diff=Math.abs(pl[0].elo-pl[1].elo);if(diff>bigMatchD){bigMatchD=diff;const[hi,lo]=pl[0].elo>pl[1].elo?[pl[0],pl[1]]:[pl[1],pl[0]];bigMatchA=hi.name;bigMatchAE=Math.round(hi.elo);bigMatchB2=lo.name;bigMatchBE=Math.round(lo.elo);bigMatchDate=pl[0].date;bigMatchT=pl[0].t;}}
  const pairMap=new Map<string,{a:string;b:string;count:number;aWins:number;bWins:number;draws:number}>();
  for(const[,pl]of matchPl){if(pl.length<2)continue;const key=[pl[0].name,pl[1].name].sort().join("|||");const res0=pl[0]?.result??"";const res1=pl[1]?.result??"";if(!pairMap.has(key))pairMap.set(key,{a:pl[0].name,b:pl[1].name,count:0,aWins:0,bWins:0,draws:0});const v=pairMap.get(key)!;v.count++;if(res0.startsWith("Won"))v.aWins++;else if(res1.startsWith("Won"))v.bWins++;else v.draws++;}
  const top5Riv=[...pairMap.values()].sort((a,b)=>b.count-a.count).slice(0,5);

  const commTMap=new Map<string,{mids:Set<string>;pElos:number[];pNames:Set<string>}>();
  for(const r of cRows){const tid=`${r[3]?.trim()} ${r[4]?.trim()}`.trim(),mid=r[1]?.trim();if(!tid||!mid)continue;if(!commTMap.has(tid))commTMap.set(tid,{mids:new Set(),pElos:[],pNames:new Set()});const v=commTMap.get(tid)!;v.mids.add(mid);const eb=pf(r[8])-pf(r[7]);if(eb>0){v.pElos.push(eb);v.pNames.add(r[0]?.trim());}}
  let bigTLabel="",bigTGames=0,bigTPl=0;let toughTLabel="",toughTAvg=0;
  for(const[tid,v]of commTMap){if(v.mids.size>bigTGames){bigTGames=v.mids.size;bigTLabel=tid;bigTPl=v.pNames.size;}const avg=v.pElos.length?v.pElos.reduce((a,b)=>a+b)/v.pElos.length:0;if(avg>toughTAvg){toughTAvg=avg;toughTLabel=tid;}}

  let bestCPR=0,bestCPRPl="",bestCPRT="";
  for(const a of aggsArr)if(a.bestTournamentPerf>bestCPR){bestCPR=a.bestTournamentPerf;bestCPRPl=a.name;bestCPRT=a.bestTournamentPerfLabel;}
  const minT=mode==="ELO"?10:5;
  const bestAvgPerf=aggsArr.filter(a=>a.uniqueTournaments>=minT&&a.bestTournamentPerf>0).reduce((b,a)=>a.bestTournamentPerf>(b?.bestTournamentPerf??0)?a:b,null as PAgg|null);

  const categories:RecordCategory[]=[
    {id:"elo-absolute",title:mode==="ELO"?"ELO — Absolutní rekordy":"DCPR — Absolutní rekordy",icon:"👑",records:[
      {label:"Nejvyšší ELO v historii komunity",entry:(()=>{const a=maxBy("peakElo");return a?e(fmt(a.peakElo),a.name,undefined,undefined,true):null;})()},
      {label:"Nejvyšší aktuální ELO",entry:(()=>{const a=maxBy("currentElo");return a?e(fmt(a.currentElo),a.name):null;})()},
      {label:"Nejnižší ELO v historii komunity",entry:(()=>{const a=aggsArr.filter(a=>a.minElo>0).reduce((b,c)=>(c.minElo<(b?.minElo??Infinity))?c:b,null as PAgg|null);return a?e(fmt(a.minElo),a.name):null;})()},
      {label:"Největší ELO range kariéry",entry:(()=>{const a=aggsArr.reduce((b,c)=>(c.peakElo-c.minElo)>((b?.peakElo??0)-(b?.minElo??0))?c:b,null as PAgg|null);return a?e(`${fmt(a.peakElo-a.minElo)} bodů`,a.name,`Peak ${fmt(a.peakElo)} · Min ${fmt(a.minElo)}`):null;})()},
    ]},
    {id:"gains-losses",title:"Zisky & ztráty",icon:"📈",records:[
      {label:"Největší jednorázový zisk ELO",entry:cMaxGPl?e(`+${fmt(Math.round(cMaxG))}`,cMaxGPl,cMaxGDate,`vs. ${cMaxGOpp} · ${cMaxGT}`,true):null},
      {label:"Největší jednorázová ztráta ELO",entry:cMinLPl?e(fmt(Math.round(cMinL)),cMinLPl,cMinLDate,`vs. ${cMinLOpp}`,true):null},
      {label:"Hráč s nejvyšším lifetime ELO ziskem",entry:(()=>{const a=maxBy("sumDelta",30);return a?e(fmtS(a.sumDelta),a.name,`${a.totalGames} her`):null;})()},
      {label:"Hráč s nejhorší lifetime ELO bilancí",entry:(()=>{const a=minBy("sumDelta",30);return a?e(fmtS(a.sumDelta),a.name,`${a.totalGames} her`):null;})()},
      {label:"Největší ELO zisk za 1 den",entry:(()=>{const a=maxBy("bestDayGain",5);return a?e(`+${fmt(a.bestDayGain)}`,a.name,a.bestDayDate):null;})()},
      {label:"Největší ELO ztráta za 1 den",entry:(()=>{const a=aggsArr.filter(a=>a.totalGames>=5&&a.worstDayLoss<0).reduce((b,c)=>c.worstDayLoss<(b?.worstDayLoss??0)?c:b,null as PAgg|null);return a?e(fmt(a.worstDayLoss),a.name,a.worstDayLossDate):null;})()},
      {label:"Největší ELO zisk za 1 měsíc",entry:(()=>{const a=maxBy("bestMonthGain",5);return a?e(`+${fmt(a.bestMonthGain)}`,a.name,a.bestMonthLabel):null;})()},
      {label:"Největší ELO ztráta za 1 měsíc",entry:(()=>{const a=aggsArr.filter(a=>a.totalGames>=5&&a.worstMonthLoss<0).reduce((b,c)=>c.worstMonthLoss<(b?.worstMonthLoss??0)?c:b,null as PAgg|null);return a?e(fmt(a.worstMonthLoss),a.name,a.worstMonthLabel):null;})()},
      {label:"Největší comeback v historii komunity",entry:(()=>{const a=maxBy("biggestComeback",10);return a?e(`+${fmt(a.biggestComeback)} ELO`,a.name,`${a.comebackMinDate} → ${a.comebackPeakDate}`,undefined,true):null;})()},
    ]},
    {id:"streaks",title:"Streakové rekordy",icon:"🔥",records:[
      {label:"Nejdelší win streak v historii",entry:(()=>{const a=maxBy("maxWinStreak",10);return a?e(`${a.maxWinStreak}×`,a.name,`${a.winStreakStart} – ${a.winStreakEnd}`,undefined,true):null;})()},
      {label:"Nejdelší lose streak v historii",entry:(()=>{const a=maxBy("maxLoseStreak",10);return a?e(`${a.maxLoseStreak}×`,a.name,`${a.loseStreakStart} – ${a.loseStreakEnd}`):null;})()},
      {label:"Nejdelší unbeaten streak (bez prohry)",entry:(()=>{const a=maxBy("maxUnbeaten",10);return a?e(`${a.maxUnbeaten}×`,a.name,undefined,undefined,true):null;})()},
      {label:"Aktuálně nejdelší aktivní win streak",entry:(()=>{const a=maxBy("activeWinStreak");return a&&a.activeWinStreak>0?e(`${a.activeWinStreak}×`,a.name,"🔥 Právě probíhá"):e("—");})()},
    ]},
    {id:"activity",title:"Aktivitní rekordy",icon:"⚡",records:[
      {label:"Hráč s nejvíce odehranými hrami",entry:(()=>{const a=maxBy("totalGames");return a?e(`${fmt(a.totalGames)} her`,a.name,`${a.firstGame} – ${a.lastGame}`):null;})()},
      {label:"Hráč s nejvíce hrami za 1 den",entry:(()=>{const a=maxBy("maxGamesDay",5);return a?e(`${a.maxGamesDay} her`,a.name,a.maxGamesDayDate):null;})()},
      {label:"Hráč s nejvíce hrami za 1 měsíc",entry:(()=>{const a=maxBy("maxGamesMonth",10);return a?e(`${a.maxGamesMonth} her`,a.name,a.maxGamesMonthLabel):null;})()},
      {label:"Den s nejvíce zápasy (komunita)",entry:commMaxDay>0?e(`${commMaxDay} zápasů`,undefined,commMaxDayDate):null},
      {label:"Měsíc s nejvíce zápasy (komunita)",entry:commMaxMonth>0?e(`${commMaxMonth} zápasů`,undefined,commMaxMonthLabel):null},
      {label:"Hráč s nejdelší kariérou (dny)",entry:(()=>{const a=maxBy("careerDays",10);return a?e(`${fmt(a.careerDays)} dní`,a.name,`${a.firstGame} – ${a.lastGame}`):null;})()},
      {label:"Nejdelší nepřetržité aktivní období",entry:(()=>{const a=maxBy("longestContinuousActive",10);return a?e(`${fmt(a.longestContinuousActive)} dní`,a.name):null;})()},
    ]},
    {id:"opponents",title:"Soupeřské rekordy",icon:"⚔️",records:[
      {label:"Největší upset v historii komunity",entry:cUpDiff>0?e(`+${fmt(Math.round(cUpDiff))} ELO diff`,cUpW,cUpDate,`vs. ${cUpL} · ${cUpT}`,true):null},
      {label:"Hráč s nejvyšším avg ELO soupeřů",entry:(()=>{const a=maxBy("avgOppElo",20);return a?e(fmt(a.avgOppElo),a.name,`${a.totalGames} her`):null;})()},
      {label:"Zápas s největším ELO rozdílem",entry:bigMatchD>0?e(`${fmt(Math.round(bigMatchD))} bodů`,undefined,`${bigMatchA} (${fmt(bigMatchAE)}) vs. ${bigMatchB2} (${fmt(bigMatchBE)})`,bigMatchDate):null},
      ...(top5Riv.map((r,i)=>({label:i===0?"Největší rivalství":"Top "+(i+1)+" rivalství",entry:e(`${r.count} zápasů`,undefined,`${r.a} vs. ${r.b}`,`${r.aWins}V/${r.bWins}V/${r.draws}R`)}))),
      {label:"Hráč s nejvyšším počtem různých soupeřů",entry:(()=>{const a=maxBy("uniqueOpponents",20);return a?e(`${a.uniqueOpponents} soupeřů`,a.name):null;})()},
      {label:"Nejdéle trvající rivalství",entry:(()=>{const a=maxBy("longestRivalryDays",5);return a&&a.longestRivalryDays>0?e(`${fmt(a.longestRivalryDays)} dní`,a.name,`vs. ${a.longestRivalryOpp}`):null;})()},
    ]},
    {id:"tournaments",title:"Turnajové rekordy",icon:"🏆",records:[
      {label:"Turnaj s nejvíce zápasy",entry:bigTLabel?e(`${fmt(bigTGames)} zápasů`,undefined,bigTLabel,`${bigTPl} hráčů`):null},
      {label:"Nejtěžší turnaj (avg ELO hráčů)",entry:toughTLabel?e(fmt(Math.round(toughTAvg))+" avg ELO",undefined,toughTLabel):null},
      {label:"Nejlepší performance rating (all-time)",entry:bestCPRPl?e(fmt(bestCPR),bestCPRPl,bestCPRT,undefined,true):null},
      {label:"Hráč s nejvyšším ELO ziskem v turnaji",entry:(()=>{const a=maxBy("bestTournamentGain",5);return a?e(`+${fmt(a.bestTournamentGain)}`,a.name,a.bestTournamentGainLabel):null;})()},
      {label:"Hráč s největší ELO ztrátou v turnaji",entry:(()=>{const a=aggsArr.filter(a=>a.totalGames>=5&&a.worstTournamentLoss<0).reduce((b,c)=>c.worstTournamentLoss<(b?.worstTournamentLoss??0)?c:b,null as PAgg|null);return a?e(fmt(a.worstTournamentLoss),a.name,a.worstTournamentLossLabel):null;})()},
      {label:"Hráč s nejvyšším počtem turnajů",entry:(()=>{const a=maxBy("uniqueTournaments",5);return a?e(`${a.uniqueTournaments} turnajů`,a.name):null;})()},
      {label:`Nejlepší avg performance rating (min. ${minT} turnajů)`,entry:bestAvgPerf?e(fmt(bestAvgPerf.bestTournamentPerf),bestAvgPerf.name,`${bestAvgPerf.uniqueTournaments} turnajů`):null},
    ]},
    {id:"stats",title:"Statistické rekordy",icon:"📊",records:[
      {label:`Nejvyšší winrate (min. ${minG} her)`,entry:(()=>{const a=maxBy("winrate",minG);return a?e(`${Math.round(a.winrate*10)/10}%`,a.name,`${a.totalGames} her`):null;})()},
      {label:`Nejnižší winrate (min. ${minG} her)`,entry:(()=>{const a=aggsArr.filter(a=>a.totalGames>=minG&&a.winrate>0).reduce((b,c)=>c.winrate<(b?.winrate??Infinity)?c:b,null as PAgg|null);return a?e(`${Math.round(a.winrate*10)/10}%`,a.name,`${a.totalGames} her`):null;})()},
      {label:"Nejvyšší průměrná Δ ELO/zápas (min. 30 her)",entry:(()=>{const a=maxBy("avgDelta",30);return a?e((a.avgDelta>=0?"+":"")+a.avgDelta,a.name,`${a.totalGames} her`):null;})()},
      {label:`Nejvyšší Stability Index (min. ${minG} her)`,entry:(()=>{const a=maxBy("stabilityIdx",minG);return a?e(`${a.stabilityIdx}/100`,a.name):null;})()},
      {label:`Nejvyšší OQA Winrate (min. ${minG} her)`,entry:(()=>{const a=maxBy("oqaWR",minG);return a?e(`${a.oqaWR.toFixed(1)}%`,a.name):null;})()},
      {label:"Nejlepší Expected Win Differential (min. 30 her)",entry:(()=>{const best=aggsArr.filter(a=>a.totalGames>=30).map(a=>({...a,expDiff:a.wins-a.expectedWins})).reduce((b,a)=>a.expDiff>(b?.expDiff??-Infinity)?a:b,null as (PAgg&{expDiff:number})|null);return best?e(`+${best.expDiff.toFixed(1)} výher`,best.name,`${best.totalGames} her`):null;})()},
      {label:"Hráč s nejvyšším Upset Faktorem",entry:(()=>{const a=maxBy("biggestUpset",20);return a?e(`${fmt(a.biggestUpset)} ELO diff`,a.name,`vs. ${a.biggestUpsetOpp}`):null;})()},
    ]},
  ];
  return{categories};
}

// ── PLAYER RECORDS (9A + 9C) ───────────────────────────────────────────────────
export async function fetchPlayerRecords(mode:"ELO"|"DCPR",playerName:string): Promise<PlayerRecordsData|null> {
  const cSheet=mode==="ELO"?"Player cards (CSV)":"Player cards (CSV) - Tournament";
  const sumSheet=mode==="ELO"?"Player summary":"Player summary - Tournament";
  const[cards,summary]=await Promise.all([sheet(cSheet),sheet(sumSheet)]);
  const pCards=cards.slice(1).filter(r=>r[0]?.trim()===playerName);
  if(!pCards.length)return null;
  pCards.sort((a,b)=>{const da=parseDate(a[4])?.getTime()??0,db=parseDate(b[4])?.getTime()??0;return da!==db?da-db:pi(a[1])-pi(b[1]);});
  const elos=pCards.map(r=>pf(r[8]));
  const deltas=pCards.map(r=>pf(r[7]));
  const results=pCards.map(r=>r[6]?.trim()??"");
  const dates=pCards.map(r=>parseDate(r[4]));
  const totalGames=pCards.length;
  const fmt=(n:number)=>Math.round(n).toLocaleString("cs-CZ");
  const peakElo=Math.max(...elos),minElo=Math.min(...elos.filter(e=>e>0));
  const peakDate=pCards[elos.indexOf(peakElo)]?.[4]??"",minDate=pCards[elos.indexOf(minElo)]?.[4]??"";
  const maxDI=deltas.indexOf(Math.max(...deltas)),minDI=deltas.indexOf(Math.min(...deltas));
  const dayMap=new Map<string,{sum:number;count:number;wins:number}>();
  for(let i=0;i<pCards.length;i++){const dt=pCards[i][4]?.trim();if(!dt)continue;const v=dayMap.get(dt)??{sum:0,count:0,wins:0};v.sum+=deltas[i];v.count++;if(results[i].startsWith("Won"))v.wins++;dayMap.set(dt,v);}
  let bDG=-Infinity,bDD="",wDL=Infinity,wDLD="",mGDay=0,mGDayD="",mWDay=0,mWDayD="",mLDay=0,mLDayD="";
  for(const[dt,v]of dayMap){if(v.sum>bDG){bDG=v.sum;bDD=dt;}if(v.sum<wDL){wDL=v.sum;wDLD=dt;}if(v.count>mGDay){mGDay=v.count;mGDayD=dt;}if(v.wins>mWDay){mWDay=v.wins;mWDayD=dt;}const l=v.count-v.wins;if(l>mLDay){mLDay=l;mLDayD=dt;}}
  const monthMap=new Map<string,{sum:number;count:number}>();
  for(let i=0;i<pCards.length;i++){const d=dates[i];if(!d)continue;const k=periodKey(d);const v=monthMap.get(k)??{sum:0,count:0};v.sum+=deltas[i];v.count++;monthMap.set(k,v);}
  let bMG=-Infinity,bML="",wML=Infinity,wMLL="",mGMo=0,mGMoL="";
  for(const[k,v]of monthMap){const lbl=periodLabel(k);if(v.sum>bMG){bMG=v.sum;bML=lbl;}if(v.sum<wML){wML=v.sum;wMLL=lbl;}if(v.count>mGMo){mGMo=v.count;mGMoL=lbl;}}
  let mxW=0,mxL=0,mxU=0,mxWL=0,curW2=0,curL2=0,curU2=0,curWL=0,wSI=0,wEI=0,lSI=0,lEI=0,twS=0,tlS=0;
  for(let i=0;i<results.length;i++){const r=results[i];if(r.startsWith("Won")){curW2++;curU2++;curL2=0;curWL=0;if(curW2===1)twS=i;if(curW2>mxW){mxW=curW2;wSI=twS;wEI=i;}if(curU2>mxU)mxU=curU2;}else if(r.startsWith("Lost")){curL2++;curW2=0;curU2=0;curWL++;if(curL2===1)tlS=i;if(curL2>mxL){mxL=curL2;lSI=tlS;lEI=i;}if(curWL>mxWL)mxWL=curWL;}else{curW2=0;curU2++;curWL++;if(curU2>mxU)mxU=curU2;if(curWL>mxWL)mxWL=curWL;}}
  let e5G=-1,e5D="",runW=0;for(let i=0;i<results.length;i++){if(results[i].startsWith("Won")){runW++;if(runW===5&&e5G<0){e5G=i-4+1;e5D=pCards[i-4]?.[4]??"";}}else runW=0;}
  let actWS=0;for(let i=results.length-1;i>=0;i--){if(results[i].startsWith("Won"))actWS++;else break;}
  let bigCB=0,cbMD="",cbPD="";
  for(let i=0;i<elos.length;i++){let lMin=elos[i],lMI=i;for(let j=i+1;j<elos.length;j++){if(elos[j]<lMin){lMin=elos[j];lMI=j;}const cb=elos[j]-lMin;if(cb>bigCB){bigCB=cb;cbMD=pCards[lMI]?.[4]??"";cbPD=pCards[j]?.[4]??"";}};if(lMI>i)i=lMI;}
  const oppMap=new Map<string,{wins:number;losses:number;draws:number;games:number;dates:Date[]}>();
  for(let i=0;i<pCards.length;i++){const on=oppName(pCards[i][5]??"");if(!on)continue;const v=oppMap.get(on)??{wins:0,losses:0,draws:0,games:0,dates:[]};v.games++;if(results[i].startsWith("Won"))v.wins++;else if(results[i].startsWith("Lost"))v.losses++;else v.draws++;if(dates[i])v.dates.push(dates[i]!);oppMap.set(on,v);}
  let bWRO="",bWRV=-1,bWRG=0,wWRO="",wWRV=101,wWRG=0,mGO="",mGV=0,mGW=0,mGL=0,mGD=0;
  let lRD=0,lRO="",lRG=0,bUpset=0,buO="",buD="",buT="",bFav=0,bFavD="",bFavT="";
  for(const[on,v]of oppMap){const wr=v.wins/v.games*100;if(v.games>=5&&wr>bWRV){bWRV=wr;bWRO=on;bWRG=v.games;}if(v.games>=5&&wr<wWRV){wWRV=wr;wWRO=on;wWRG=v.games;}if(v.games>mGV){mGV=v.games;mGO=on;mGW=v.wins;mGL=v.losses;mGD=v.draws;}if(v.dates.length>=2){const span=Math.floor((v.dates[v.dates.length-1].getTime()-v.dates[0].getTime())/86400_000);if(span>lRD){lRD=span;lRO=on;lRG=v.games;}}}
  for(let i=0;i<pCards.length;i++){const myE=elos[i]-deltas[i],oe=oppEloFn(pCards[i][5]??"");if(!oe)continue;if(results[i].startsWith("Won")&&(oe-myE)>bUpset){bUpset=oe-myE;buO=oppName(pCards[i][5]);buD=pCards[i][4];buT=`${pCards[i][3]?.trim()} ${pCards[i][4]?.trim()}`.trim();}if(results[i].startsWith("Lost")&&(myE-oe)>bFav){bFav=myE-oe;bFavD=pCards[i][4];bFavT=`${pCards[i][3]?.trim()} ${pCards[i][4]?.trim()}`.trim();}}
  const hBE=Math.max(0,...pCards.filter(r=>r[6]?.startsWith("Won")).map(r=>oppEloFn(r[5]??"")));
  const hBRow=pCards.find(r=>r[6]?.startsWith("Won")&&oppEloFn(r[5]??"")===hBE);
  const hLE=Math.max(0,...pCards.filter(r=>r[6]?.startsWith("Lost")).map(r=>oppEloFn(r[5]??"")));
  const tMap=new Map<string,{sum:number;wins:number;losses:number;draws:number;oppElos:number[]}>();
  for(let i=0;i<pCards.length;i++){const tid=`${pCards[i][3]?.trim()} ${pCards[i][4]?.trim()}`.trim();if(!tid)continue;const v=tMap.get(tid)??{sum:0,wins:0,losses:0,draws:0,oppElos:[]};v.sum+=deltas[i];if(results[i].startsWith("Won"))v.wins++;else if(results[i].startsWith("Lost"))v.losses++;else v.draws++;const oe=oppEloFn(pCards[i][5]??"");if(oe>0)v.oppElos.push(oe);tMap.set(tid,v);}
  let bPerfL="",bPerfV=-Infinity,wPerfL="",wPerfV=Infinity,bTGL="",bTGV=-Infinity,wTLL="",wTLV=Infinity;
  let bResL="",bResW=0,bResLoses=999,toughL="",toughAvg=0,posT=0;
  const tByD:{date:string;sum:number}[]=[];
  for(const[tid,v]of tMap){const n2=v.wins+v.losses+v.draws;if(n2>=3){const ao=v.oppElos.length?v.oppElos.reduce((a,b)=>a+b)/v.oppElos.length:0;const pf2=ao+400*(v.wins-v.losses)/n2;if(pf2>bPerfV){bPerfV=pf2;bPerfL=tid;}if(pf2<wPerfV){wPerfV=pf2;wPerfL=tid;}if(ao>toughAvg){toughAvg=ao;toughL=tid;}}if(v.sum>bTGV){bTGV=v.sum;bTGL=tid;}if(v.sum<wTLV){wTLV=v.sum;wTLL=tid;}if(v.wins>bResW||(v.wins===bResW&&v.losses<bResLoses)){bResW=v.wins;bResLoses=v.losses;bResL=tid;}if(v.sum>0)posT++;tByD.push({date:tid.slice(-10),sum:v.sum});}
  tByD.sort((a,b)=>a.date.localeCompare(b.date));
  let mxPS=0,curPS=0;for(const t of tByD){if(t.sum>0){curPS++;if(curPS>mxPS)mxPS=curPS;}else curPS=0;}
  const vd2=dates.filter(Boolean) as Date[];
  let lb=0,lbF="",lbT="";for(let i=1;i<vd2.length;i++){const gap=Math.floor((vd2[i].getTime()-vd2[i-1].getTime())/86400_000);if(gap>lb){lb=gap;lbF=pCards[i-1][4];lbT=pCards[i][4];}}
  const r2=(label:string,value:string,date?:string,context?:string)=>({label,value,date,context});
  return{
    absoluteRecords:[r2("Peak ELO (historické maximum)",fmt(peakElo),peakDate),r2("Historické minimum ELO",fmt(minElo),minDate),r2("ELO Range kariéry",`${fmt(peakElo-minElo)} bodů`,undefined,`Peak ${fmt(peakElo)} · Min ${fmt(minElo)}`)],
    gainsRecords:[r2("Největší jednorázový zisk ELO",`+${fmt(Math.round(deltas[maxDI]??0))}`,pCards[maxDI]?.[4],`vs. ${oppName(pCards[maxDI]?.[5]??"")} · ${pCards[maxDI]?.[3]?.trim()??""}`),r2("Největší jednorázová ztráta ELO",fmt(Math.round(deltas[minDI]??0)),pCards[minDI]?.[4],`vs. ${oppName(pCards[minDI]?.[5]??"")} · ${pCards[minDI]?.[3]?.trim()??""}`),r2("Největší ELO zisk za 1 den",isFinite(bDG)?`+${fmt(Math.round(bDG))}`:"—",bDD,`${dayMap.get(bDD)?.count??0} her`),r2("Největší ELO ztráta za 1 den",isFinite(wDL)&&wDL<0?fmt(Math.round(wDL)):"—",wDLD),r2("Největší ELO zisk za 1 měsíc",isFinite(bMG)?`+${fmt(Math.round(bMG))}`:"—",bML),r2("Největší ELO ztráta za 1 měsíc",isFinite(wML)&&wML<0?fmt(Math.round(wML)):"—",wMLL),r2("Největší comeback v kariéře",bigCB>0?`+${fmt(Math.round(bigCB))}`:"—",undefined,`Min: ${cbMD} → Peak: ${cbPD}`)],
    streakRecords:[r2("Nejdelší win streak",`${mxW}×`,pCards[wSI]?.[4],`${pCards[wSI]?.[4]??""} – ${pCards[wEI]?.[4]??""}`),r2("Nejdelší lose streak",`${mxL}×`,pCards[lSI]?.[4],`${pCards[lSI]?.[4]??""} – ${pCards[lEI]?.[4]??""}`),r2("Nejdelší unbeaten streak",`${mxU}×`),r2("Nejdelší série bez výhry",`${mxWL}×`),r2("Aktuální aktivní win streak",actWS>0?`${actWS}×`:"0"),r2("Nejdřívější win streak 5+",e5G>0?`Hra #${e5G}`:"Nedostatek dat",e5D)],
    matchRecords:[r2("Nejvíce her za 1 den",`${mGDay}`,mGDayD),r2("Nejvíce výher za 1 den",`${mWDay}`,mWDayD),r2("Nejvíce proher za 1 den",`${mLDay}`,mLDayD),r2("Nejvíce her za 1 měsíc",`${mGMo}`,mGMoL),r2("Celkový počet her (lifetime)",fmt(totalGames)),r2("Nejdelší pauza bez hry",lb>0?`${fmt(lb)} dní`:"—",undefined,`${lbF} – ${lbT}`)],
    opponentRecords:[r2("Nejvyšší poražené ELO",hBE>0?fmt(hBE):"—",hBRow?.[4],`vs. ${oppName(hBRow?.[5]??"")}`),r2("Nejvyšší ELO co tě porazilo",hLE>0?fmt(hLE):"—"),r2("Největší ELO diff výhry (outsider)",bUpset>0?`+${fmt(Math.round(bUpset))} diff`:"—",buD,`vs. ${buO} · ${buT}`),r2("Největší ELO diff prohry (favorit)",bFav>0?`+${fmt(Math.round(bFav))} diff`:"—",bFavD),r2("Nejvíce zápasů vs. soupeř",mGV>0?`${mGV} her`:"—",undefined,`${mGO} · ${mGW}V/${mGL}P/${mGD}R`),r2("Nejvyšší winrate vs. soupeř (min. 5 her)",bWRV>=0?`${Math.round(bWRV)}%`:"Nedostatek dat",undefined,`vs. ${bWRO} · ${bWRG} her`),r2("Nejnižší winrate vs. soupeř (min. 5 her)",wWRV<=100?`${Math.round(wWRV)}%`:"Nedostatek dat",undefined,`vs. ${wWRO} · ${wWRG} her`),r2("Nejdéle trvající rivalství",lRD>0?`${fmt(lRD)} dní`:"—",undefined,`vs. ${lRO} · ${lRG} her`)],
    tournamentRecords:[r2("Nejlepší performance rating",isFinite(bPerfV)&&bPerfV>-Infinity?fmt(Math.round(bPerfV)):"—",undefined,bPerfL),r2("Nejhorší performance rating (min. 3 hry)",isFinite(wPerfV)&&wPerfV<Infinity?fmt(Math.round(wPerfV)):"—",undefined,wPerfL),r2("Nejvyšší ELO zisk v turnaji",isFinite(bTGV)?`+${fmt(Math.round(bTGV))}`:"—",undefined,bTGL),r2("Největší ELO ztráta v turnaji",isFinite(wTLV)&&wTLV<0?fmt(Math.round(wTLV)):"—",undefined,wTLL),r2("Nejlepší výsledek v turnaji",bResL?`${bResW}V/${bResLoses}P`:"—",undefined,bResL),r2("Nejtěžší turnaj (avg ELO soupeřů)",toughL?fmt(Math.round(toughAvg)):"—",undefined,toughL),r2("Turnaje s kladným ELO saldem",`${posT} z ${tMap.size}`),r2("Nejdelší série turnajů se ziskem",`${mxPS}×`)],
  };
}
