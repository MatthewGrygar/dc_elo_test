import { LibraryPage, type Metric } from "../_components/MetricCard";

const metrics: Metric[] = [
  {
    name: "Tournament Performance Rating",
    tag: "číslo",
    tagColor: "hsl(152,72%,45%)",
    description: "ELO-based výkonnostní rating v konkrétním turnaji. Vyjadřuje 'jak silní by museli být soupeři, aby byl výsledek normální'. Čím vyšší, tím lepší výkon v turnaji.",
    formula: `perfRating = (Σ(ELO soupeřů v turnaji) + 400 × (výhry − prohry))
             / celkové hry v turnaji`,
    example: `Marek na turnaji DC Winter 2025:
  5 zápasů, soupeři: 1700, 1750, 1800, 1650, 1820
  Σ ELO = 8720
  Výsledky: 3 výhry, 1 prohra, 1 remíza

perfRating = (8720 + 400 × (3−1)) / 5
           = (8720 + 800) / 5
           = 9520 / 5
           = 1904`,
  },
  {
    name: "Average Delta per Tournament",
    tag: "číslo",
    description: "Průměrný ELO zisk (nebo ztráta) za jeden zápas v daném turnaji. Ukazuje jak efektivní byl hráč v konkrétní akci.",
    formula: `avgDelta = Σ(ELO_změna v turnaji) / počet zápasů v turnaji`,
    example: `Marek na DC Winter 2025:
  ELO změny: +22, −8, +19, +15, +12
  Σ = +60

avgDelta = 60 / 5 = +12 ELO/zápas`,
  },
  {
    name: "Nejlepší turnaj (bestTournamentPerf)",
    tag: "text",
    description: "Turnaj, kde hráč dosáhl nejvyššího performance ratingu. Nejlepší výkon v historii hráče.",
    formula: `bestTournament = turnaj s max(perfRating) ze všech turnajů hráče
podmínka: min. 2 zápasy v turnaji (aby nešlo o jednorázovou výhru)`,
    example: `Marek turnajové performance ratinky:
  DC Winter 2025: perfRating = 1904 ✓
  DC Summer 2024: perfRating = 1832 ✓
  DC Spring 2024: perfRating = 2041 ✓ ← nejvyšší

bestTournament = DC Spring 2024  (perfRating 2041)`,
  },
  {
    name: "Nejhorší turnaj (worstTournamentPerf)",
    tag: "text",
    description: "Turnaj, kde hráč dosáhl nejnižšího performance ratingu. Identifikuje nejtěžší akci v historii hráče.",
    formula: `worstTournament = turnaj s min(perfRating) ze všech turnajů hráče
podmínka: min. 2 zápasy`,
    example: `Marek:
  DC Summer 2024:  perfRating = 1832
  DC Autumn 2024:  perfRating = 1621 ← nejnižší

worstTournament = DC Autumn 2024  (perfRating 1621)`,
  },
  {
    name: "Průměrný zisk na turnaj",
    tag: "číslo",
    description: "Průměrný celkový součet ELO bodů, které hráč získal (nebo ztratil) za jeden turnaj. Kumulativní efekt turnajů.",
    formula: `Pro každý turnaj: sumDelta = Σ(ELO_změna všech zápasů v turnaji)
avgTournamentGain = Σ(sumDelta přes všechny turnaje) / počet turnajů`,
    example: `Marek:
  DC Winter 2025:  sumDelta = +60
  DC Summer 2024:  sumDelta = +38
  DC Spring 2024:  sumDelta = +112
  DC Autumn 2024:  sumDelta = −28

avgTournamentGain = (60+38+112−28) / 4 = 182 / 4 = +45.5 ELO/turnaj`,
  },
  {
    name: "Nejhranější turnaj",
    tag: "text",
    description: "Turnaj, kde hráč odehrál nejvíce zápasů celkově. Může být série nebo opakovaná akce.",
    formula: `mostPlayedTournamentId = turnaj s max(počet zápasů) v kartách hráče`,
    example: `Marek počet her per turnaj:
  DC Winter 2025:  5 her
  DC Letní série: 12 her ← maximum
  DC Spring 2024:  7 her

mostPlayedTournament = DC Letní série  (12 her)`,
  },
  {
    name: "Počet unikátních turnajů",
    tag: "číslo",
    description: "Kolik různých turnajů (unikátních turnajových ID) hráč absolvoval. Ukazuje šíři zkušeností.",
    formula: `uniqueTournaments = počet distinct tournamentId v kartách hráče`,
    example: `Marek karty obsahují tournament IDs:
  'dc-winter-25', 'dc-summer-24', 'dc-spring-24',
  'dc-autumn-24', 'dc-letni-serie'

uniqueTournaments = 5`,
  },
  {
    name: "Avg ELO soupeřů v turnaji",
    tag: "číslo",
    description: "Průměrné ELO soupeřů, které hráč čelil v konkrétním turnaji. Vyšší = těžší los / prestižnější akce.",
    formula: `avgOppElo (turnaj) = Σ(ELO_soupeře_před) / počet zápasů v turnaji`,
    example: `Marek na DC Winter 2025:
  Soupeři: 1700, 1750, 1800, 1650, 1820
  Σ = 8720

avgOppElo = 8720 / 5 = 1744`,
  },
];

export default function PlayerTournamentsLibraryPage() {
  return (
    <LibraryPage
      title="Turnaje — hráč"
      subtitle="Výkonnost hráče v jednotlivých turnajích a agregátní turnajové statistiky."
      icon="🏟️"
      metrics={metrics}
    />
  );
}
