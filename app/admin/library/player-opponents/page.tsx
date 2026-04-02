import { LibraryPage, type Metric } from "../_components/MetricCard";

const metrics: Metric[] = [
  {
    name: "Nejčastější soupeř",
    tag: "text",
    description: "Hráč, proti kterému jsme odehráli nejvíce zápasů. Identifikuje přirozeného rivala.",
    formula: `mostPlayedOpp = soupeř s max(počet vzájemných zápasů)
  Pro každý záznam: oppName = jméno soupeře z karet
  Group by oppName, count, spočítej winrate`,
    example: `Marek vs soupeři:
  Ondra: 18 zápasů, WR 55.6%
  Pavel: 11 zápasů, WR 63.6%
  Lukáš: 8 zápasů, WR 50%

mostPlayedOpp = Ondra  (18 her)
mostPlayedOppWR = 55.6%`,
  },
  {
    name: "Nemesis",
    tag: "text",
    description: "Soupeř, proti kterému máme nejhorší winrate (min. 3 vzájemné zápasy). Ten kdo nám nejvíc 'leží v žaludku'.",
    formula: `nemesis = soupeř s min(winrate) při ≥3 vzájemných zápasech`,
    example: `Marek h2h winrate:
  Ondra:  55.6% (18 her) ✓
  Tomáš:  33.3% (6 her) ✓
  Nováček: 0%  (1 hra) ✗ nesplňuje min 3

nemesis = Tomáš  (WR 33.3% ve vzájemných)
nemesisRating = aktuální ELO Tomáše = 1723`,
  },
  {
    name: "Prey (oběť)",
    tag: "text",
    description: "Soupeř, proti kterému máme nejlepší winrate (min. 3 zápasy). Hráč kterého pravidelně porážíme.",
    formula: `prey = soupeř s max(winrate) při ≥3 vzájemných zápasech`,
    example: `Marek h2h winrate:
  Pavel: 81.8% (11 her) ✓
  Lukáš: 75.0% (8 her) ✓
  Ondra: 55.6% (18 her)

prey = Pavel  (WR 81.8%)
preyRating = aktuální ELO Pavla = 1763`,
  },
  {
    name: "WR vs. slabší / podobní / silnější",
    tag: "%",
    tagColor: "hsl(42,80%,52%)",
    description: "Winrate rozdělený podle toho jak silný byl soupeř. Slabší = ELO o 100+ níže, silnější = ELO o 100+ výše, podobní = rozdíl < 100.",
    formula: `Kategorie soupeřů:
  slabší:   oppElo < myElo − 100
  podobní:  |oppElo − myElo| ≤ 100
  silnější: oppElo > myElo + 100

wrVsWeaker   = výhry_vs_slabší / zápasy_vs_slabší × 100
wrVsSimilar  = výhry_vs_podobní / zápasy_vs_podobní × 100
wrVsStronger = výhry_vs_silnější / zápasy_vs_silnější × 100`,
    example: `Marek (ELO 1847):
  vs slabší (ELO <1747):   28 her, 23 výher → WR 82.1%
  vs podobní (ELO 1747–1947): 72 her, 47 výher → WR 65.3%
  vs silnější (ELO >1947): 42 her, 19 výher → WR 45.2%`,
  },
  {
    name: "Největší Upset (hráč)",
    tag: "číslo",
    description: "Největší rozdíl ELO, kdy tento hráč porazil silnějšího soupeře. Osobní rekord v překvapení.",
    formula: `biggestUpset = max(oppElo_před − myElo_před) přes výhry hráče
kde oppElo_před > myElo_před`,
    example: `Marek porazil Petra (ELO 2050), Marek měl tehdy ELO 1680:
  rozdíl = 2050 − 1680 = 370

biggestUpset = 370  (výhra nad Petrem)`,
  },
  {
    name: "Nejtěžší prohra (hardestLoss)",
    tag: "číslo",
    description: "Prohra kde byl soupeř nejslabší, nebo kde jsme ztratili nejvíce ELO. Nejhorší 'upset' pro nás.",
    formula: `hardestLoss = max(myElo_před − oppElo_před) přes prohry hráče
kde myElo_před > oppElo_před
(ztráta jako velký favorit)`,
    example: `Marek (ELO 1847) prohrál s Tomášem (ELO 1420):
  rozdíl = 1847 − 1420 = 427

hardestLoss = 427  (prohra s výrazně slabším soupeřem)`,
  },
  {
    name: "Head-to-Head tabulka",
    tag: "tabulka",
    description: "Detailní výsledky všech vzájemných soubojů se soupeři. Zobrazují se soupeři se ≥2 zápasy, seřazení dle počtu her.",
    formula: `Pro každého soupeře (s ≥2 hrami):
  h2h.games    = počet vzájemných zápasů
  h2h.wins     = výhry
  h2h.losses   = prohry
  h2h.draws    = remízy
  h2h.winrate  = wins / games × 100
  h2h.avgDelta = průměrná ELO změna v těchto zápasech`,
    example: `Marek vs Ondra (18 her):
  Výhry: 10 | Prohry: 7 | Remízy: 1
  Winrate: 55.6%
  avgDelta: +3.2  (Marek průměrně získá 3.2 ELO/zápas vs Ondra)

Marek vs Tomáš (6 her):
  Výhry: 2 | Prohry: 4 | Remízy: 0
  Winrate: 33.3%
  avgDelta: −8.7  (Marek průměrně tratí 8.7 ELO/zápas vs Tomáš)`,
  },
  {
    name: "Avg ELO soupeřů",
    tag: "číslo",
    description: "Průměrné ELO soupeřů, které hráč čelil. Vyšší hodnota = hráč hraje proti kvalitnějším soupeřům.",
    formula: `avgOppElo = Σ(ELO_soupeře_před) / celkové hry`,
    example: `Marek 142 zápasů:
  Σ(ELO soupeřů) = 236 420

avgOppElo = 236 420 / 142 = 1665`,
  },
];

export default function PlayerOpponentsLibraryPage() {
  return (
    <LibraryPage
      title="Protihráči — hráč"
      subtitle="Analýza vzájemných zápasů, rivalů a statistik head-to-head."
      icon="⚔️"
      metrics={metrics}
      pageId="player-opponents"
    />
  );
}
