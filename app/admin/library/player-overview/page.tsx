import { LibraryPage, type Metric } from "../_components/MetricCard";

const metrics: Metric[] = [
  {
    name: "ELO Range",
    tag: "číslo",
    description: "Rozdíl mezi historicky nejvyšším (peak) a nejnižším (min) ELO hráče. Ukazuje jak moc se hráčovo hodnocení v historii měnilo.",
    formula: `eloRange = peakElo − minElo`,
    example: `Marek: peak = 1923, min = 1380
eloRange = 1923 − 1380 = 543 bodů`,
  },
  {
    name: "Peak Retention",
    tag: "%",
    tagColor: "hsl(152,72%,45%)",
    description: "Jak velké procento svého historicky nejlepšího ELO si hráč udržel do dnes. 100% = je stále na peaku, nižší % = klesl od peaku.",
    formula: `peakRetention = (currentElo / peakElo) × 100 %`,
    example: `Marek: current = 1847, peak = 1923
peakRetention = (1847 / 1923) × 100 = 96.0 %
→ Marek je 4 % pod svým maximem`,
  },
  {
    name: "Bayesiánský winrate",
    tag: "%",
    tagColor: "hsl(42,80%,52%)",
    description: "Upravený winrate který penalizuje hráče s malým počtem zápasů. Méně her = větší 'stahování' k 50%. Spravedlivější než čistý winrate pro srovnání hráčů.",
    formula: `bayesianWR = (výhry + α) / (hry + α + β) × 100

α = β = 3  (prior = 50% winrate, síla prioru = 6 her)`,
    example: `Marek: 89 výher, 142 her
bayesianWR = (89 + 3) / (142 + 3 + 3) = 92 / 148 = 62.2 %
(vs čistý WR = 89/142 = 62.7%)

Nováček: 2 výhry, 2 hry
bayesianWR = (2 + 3) / (2 + 3 + 3) = 5/8 = 62.5 %
(vs čistý WR = 100% — jasně neoprávněný)`,
  },
  {
    name: "ELO změna 7d / 30d",
    tag: "číslo",
    description: "Součet ELO bodů získaných (nebo ztracených) za posledních 7 a 30 dní. Ukazuje aktuální formu hráče.",
    formula: `eloChange7d  = Σ(ELO_změna) za záznamy s datem ≥ dnes−7d
eloChange30d = Σ(ELO_změna) za záznamy s datem ≥ dnes−30d`,
    example: `Marek za 30d: +22, −22, +19, +18, −8, +31 = +60

eloChange30d = +60  (Marek je ve formě)
eloChange7d  = +31  (jen poslední zápas)`,
  },
  {
    name: "Aktuální série (streak)",
    tag: "text",
    description: "Počet po sobě jdoucích výher nebo proher od posledního zápasu. Zobrazuje se jako Win streak (🔥) nebo Lose streak (💀).",
    formula: `Seřaď záznamy sestupně dle data
Projdi od nejnovějšího:
  dokud result == předchozí typ → streak++
  jinak → stop`,
    example: `Poslední záznamy Marka (od nejnovějšího):
Won, Won, Won, Lost → série se zastaví na Lost

currentStreak = { type: "win", length: 3 }
→ zobrazí se: 🔥 Win streak 3`,
  },
  {
    name: "Stability Index",
    tag: "index 0–100",
    tagColor: "hsl(195,72%,45%)",
    description: "Jak konzistentní jsou výkyvy hráčova ELO. Vysoká stabilita = malé výkyvy, hráč drží svou úroveň. Nízká = velké skoky nahoru a dolů.",
    formula: `σ = směrodatná odchylka ELO změn
stabilityIndex = max(0, 100 − σ × 2)

(normalizováno na 0–100, vyšší = stabilnější)`,
    example: `Marek ELO změny: +22, −22, +19, −8, +31, −18, +22...
σ = 18.4

stabilityIndex = max(0, 100 − 18.4 × 2)
              = max(0, 100 − 36.8)
              = 63  (průměrná stabilita)`,
  },
  {
    name: "Momentum Index",
    tag: "index 0–100",
    tagColor: "hsl(265,65%,60%)",
    description: "Aktuální herní momentum — klouzavý průměr posledních výsledků zvýhodňující nejnovější zápasy. Vyšší = hráč je momentálně ve vzestupné fázi.",
    formula: `rolling = průměr ELO změn za posledních 10 zápasů
momentumIndex = clamp(50 + rolling × 2, 0, 100)`,
    example: `Marek posledních 10 zápasů:
+22, +19, +31, −8, +18, +22, +15, +31, −22, +19
rolling průměr = 147/10 = 14.7

momentumIndex = clamp(50 + 14.7×2, 0, 100)
              = clamp(79.4, 0, 100) = 79  (silné momentum)`,
  },
  {
    name: "Consistency Score",
    tag: "index 0–100",
    tagColor: "hsl(42,80%,52%)",
    description: "Jak pravidelný je winrate hráče v čase — sleduje varianci winrate v rolling oknech. Vyšší = hráč hraje podobně dobře bez ohledu na datum.",
    formula: `Rozděl historii na okna po 10 zápasech
Pro každé okno: spočítej winrate
consistencyScore = 100 − stdDev(winrate per okna) × 200`,
    example: `Marek, okna po 10 zápasech:
Okno 1: 6/10 = 60%
Okno 2: 7/10 = 70%
Okno 3: 6/10 = 60%
Okno 4: 7/10 = 70%

stdDev = 5.77%
consistencyScore = 100 − 5.77 × 200/100 = 88.5  (velmi konzistentní)`,
  },
  {
    name: "Clutch Factor",
    tag: "index 0–100",
    tagColor: "hsl(0,65%,55%)",
    description: "Winrate hráče v zápasech s vysokými sázkami — kde v případě výhry hodně získá nebo v případě prohry hodně ztratí. Ukazuje mentalitu pod tlakem.",
    formula: `Zápasy s vysokými sázkami = |potenciální zisk| > 18 ELO
(tj. velký favorizovaný nebo velký outsider)
clutchFactor = (výhry v high-stakes) / (high-stakes zápasy) × 100`,
    example: `Marek má 23 high-stakes zápasů (možný zisk/ztráta >18)
Z nich vyhrál 15

clutchFactor = (15/23) × 100 = 65.2  (nadprůměrný clutch)`,
  },
  {
    name: "Upset Rate",
    tag: "%",
    tagColor: "hsl(24,88%,56%)",
    description: "Jak často hráč vyhraje jako outsider — tj. soupeř má vyšší ELO. Vysoký upset rate = hráč umí překvapovat silnější soupeře.",
    formula: `upsets = výhry kde ELO_soupeře > ELO_hráče
upsetRate = upsets / celkové hry × 100 %`,
    example: `Marek hrál 52 zápasů jako outsider (soupeř > ELO)
Z nich vyhrál 18

upsetRate = 18/142 × 100 = 12.7 %`,
  },
  {
    name: "Gain/Loss Ratio",
    tag: "číslo",
    description: "Poměr průměrného zisku za výhru k průměrné ztrátě za prohru. Hodnota > 1 = hráč průměrně získá více než ztratí, < 1 = naopak.",
    formula: `avgGainPerWin = průměr(ELO_změna) pro výhry
avgLossPerLoss = |průměr(ELO_změna)| pro prohry

gainLossRatio = avgGainPerWin / avgLossPerLoss`,
    example: `Marek výhry: +22, +19, +31, +15, +8... → průměr = +18.2
Marek prohry: −8, −22, −18, −31... → průměr = −19.8

gainLossRatio = 18.2 / 19.8 = 0.92
(Marek ztrácí mírně víc než získává — typické pro favorita)`,
  },
  {
    name: "ELO Ceiling Estimate",
    tag: "číslo",
    description: "Odhadovaný strop ELO — jak vysoko by hráč mohl dojít na základě svých aktuálních výkonů. Statistický odhad, ne záruka.",
    formula: `Spočítej performanceRating z posledních 20 zápasů
eloCeilingEstimate = max(peakElo, performanceRating × 0.95 + currentElo × 0.05)`,
    example: `Marek: poslední 20 zápasů, perfRating = 1940
peak = 1923, current = 1847

eloCeilingEstimate = max(1923, 1940×0.95 + 1847×0.05)
                   = max(1923, 1843 + 92.4)
                   = max(1923, 1935)
                   = 1935`,
  },
  {
    name: "Expected Wins / Win Diff",
    tag: "číslo",
    description: "Kolik výher statisticky 'měl' hráč vyhrát podle ELO soupeřů, a o kolik se od toho liší skutečný počet. Kladný diff = overperformance.",
    formula: `Pro každý zápas: Očekávání = 1/(1+10^((oppElo−myElo)/400))
expectedWins = Σ(Očekávání) přes všechny zápasy

expectedWinDiff = actualWins − expectedWins`,
    example: `Marek, 142 zápasů:
Σ(Očekávání) = 83.4  (by měl vyhrát 83.4×)
Skutečné výhry = 89

expectedWinDiff = 89 − 83.4 = +5.6
→ Marek overperformuje o 5.6 výher nad statistiku`,
  },
];

export default function PlayerOverviewLibraryPage() {
  return (
    <LibraryPage
      title="Přehled — hráč"
      subtitle="Metriky na osobní kartě hráče — aktuální stav, výkonnost a indexy."
      icon="👤"
      metrics={metrics}
    />
  );
}
