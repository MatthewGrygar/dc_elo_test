import { LibraryPage, type Metric } from "../_components/MetricCard";

const metrics: Metric[] = [
  {
    name: "ELO histogram",
    tag: "graf",
    description: "Rozdělení hráčů do ELO košů (bucketů) po 50 bodech. Ukazuje jak jsou hráči distribuováni — jestli je komunita rovnoměrná nebo se hromadí kolem určitých hodnot.",
    formula: `Pro každého hráče: bucket = floor(ELO / 50) × 50
Spočítej kolik hráčů je v každém bucketu
Gaussova křivka = teoretické normální rozdělení pro srovnání

gauss = (1 / (σ√(2π))) × e^(−(x−μ)²/(2σ²))`,
    example: `28 hráčů, průměr μ = 1487, směrodatná odchylka σ = 187

Bucket 1400–1450: 4 hráči (skutečnost)
               2.8 hráčů (Gauss)

Bucket 1450–1500: 5 hráčů (skutečnost)
               3.1 hráčů (Gauss)`,
  },
  {
    name: "Winrate distribuce",
    tag: "graf",
    description: "Rozdělení hráčů podle jejich winrate v krocích po 5 %. Odhaluje zda komunita má zdravé rozložení nebo se hráči shlukují na extrémech.",
    formula: `Pro každého hráče: bucket = floor(winrate / 0.05) × 0.05
Sečti hráče v každém bucketu
Gauss = normální rozdělení pro porovnání`,
    example: `Bucket 55–60% (0.55–0.60):
  Marek 62.7%, Ondra 58.8% → 2 hráči skutečnost
  Gauss → 1.8 hráčů (normální)

Bucket 45–50%: 7 hráčů → většina kolem středu ✓`,
  },
  {
    name: "Activity heatmap (per měsíc)",
    tag: "graf",
    description: "Počet zápasů v každém měsíci. Ukazuje sezónní trendy — kdy komunita hraje nejvíc.",
    formula: `Pro každý zápas: period = "YYYY-MM" z datumu
Sečti zápasy per period
Seřaď chronologicky`,
    example: `Leden 2025:  47 zápasů
Únor 2025:   38 zápasů   (méně − prázdniny)
Březen 2025: 61 zápasů   (peak − turnajový měsíc)`,
  },
  {
    name: "Průměrný ELO trend",
    tag: "graf",
    description: "Jak se vyvíjel průměrný ELO celé komunity v čase. Stoupající trend = celková inflace, klesající = deflace.",
    formula: `avgEloTrend:
  Pro každý měsíc: spočítej průměr ELO všech aktivních hráčů
  trend = lineární regrese posledních 3 měsíců (slope)`,
    example: `Led 2025: průměr = 1450 ELO
Úno 2025: průměr = 1461 ELO  (+11)
Bře 2025: průměr = 1478 ELO  (+17)

trend = +14 ELO/měsíc (mírná inflace)`,
  },
  {
    name: "ELO vs. Počet her (scatter)",
    tag: "graf",
    description: "Bodový graf kde každý hráč = jeden bod: osa X = počet her, osa Y = aktuální ELO. Odhaluje zda více her = vyšší ELO (korelace).",
    formula: `Pearsonova korelace r:
r = Σ((xi−x̄)(yi−ȳ)) / √(Σ(xi−x̄)² × Σ(yi−ȳ)²)

r > 0 = pozitivní korelace (víc her = vyšší ELO)
r ≈ 0 = žádná korelace`,
    example: `28 hráčů:
Marek: 142 her, ELO 1847
Lukáš:  44 her, ELO 1741
Nový:    8 her, ELO 1210

Pearsonova korelace r ≈ 0.61
→ mírně pozitivní: zkušenější hráči mají vyšší ELO`,
  },
  {
    name: "Gini over time",
    tag: "graf",
    description: "Vývoj Gini koeficientu v čase. Klesající Gini = komunita se vyrovnává, stoupající = bohatí bohatnou (dobří hráči se vzdalují od ostatních).",
    formula: `Pro každý měsíc: spočítej Gini z ELO aktivních hráčů
Gini = (2 × Σ((i+1) × ELO[i])) / (n × ΣELO) − (n+1)/n`,
    example: `Led 2025: Gini = 0.18
Úno 2025: Gini = 0.16  (komunita se srovnává)
Bře 2025: Gini = 0.14  (dobrý trend)`,
  },
  {
    name: "Rivalry network",
    tag: "graf",
    description: "Síťový graf propojení hráčů. Každý hráč = uzel, každá hrana = soupeření (alespoň 2 vzájemné zápasy). Tloušťka hrany = počet vzájemných zápasů.",
    formula: `Uzly: všichni hráči s ELO a celkovými hrami
Hrany: dvojice hráčů s ≥2 vzájemnými zápasy
  weight = počet vzájemných zápasů
  winner = hráč s vyšší winrate ve vzájemných zápasech`,
    example: `Marek vs Ondra: 8 zápasů, Marek vyhrál 5 (62.5%)
→ hrana Marek−Ondra, weight=8, winner=Marek

Ondra vs Pavel: 3 zápasy, Ondra vyhrál 2
→ hrana Ondra−Pavel, weight=3, winner=Ondra`,
  },
  {
    name: "ELO change distribuce",
    tag: "graf",
    description: "Histogram změn ELO po jednotlivých zápasech. Ukazuje jak velké jsou typické zisky a prohry. Symetrické rozdělení kolem 0 = systém je vyvážený.",
    formula: `Pro každou kartu: vezmi ELO změnu (sloupec H)
Bucket = round(změna / 5) × 5
Sečti záznamy v každém bucketu`,
    example: `Záznamy: +22, −22, +18, −18, +8, −8, +31, −31...

Bucket  0 až +5:  12 záznamů
Bucket +5 až +10: 18 záznamů
Bucket +10 až +15: 31 záznamů  (nejčastější)
Bucket −10 až −15: 29 záznamů  (symetrie)`,
  },
  {
    name: "New player trajectory",
    tag: "graf",
    description: "Průměrná ELO křivka nových hráčů od jejich 1. do N-tého zápasu. Ukazuje jak rychle se noví hráči zařazují do žebříčku.",
    formula: `Pro každého hráče: vezmi jeho ELO po každém zápase (chronologicky)
Pro každou pozici i (1., 2., 3., ... zápas):
  avgElo[i] = průměr ELO přes všechny hráče v i-tém zápase`,
    example: `Zápas #1: průměrné ELO = 1210  (startovní odhad)
Zápas #5: průměrné ELO = 1284  (rychlé zařazení)
Zápas #15: průměrné ELO = 1352  (stabilizace)
Zápas #30: průměrné ELO = 1391  (dlouhodobý průměr)`,
  },
];

export default function AnalyticsLibraryPage() {
  return (
    <LibraryPage
      title="Analytika"
      subtitle="Grafy a pokročilé vizualizace distribucí, trendů a síťových vztahů v komunitě."
      icon="🔬"
      metrics={metrics}
      pageId="analytics"
    />
  );
}
