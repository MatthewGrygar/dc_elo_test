export type Lang = "cs" | "en" | "fr";

export const translations = {
  cs: {
    // Nav
    dashboard: "Přehled", leaderboard: "Žebříček", statistics: "Statistiky",
    analytics: "Analytika", records: "Rekordy", compare: "Porovnání",
    articles: "Články", organization: "Organizace", player: "Hráč",
    // Subtitles
    sub_dashboard: "Přehled & klíčové metriky", sub_leaderboard: "Žebříček hráčů",
    sub_statistics: "Detailní statistiky hráčů", sub_analytics: "Grafy & trendy vývoje",
    sub_records: "Rekordy & milníky komunity", sub_compare: "Porovnání hráčů face-to-face",
    sub_articles: "Novinky & turnajové zprávy", sub_organization: "O komisi, tým & kontakt",
    sub_player: "Detailní profil hráče",
    // Loading
    loading_elo: "Načítání ELO dat…", loading_dcpr: "Načítání DCPR dat…",
    loading_stats: "Připravuji statistiky…", loading_final: "Finalizace…",
    // UI
    search_placeholder: "Hledat hráče…", light_mode: "Světlý režim", dark_mode: "Tmavý režim",
    // Table
    rank: "Pořadí", player_name: "Hráč", rating: "Rating", games: "Zápasy",
    wins: "Výhry", losses: "Prohry", draws: "Remízy", peak: "Maximum", winrate: "Úspěšnost",
    // General
    no_data: "Žádná data k zobrazení", loading: "Načítání…", error: "Chyba při načítání dat",
    view_all: "Zobrazit vše",
    // Compare
    compare_title: "Porovnání hráčů", compare_desc: "Vyberte dva hráče pro detailní srovnání jejich statistik",
    select_player_a: "Vyberte hráče A", select_player_b: "Vyberte hráče B",
    compare_stats: "Statistiky", compare_radar: "Radarový přehled",
    // Articles
    article_all: "Vše", article_tournament: "Turnaje", article_analysis: "Analýzy",
    article_news: "Novinky", article_report: "Zprávy",
    min_read: "min čtení",
    // Organization
    org_activities: "Hlavní činnosti", org_cooperation: "Spolupráce", org_team: "Tým komise",
    org_contact_us: "Kontaktujte nás",
    // Player subtabs
    overview: "Přehled", opponents: "Protihráči", tournament_history: "Turnaje", match_history: "Historie",
    // Records
    all_time: "All-Time",
  },
  en: {
    dashboard: "Dashboard", leaderboard: "Leaderboard", statistics: "Statistics",
    analytics: "Analytics", records: "Records", compare: "Compare",
    articles: "Articles", organization: "Organization", player: "Player",
    sub_dashboard: "Overview & key metrics", sub_leaderboard: "Player rankings",
    sub_statistics: "Detailed player stats", sub_analytics: "Charts & rating trends",
    sub_records: "Community records & milestones", sub_compare: "Head-to-head player comparison",
    sub_articles: "News & tournament reports", sub_organization: "About the committee, team & contact",
    sub_player: "Detailed player profile",
    loading_elo: "Loading ELO data…", loading_dcpr: "Loading DCPR data…",
    loading_stats: "Preparing statistics…", loading_final: "Finalizing…",
    search_placeholder: "Search player…", light_mode: "Light mode", dark_mode: "Dark mode",
    rank: "Rank", player_name: "Player", rating: "Rating", games: "Games",
    wins: "Wins", losses: "Losses", draws: "Draws", peak: "Peak", winrate: "Winrate",
    no_data: "No data to display", loading: "Loading…", error: "Failed to load data",
    view_all: "View all",
    compare_title: "Player Comparison", compare_desc: "Select two players for a detailed head-to-head stats comparison",
    select_player_a: "Select player A", select_player_b: "Select player B",
    compare_stats: "Statistics", compare_radar: "Radar overview",
    article_all: "All", article_tournament: "Tournaments", article_analysis: "Analysis",
    article_news: "News", article_report: "Reports",
    min_read: "min read",
    org_activities: "Main activities", org_cooperation: "Cooperation", org_team: "Committee team",
    org_contact_us: "Contact us",
    overview: "Overview", opponents: "Opponents", tournament_history: "Tournaments", match_history: "History",
    all_time: "All-Time",
  },
  fr: {
    dashboard: "Tableau de bord", leaderboard: "Classement", statistics: "Statistiques",
    analytics: "Analytique", records: "Records", compare: "Comparer",
    articles: "Articles", organization: "Organisation", player: "Joueur",
    sub_dashboard: "Vue d'ensemble & métriques", sub_leaderboard: "Classement des joueurs",
    sub_statistics: "Statistiques détaillées", sub_analytics: "Graphiques & tendances",
    sub_records: "Records & jalons de la communauté", sub_compare: "Comparaison face-à-face",
    sub_articles: "Actualités & rapports de tournois", sub_organization: "À propos, équipe & contact",
    sub_player: "Profil détaillé du joueur",
    loading_elo: "Chargement des données ELO…", loading_dcpr: "Chargement des données DCPR…",
    loading_stats: "Préparation des statistiques…", loading_final: "Finalisation…",
    search_placeholder: "Rechercher un joueur…", light_mode: "Mode clair", dark_mode: "Mode sombre",
    rank: "Rang", player_name: "Joueur", rating: "Classement", games: "Parties",
    wins: "Victoires", losses: "Défaites", draws: "Nuls", peak: "Pic", winrate: "Taux de victoire",
    no_data: "Aucune donnée à afficher", loading: "Chargement…", error: "Échec du chargement",
    view_all: "Voir tout",
    compare_title: "Comparaison de joueurs", compare_desc: "Sélectionnez deux joueurs pour une comparaison détaillée",
    select_player_a: "Sélectionner joueur A", select_player_b: "Sélectionner joueur B",
    compare_stats: "Statistiques", compare_radar: "Vue radar",
    article_all: "Tout", article_tournament: "Tournois", article_analysis: "Analyses",
    article_news: "Actualités", article_report: "Rapports",
    min_read: "min de lecture",
    org_activities: "Activités principales", org_cooperation: "Coopération", org_team: "Équipe",
    org_contact_us: "Contactez-nous",
    overview: "Aperçu", opponents: "Adversaires", tournament_history: "Tournois", match_history: "Historique",
    all_time: "Tous les temps",
  },
} as const;

export type TKey = keyof typeof translations.cs;

export function t(lang: Lang, key: TKey): string {
  return (
    (translations[lang] as Record<string, string>)[key] ??
    (translations.cs as Record<string, string>)[key] ??
    String(key)
  );
}
