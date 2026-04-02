import { LibraryPage, type Metric } from "../_components/MetricCard";

const metrics: Metric[] = [
  {
    name: "Celkové hry",
    tag: "číslo",
    tagColor: "hsl(152,72%,45%)",
    description: "Celkový počet odehraných zápasů v celé komunitě. Protože každý zápas je v standings evidován pro oba hráče, součet všech her se vydělí 2.",
    formula: `Celkové hry = Σ(hry každého hráče ve standings) / 2`,
    example: `Standings: Marek 142, Ondra 97, Pavel 63, Lukáš 44, ...
Součet všech = 2 × počet unikátních zápasů
→ Pokud součet = 712, pak Celkové hry = 712 / 2 = 356`,
  },
  {
    name: "Aktivní hráči",
    tag: "číslo",
    description: "Počet unikátních hráčů v systému — ti co mají alespoň jeden zápas v standings listu.",
    formula: `Aktivní hráči = počet řádků s neprázdným jménem v listu standings`,
    example: `List 'Elo standings' má 28 neprázdných řádků → Aktivní hráči = 28`,
  },
  {
    name: "Mediánové ELO",
    tag: "číslo",
    description: "Střední hodnota ELO hodnocení — polovina hráčů má ELO nad, polovina pod. Lépe než průměr odolává extrémním hodnotám.",
    formula: `1. Seřaď všechna ELO hodnocení vzestupně
2. Pokud lichý počet → median = hodnota uprostřed
3. Pokud sudý počet → median = průměr dvou prostředních`,
    example: `28 hráčů, ELO seřazena: [..., 1387, 1421, 1448, 1502, ...]
Pozice 14 a 15: 1421 a 1448
Mediánové ELO = (1421 + 1448) / 2 = 1434`,
  },
  {
    name: "Počet turnajů",
    tag: "číslo",
    description: "Celkový počet turnajů/akcí evidovaných v systému. Čte se z listu 'Data', sloupec B, od řádku 3 dolů.",
    formula: `Turnaje = počet neprázdných buněk v Data!B3 a níž`,
    example: `List 'Data' má v B3:B45 celkem 32 vyplněných buněk → Turnaje = 32`,
  },
  {
    name: "Top 5 hráčů (hero panel)",
    tag: "seznam",
    description: "Pět hráčů s nejvyšším ELO hodnocením ze standings. Zobrazují se v horním panelu přehledu s jejich aktuálním ELO, winrate a počtem her.",
    formula: `Top 5 = prvních 5 řádků standings seřazených dle ELO sestupně`,
    example: `#1 Marek  1847 | 62.7% | 142 her
#2 Ondra  1800 | 58.8% | 97 her
#3 Pavel  1763 | 55.6% | 63 her
#4 Lukáš  1741 | 52.3% | 44 her
#5 Tomáš  1698 | 49.8% | 88 her`,
  },
  {
    name: "Průměrné ELO zápasu",
    tag: "číslo",
    description: "Průměr ELO obou hráčů před zápasem. Slouží k identifikaci 'nejvyšších' zápasů — ty se s nejvyšším avgElo zobrazují v sekci 'Zajímavé zápasy'.",
    formula: `avgElo = (ELO_hráče1_před_zápasem + ELO_hráče2_před_zápasem) / 2

ELO před zápasem = aktuální ELO − změna ELO z toho zápasu`,
    example: `Marek hrál s ELO 1650 (po zápasu měl 1672, změna +22 → před = 1650)
Ondra hrál s ELO 1800 (po zápasu měl 1777, změna −22 → před = 1800)

avgElo = (1650 + 1800) / 2 = 1725`,
  },
  {
    name: "Rozdíl ELO zápasu (eloDiff)",
    tag: "číslo",
    description: "Absolutní rozdíl ELO hodnocení obou hráčů před zápasem. Zápasy s největším eloDiff se zobrazují v sekci 'Největší rozdíl ELO'.",
    formula: `eloDiff = |ELO_hráče1_před − ELO_hráče2_před|`,
    example: `Marek před = 1650, Ondra před = 1800
eloDiff = |1650 − 1800| = 150`,
  },
  {
    name: "Milníky",
    tag: "text",
    description: "Události zobrazené v sekci Milníky na hlavní stránce. Pokud jsou aktivní vlastní milníky (admin), zobrazí se ty. Jinak se zobrazí automaticky generované z ELO dat (posledních 30 dní).",
    formula: `Priorita zobrazení:
1. Vlastní milníky (admin) s visible=true → seřazené dle data
2. Automaticky generované z dat:
   - Aktuální #1 žebříčku
   - Největší zisk ELO za 7 dní
   - Největší propad ELO za 7 dní
   - Největší upset (30 dní)
   - Aktivní win streak lídr
   - Nový hráč s nejvyšším startem`,
    example: `Automatické milníky (příklad):
🏆 #1 žebříčku: Marek    (aktuálně)
📈 Největší zisk (7d): Lukáš +87   (12.03.2025)
📉 Největší propad (7d): Pavel −53  (14.03.2025)
⚡ Upset: Tomáš porazil Marka (rozdíl 149)  (10.03.2025)`,
  },
];

export default function DashboardLibraryPage() {
  return (
    <LibraryPage
      title="Přehled — obecný"
      subtitle="Metriky a hodnoty zobrazované na hlavní přehledové stránce komunity."
      icon="🏠"
      metrics={metrics}
    />
  );
}
