export const mockSlides = [
  {
    id: 1,
    headline: "DC ELO Rating System",
    subtext: "Compete. Rank. Dominate. Track your performance across all DC matches with our precision rating system.",
    cta: "View Leaderboard",
    tag: "Season Active",
  },
  {
    id: 2,
    headline: "Real-time Rankings",
    subtext: "Your rating updates after every match. See exactly where you stand in the competitive hierarchy.",
    cta: "Check Statistics",
    tag: "Live Data",
  },
  {
    id: 3,
    headline: "Tournament Edition",
    subtext: "DCPR tracks your tournament performance separately. Rise through the competitive ranks and claim your place at the top.",
    cta: "DCPR Standings",
    tag: "Tournament Mode",
  },
];

export const mockEloDistribution = [
  { range: "600–650", count: 2 },
  { range: "650–700", count: 4 },
  { range: "700–750", count: 8 },
  { range: "750–800", count: 14 },
  { range: "800–850", count: 22 },
  { range: "850–900", count: 35 },
  { range: "900–950", count: 48 },
  { range: "950–1000", count: 62 },
  { range: "1000–1050", count: 78 },
  { range: "1050–1100", count: 95 },
  { range: "1100–1150", count: 110 },
  { range: "1150–1200", count: 124 },
  { range: "1200–1250", count: 118 },
  { range: "1250–1300", count: 98 },
  { range: "1300–1350", count: 76 },
  { range: "1350–1400", count: 54 },
  { range: "1400–1450", count: 35 },
  { range: "1450–1500", count: 22 },
  { range: "1500–1550", count: 14 },
  { range: "1550–1600", count: 8 },
  { range: "1600–1650", count: 4 },
  { range: "1650–1700", count: 2 },
];

export const mockTimeSeriesGames = {
  "7d": [
    { date: "Mo", games: 12 }, { date: "Tu", games: 18 }, { date: "We", games: 9 },
    { date: "Th", games: 22 }, { date: "Fr", games: 31 }, { date: "Sa", games: 42 }, { date: "Su", games: 28 },
  ],
  "30d": Array.from({ length: 30 }, (_, i) => ({
    date: `${i + 1}`,
    games: Math.floor(Math.random() * 35) + 5,
  })),
  "3m": Array.from({ length: 12 }, (_, i) => ({
    date: `W${i + 1}`,
    games: Math.floor(Math.random() * 120) + 30,
  })),
  "6m": Array.from({ length: 24 }, (_, i) => ({
    date: `W${i + 1}`,
    games: Math.floor(Math.random() * 120) + 30,
  })),
};

export const mockTopPlayers = {
  "7d": [
    { name: "Karel", wins: 14 }, { name: "Martin", wins: 11 }, { name: "Petr", wins: 9 },
    { name: "Ondra", wins: 8 }, { name: "Jakub", wins: 7 },
  ],
  "30d": [
    { name: "Karel", wins: 42 }, { name: "Ondra", wins: 38 }, { name: "Martin", wins: 35 },
    { name: "Lukáš", wins: 31 }, { name: "Tomáš", wins: 28 },
  ],
  "3m": [
    { name: "Karel", wins: 120 }, { name: "Ondra", wins: 108 }, { name: "Martin", wins: 98 },
    { name: "Lukáš", wins: 88 }, { name: "Tomáš", wins: 75 },
  ],
  "6m": [
    { name: "Karel", wins: 220 }, { name: "Ondra", wins: 198 }, { name: "Martin", wins: 180 },
    { name: "Lukáš", wins: 165 }, { name: "Tomáš", wins: 140 },
  ],
};

export const mockWinrateByRating = [
  { range: "600-800", wr: 38 },
  { range: "800-1000", wr: 42 },
  { range: "1000-1100", wr: 49 },
  { range: "1100-1200", wr: 51 },
  { range: "1200-1300", wr: 56 },
  { range: "1300-1400", wr: 61 },
  { range: "1400-1600", wr: 68 },
];

export const mockRatingTrend = {
  "7d": [
    { date: "Mo", avg: 1142 }, { date: "Tu", avg: 1145 }, { date: "We", avg: 1141 },
    { date: "Th", avg: 1148 }, { date: "Fr", avg: 1152 }, { date: "Sa", avg: 1155 }, { date: "Su", avg: 1153 },
  ],
  "30d": Array.from({ length: 30 }, (_, i) => ({
    date: `${i + 1}`,
    avg: 1130 + Math.floor(Math.sin(i / 5) * 20) + i * 0.4,
  })),
  "3m": Array.from({ length: 12 }, (_, i) => ({
    date: `W${i + 1}`,
    avg: 1120 + i * 2.5 + Math.random() * 10,
  })),
  "6m": Array.from({ length: 24 }, (_, i) => ({
    date: `W${i + 1}`,
    avg: 1100 + i * 2 + Math.random() * 15,
  })),
};
