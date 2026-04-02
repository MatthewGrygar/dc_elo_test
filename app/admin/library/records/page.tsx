import { LibraryPage, type Metric } from "../_components/MetricCard";

const metrics: Metric[] = [
  {
    name: "Nejvyšší ELO (historické)",
    tag: "číslo",
    tagColor: "hsl(42,80%,52%)",
    description: "Absolutně nejvyšší ELO hodnocení, které kdy jakýkoli hráč v systému dosáhl. Bere se jako maximum přes všechna historická peakELO ve standings.",
    formula: `highestEloEver = max(peak ELO přes všechny hráče)`,
    example: `Marek peak: 1923
Ondra peak: 1842
Pavel peak: 1798

highestEloEver = 1923  (držitel: Marek)`,
  },
  {
    name: "Nejdelší Win Streak",
    tag: "číslo",
    description: "Rekordní počet po sobě jdoucích výher jednoho hráče v celé historii komunity. Počítá se z chronologicky seřazených karet.",
    formula: `Pro každého hráče:
  Seřaď záznamy chronologicky
  Projdi záznamy a počítej consecutive 'Won' výsledky
  Zaznamenej maximum

globalRecord = max přes všechny hráče`,
    example: `Marek: W,W,W,W,W,L,W,W → longest streak = 5
Ondra: W,W,W,W,W,W,W,L  → longest streak = 7
Pavel: W,W,W,L  → longest streak = 3

globalRecord = 7  (držitel: Ondra)`,
  },
  {
    name: "Nejdelší Lose Streak",
    tag: "číslo",
    description: "Rekordní počet po sobě jdoucích proher jednoho hráče. Záporná série ukazuje nejtěžší období v historii komunity.",
    formula: `Pro každého hráče:
  Seřaď záznamy chronologicky
  Počítej consecutive 'Lost' výsledky
  Zaznamenej maximum`,
    example: `Pavel: L,L,L,L,L,W → longest lose streak = 5
Tomáš: L,L,L,L,L,L,W → longest lose streak = 6

globalRecord = 6  (držitel: Tomáš)`,
  },
  {
    name: "Nejlepší winrate (min. 20 her)",
    tag: "%",
    tagColor: "hsl(152,72%,45%)",
    description: "Hráč s nejvyšším winrate při podmínce minimálního počtu her. Filtr zabraňuje aby rekord držel hráč s 1 zápasem a 100% winrate.",
    formula: `bestWinrate = max(výhry/hry × 100%) přes hráče s ≥20 hrami`,
    example: `Marek: 89/142 = 62.7%  (142 her ✓)
Ondra: 57/97  = 58.8%  (97 her ✓)
Nováček: 3/3  = 100%   (3 hry ✗ — nesplňuje podmínku)

bestWinrate = 62.7%  (držitel: Marek)`,
  },
  {
    name: "Největší jednoráz. zisk ELO",
    tag: "číslo",
    tagColor: "hsl(152,72%,45%)",
    description: "Nejvyšší počet ELO bodů získaných v jednom zápase. Nastane při výhře slabšího hráče nad výrazně silnějším soupeřem.",
    formula: `biggestSingleGain = max(ELO_změna) přes všechny záznamy výher

ELO_změna = K × (1 − Očekávání)
K = 32, Očekávání ≈ 0 (pro velkého outsidera)
→ max zisk ≈ 32 × 1 = 32 bodů`,
    example: `Tomáš (ELO 1320) porazil Marka (ELO 1847):
Očekávání Tomáše = 1/(1+10^((1847−1320)/400))
                 = 1/(1+10^1.3175) = 1/21.8 = 0.046

Zisk = 32 × (1 − 0.046) = 32 × 0.954 = +30.5 ELO

biggestSingleGain = +31  (Tomáš vs Marek)`,
  },
  {
    name: "Největší jednoráz. ztráta ELO",
    tag: "číslo",
    description: "Nejvyšší ztráta ELO bodů v jednom zápase. Nastane při prohře favorizovaného hráče (velkého favorita) s outsiderem.",
    formula: `biggestSingleLoss = min(ELO_změna) přes všechny záznamy proher
(nejzápornější číslo)`,
    example: `Marek (ELO 1847) prohrál s Tomášem (ELO 1320):
Očekávání Marka = 1/(1+10^((1320−1847)/400))
               = 1/(1+10^(−1.3175)) = 0.954

Ztráta = 32 × (0 − 0.954) = −30.5 ELO

biggestSingleLoss = −31  (Marek vs Tomáš)`,
  },
  {
    name: "Nejaktivnější hráč",
    tag: "text",
    description: "Hráč s nejvyšším celkovým počtem odehraných zápasů. Bere se z standings, sloupec C — maximální hodnota.",
    formula: `mostActive = hráč s max(games) ve standings`,
    example: `Marek: 142 her
Ondra:  97 her
Pavel:  88 her

mostActive = Marek  (142 her)`,
  },
  {
    name: "Nový hráč s nejvyšším ELO",
    tag: "text",
    description: "Hráč, který vstoupil do komunity nejpozději (poslední datum v kartách) a přesto dosáhl nejvyššího ELO. Ukazuje jak rychle se nový talent zařadí.",
    formula: `Nový hráč = hráč s nejpozdějším firstMatchDate
Nebo: hráč s <15 hrami a nejvyšším aktuálním ELO`,
    example: `Lukáš: první zápas 15.1.2025 (nejnověji), aktuální ELO 1741
  → vstoupil před 75 dny, 44 her, ELO 1741

newPlayerRecord = Lukáš  (nejvyšší ELO za krátkou dobu)`,
  },
];

export default function RecordsLibraryPage() {
  return (
    <LibraryPage
      title="Rekordy"
      subtitle="Komunální rekordy a historicky nejlepší výkony — kdo drží jaký rekord a jak byl spočítán."
      icon="🏆"
      metrics={metrics}
    />
  );
}
