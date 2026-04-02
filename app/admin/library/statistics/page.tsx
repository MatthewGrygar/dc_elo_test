import { LibraryPage, type Metric } from "../_components/MetricCard";

const metrics: Metric[] = [
  {
    name: "Aktivní hráči za 30 dní",
    tag: "číslo",
    description: "Počet hráčů, kteří odehráli alespoň 1 zápas v posledních 30 dnech. Ukazuje aktivitu komunity.",
    formula: `activePlayers30d = počet unikátních hráčů s alespoň 1 zápisem
              v kartách za posledních 30 dní`,
    example: `Z karet za poslední měsíc: Marek (8 her), Ondra (4), Pavel (2), Tomáš (0)
→ activePlayers30d = 3  (Tomáš neměl žádný zápas)`,
  },
  {
    name: "Globální winrate",
    tag: "%",
    tagColor: "hsl(42,80%,52%)",
    description: "Průměrný winrate celé komunity. Ideálně by měl být blízko 50 % — to znamená vyrovnaný matchmaking.",
    formula: `globalWinrate = Σ(výhry všech hráčů) / Σ(hry všech hráčů) × 100`,
    example: `Komunita: 520 výher celkem, 356 her × 2 hráčů = 712 stran
globalWinrate = 520 / 712 × 100 = 73 % → ale to je normální,
protože každý zápas = 1 výhra + 1 prohra → vychází ~50 % per zápas`,
  },
  {
    name: "Průměr her na hráče",
    tag: "číslo",
    description: "Průměrný počet odehraných her na jednoho hráče. Měří jak moc hráči hrají.",
    formula: `avgGamesPerPlayer = Celkové hry × 2 / Počet hráčů`,
    example: `356 zápasů, 28 hráčů
avgGamesPerPlayer = 356 × 2 / 28 = 25.4 her / hráč`,
  },
  {
    name: "Gini koeficient",
    tag: "index",
    tagColor: "hsl(265,65%,60%)",
    description: "Míra nerovnoměrnosti distribuce ELO. 0 = všichni mají stejné ELO, 1 = jeden hráč má vše. Nižší = zdravější komunita s vyrovnanými hráči.",
    formula: `Gini = (2 × Σ((i+1) × ELO[i]) / (n × Σ(ELO))) − (n+1)/n

kde ELO[i] jsou ELO seřazená vzestupně, n = počet hráčů`,
    example: `28 hráčů, ELO od 900 do 1847
Σ(ELO) = 38 800, n = 28

Výpočet přes seřazená ELO:
Σ((i+1) × ELO[i]) = 1×900 + 2×950 + ... + 28×1847

Gini ≈ 0.14  (zdravá komunita, mírná nerovnost)`,
  },
  {
    name: "Community Win Parity Index",
    tag: "index",
    tagColor: "hsl(152,72%,45%)",
    description: "Jak blízko je komunita k ideálnímu 50% winrate na obou stranách zápasu. Hodnota 1.0 = dokonalá parita, 0.0 = jeden hráč vyhrává všechno.",
    formula: `communityWinParityIndex = 1 − |globalWinrate − 0.5| × 2`,
    example: `globalWinrate = 0.527 (52.7%)

communityWinParityIndex = 1 − |0.527 − 0.5| × 2
                        = 1 − 0.027 × 2
                        = 1 − 0.054
                        = 0.946  (výborná parita)`,
  },
  {
    name: "Fair Match %",
    tag: "%",
    tagColor: "hsl(42,80%,52%)",
    description: "Procento zápasů, kde byl rozdíl ELO obou hráčů menší než 100. Vyšší % = lepší matchmaking = férovější zápasy.",
    formula: `fairMatchPct = (počet zápasů s |ELO1 − ELO2| < 100) / celkové zápasy × 100`,
    example: `Z 356 zápasů: 247 mělo eloDiff < 100

fairMatchPct = 247 / 356 × 100 = 69.4 %`,
  },
  {
    name: "Průměrná změna ELO za zápas",
    tag: "číslo",
    description: "Průměrný absolutní počet ELO bodů přesunutých v jednom zápase. Vysoké číslo = velké sázky, rychlejší přeskupování žebříčku.",
    formula: `avgMatchEloDelta = Σ(|ELO_změna| všech karet) / celkový počet karet`,
    example: `Z karet: Marek +22, Ondra −22, Pavel +18, Lukáš −18, ...
Průměr absolutních hodnot = (22+22+18+18+...) / n

avgMatchEloDelta ≈ 19.3`,
  },
  {
    name: "Největší zisk za 30 dní",
    tag: "text",
    description: "Hráč s nejvyšším součtem ELO bodů získaných za posledních 30 dní. Ukazuje kdo je momentálně ve formě.",
    formula: `biggestGain30d:
  Pro každého hráče: sum(ELO_změna) za posledních 30d
  Vyber hráče s nejvyšším součtem (jen kladné zisky)`,
    example: `Lukáš za 30d: +22, +18, −8, +31, +12 = +75
Marek za 30d: +22, −22, +19 = +19

biggestGain30d = Lukáš +75`,
  },
  {
    name: "Největší Upset",
    tag: "text",
    description: "Zápas, kde hráč s výrazně nižším ELO porazil silnějšího soupeře. Hledá se maximální rozdíl ELO při výhře nižšeji hodnoceného hráče.",
    formula: `bestUpset: z karet za 30d filtruj výhry (Won),
kde ELO_soupeře_před − ELO_moje_před > 0
Vyber zápas s největším tímto rozdílem`,
    example: `Tomáš (ELO 1420) porazil Marka (ELO 1847)
Rozdíl = 1847 − 1420 = 427 ELO

bestUpset: Tomáš porazil Marka (rozdíl 427)`,
  },
  {
    name: "Performance Rating",
    tag: "číslo",
    tagColor: "hsl(152,72%,45%)",
    description: "Turnajový výkonnostní rating — ELO-based metrika vyjadřující 'jak silní soupeři by museli být, aby byl výsledek statisticky normální'. Používá se při turnajích.",
    formula: `performanceRating = Σ(ELO soupeřů) + 400 × (výhry − prohry)
                      / celkový počet zápasů`,
    example: `Marek hrál 5 zápasů:
Soupeři: 1700, 1750, 1800, 1650, 1820 → Σ = 8720
Výsledky: 3 výhry, 1 prohra, 1 remíza

performanceRating = (8720 + 400 × (3−1)) / 5
                  = (8720 + 800) / 5
                  = 9520 / 5
                  = 1904`,
  },
  {
    name: "Nejdéle aktivní hráč",
    tag: "text",
    description: "Hráč s největším časovým rozsahem mezi prvním a posledním zápasem. Ukazuje kdo je v komunitě nejdéle.",
    formula: `longestActivePlayer:
  Pro každého hráče: lastMatchDate − firstMatchDate (ve dnech)
  Vyber hráče s max(daysDiff)`,
    example: `Marek: první zápas 5.1.2023, poslední 15.3.2025 → 800 dní
Ondra: první zápas 12.3.2023, poslední 10.3.2025 → 729 dní

longestActivePlayer = Marek (800 dní)`,
  },
];

export default function StatisticsLibraryPage() {
  return (
    <LibraryPage
      title="Statistiky — obecný"
      subtitle="Komunitní statistiky a agregátní metriky celého ELO systému."
      icon="📈"
      metrics={metrics}
    />
  );
}
