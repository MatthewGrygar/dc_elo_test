import { LibraryPage, type Metric } from "../_components/MetricCard";

const metrics: Metric[] = [
  {
    name: "ELO Rating",
    tag: "číslo",
    tagColor: "hsl(152,72%,45%)",
    description: "Aktuální herní hodnocení hráče. Základní metrika žebříčku — čím vyšší číslo, tím lepší hráč. Po každém zápase se aktualizuje podle výsledku a ELO soupeře. Výchozí hodnota pro nového hráče je 1200.",
    formula: `Nové ELO = Staré ELO + K × (Výsledek − Očekávání)

Kde:
  K          = K-faktor (typicky 32)
  Výsledek   = 1 (výhra) | 0.5 (remíza) | 0 (prohra)
  Očekávání  = 1 / (1 + 10^((ELO_soupeře − ELO_hráče) / 400))`,
    example: `Hráč: Marek (ELO 1650) vs Ondra (ELO 1800)

Očekávání Marka   = 1 / (1 + 10^((1800−1650)/400))
                  = 1 / (1 + 10^0.375)
                  = 1 / (1 + 2.371)
                  = 0.297  (29.7% šance na výhru)

Marek vyhraje → Výsledek = 1

Nové ELO Marka = 1650 + 32 × (1 − 0.297)
               = 1650 + 32 × 0.703
               = 1650 + 22.5
               = 1672 (+22)

Ondra prohraje → Výsledek = 0

Nové ELO Ondry = 1800 + 32 × (0 − 0.703)
               = 1800 − 22.5
               = 1777 (−22)`,
  },
  {
    name: "Počet her",
    tag: "číslo",
    description: "Celkový počet odehraných zápasů (výhry + prohry + remízy). Hodnota se bere přímo z listu 'Elo standings', sloupec C.",
    formula: `Hry = Výhry + Prohry + Remízy`,
    example: `Marek: 89 výher + 38 proher + 15 remíz = 142 her`,
  },
  {
    name: "Výhry / Prohry / Remízy",
    tag: "číslo",
    description: "Absolutní počty výsledků hráče. Slouží k výpočtu winrate a dalších ukazatelů. Hodnoty ze sloupců D, E, F listu standings.",
    formula: `Výhry  = sloupec D
Prohry = sloupec E
Remízy = sloupec F`,
    example: `Marek: 89 výher, 38 proher, 15 remíz`,
  },
  {
    name: "Winrate",
    tag: "%",
    tagColor: "hsl(42,80%,52%)",
    description: "Procento výher ze všech odehraných zápasů. Remízy se počítají jako půl výhry v ELO systému, ale v winrate se nezapočítávají jako výhra.",
    formula: `Winrate = (Výhry / Celkové hry) × 100 %`,
    example: `Marek: (89 / 142) × 100 = 62.68 %`,
  },
  {
    name: "Peak ELO",
    tag: "číslo",
    tagColor: "hsl(42,80%,52%)",
    description: "Historicky nejvyšší dosažené ELO hodnocení hráče. Bere se z listu standings, sloupec H. Nejde dolů — zaznamenává se maximum za celou historii.",
    formula: `Peak = max(ELO po každém zápase v historii hráče)`,
    example: `Marek měl po výhrovné sérii ELO 1923 → Peak = 1923
Aktuální ELO je 1847 → Peak retention = 1847/1923 = 96.1 %`,
  },
  {
    name: "VT Class",
    tag: "DCPR",
    tagColor: "hsl(265,65%,60%)",
    description: "Třída hráče v DCPR (turnajovém) hodnocení. Získává se z listu 'Tournament_Elo', sloupec I. Zobrazuje se pouze v režimu DCPR.",
    formula: `VT1 → Class A  (nejlepší)
VT2 → Class B
VT3 → Class C
VT4 → Class D  (nejnižší)

Přiřazuje turnajový systém na základě výsledků v turnajích.`,
    example: `Marek hrál VT1 turnaje a má klasifikaci VT1 → zobrazí se badge "Class A" v zeleném provedení.`,
  },
];

export default function LeaderboardLibraryPage() {
  return (
    <LibraryPage
      title="Žebříček"
      subtitle="Metriky zobrazované v hlavní tabulce žebříčku hráčů."
      icon="📊"
      metrics={metrics}
      pageId="leaderboard"
    />
  );
}
