// i18n.js – lightweight client-side translations (CS/EN/FR)
// Usage:
//  - Add data-i18n="key" for textContent
//  - Add data-i18n-placeholder="key" for placeholders
//  - Add data-i18n-title="key" / data-i18n-aria="key" for attributes

const STORAGE_KEY = "dc_elo_lang";

/** @type {const} */
export const LANGS = ["cs", "en", "fr"];

/** @type {Record<string, Record<string, string>>} */
const DICT = {
  cs: {
    // Global
    site_title: "DC ELO žebříček",
    by_grail: "by GRAIL SERIES",
    by_word: "by",
    menu: "Menu",
    support: "Podpořit",
    theme_mode: "Režim",
    theme_light: "☀️ Světlý",
    theme_dark: "Tmavý 🌙",
    back: "Zpět",
    back_home: "Zpět na titulní",

    // Index hero / copy
    project_desc:
      "Systém ELO pro spravedlivé a transparentní hodnocení hráčů Duel Commanderu.",
    anon_line: "Nechcete mít na webu uvedené své jméno? ",
    anon_link: "Klikněte sem",
    anon_modal_title: "Anonymizace",
    anon_modal_h1: "Nechcete být na webu uvedeni?",
    anon_modal_p1: "Rozumíme tomu.",
    anon_modal_p2:
      "Zveřejňovaná data pocházejí z veřejně dostupných zdrojů, od organizátorů turnajů a lig nebo od heren, které s námi spolupracují. Projekt slouží k přehlednému zobrazování těchto informací na jednom místě.",
    anon_modal_p3:
      "Pokud si nepřejete být na webu dohledatelní pod svým jménem, vaše údaje kompletně anonymizujeme, takže vás podle nich již nebude možné identifikovat. Pro anonymizaci vyplňte následující formulář.",
    anon_modal_btn: "Přejít na formulář",


    // Carousel
    carousel_prev: "Předchozí slide",
    carousel_next: "Další slide",
    carousel_open: "Otevřít odkaz ze slideru",

    // Info bar
    info_median_elo: "Medián ELO",
    info_total_games: "celkový počet her",
    info_unique_players: "unikátní hráči",
    info_last_data: "poslední data",

    // Toolbar
    search_placeholder: "Hledat hráče…",
    reload: "Znovu načíst",
    rated_only: "Pouze DCPR",
    rated_only_aria: "Pouze DCPR",

    // Table headers
    th_rank: "Pořadí",
    th_player: "Hráč",
    th_rating: "Rating",
    th_peak: "PEAK",
    th_games: "Games",
    th_win: "Win",
    th_loss: "Loss",
    th_draw: "Draw",
    th_winrate: "Winrate",

    // Footer
    tip_click_player: "Tip: Klikni na jméno hráče pro detail.",
    version: "verze",

    // Menu items
    menu_news: "AKTUALITY",
    menu_management: "VEDENÍ",
    menu_articles: "ČLÁNKY",
    menu_titles: "TITULY",
    menu_contact: "KONTAKT",
    menu_records: "REKORDY",
    menu_upload: "NAHRÁNÍ DAT",

    // Common modal destinations
    upload_title: "Nahrání dat",
    upload_sub: "Formulář",
    upload_desc: "Data se nahrávají přes Google formulář.",
    upload_open: "Otevřít formulář",

    news_title: "Aktuality",

    management_title: "Vedení",
    management_sub: "Placeholder",
    management_body: "Obsah bude doplněn.",

    articles_title: "Články",
    articles_sub: "Placeholder",
    articles_body: "Obsah bude doplněn.",

    article_read: "Číst článek",
    article_elo_image: "assets/images/slider/carousel_cz_2.png",
    article_elo_title: "Jak počítáme Elo a výkonnostní třídy v Duel Commander komunitě",
    article_elo_excerpt: "Přesné nastavení našeho modifikovaného Elo modelu a datově řízených tříd Class A–D.",
    article_elo_body: `
      <p>V Duel Commander komunitě používáme systém hodnocení, jehož cílem je dlouhodobě, transparentně a konzistentně odhadovat výkonnost hráčů na základě skutečně odehraných matchů. Základem je modifikovaný model Elo, doplněný o datově řízenou segmentaci hráčů do čtyř tříd (Class A–D). Tento text shrnuje přesné nastavení systému, jeho matematický základ i praktické důsledky.</p>

      <p>Metodicky vycházíme z kalibrace používané v MTG Elo Project, která je navržena pro prostředí karetních her s vyšší variancí výsledků. Cílem není vytvořit agresivní žebříček s extrémními rozdíly, ale stabilní a realistický odhad relativní síly hráčů.</p>

      <h3>Elo jako průběžný odhad výkonnosti</h3>
      <p>Každý hráč vstupuje do systému s počátečním ratingem <b>1500</b> bodů. Rating se následně upravuje po každém odehraném matchi podle klasického Elo principu: změna je úměrná rozdílu mezi očekávaným a skutečným výsledkem. Použitý vývojový parametr je <b>K = 36</b>.</p>

      <p>Očekávané skóre počítáme podle vztahu:</p>
      <div class="mathBlock"><code>E = 1 / (1 + 10^((Rb − Ra)/1135))</code></div>

      <p>Klíčovým parametrem je konstanta <b>1135</b>, která určuje „plošnost“ křivky očekávání. V praxi znamená, že rozdíl 200 ratingových bodů odpovídá přibližně 60% očekávané úspěšnosti silnějšího hráče (oproti šachové škále 400 je model výrazně méně strmý).</p>

      <p>Samotná aktualizace ratingu probíhá podle vztahu:</p>
      <div class="mathBlock"><code>R' = R + K (S − E)</code></div>
      <p>kde <code>S</code> je skutečný výsledek (1 za výhru, 0 za prohru, 0.5 za remízu).</p>

      <h3>Co se do modelu započítává — a co ne</h3>
      <ul>
        <li>Model pracuje výhradně s výsledkem matchu (2–0 a 2–1 má stejný dopad).</li>
        <li>BYE nemá na rating žádný vliv.</li>
        <li>Nevalidní nebo neúplné záznamy se nezapočítávají.</li>
      </ul>

      <h3>Praktická interpretace ratingových rozdílů</h3>
      <ul>
        <li>0 bodů → 50 % očekávání</li>
        <li>~100 bodů → 55 %</li>
        <li>200 bodů → 60 %</li>
        <li>300 bodů → ~65 %</li>
        <li>400 bodů → ~69 %</li>
      </ul>

      <h3>Od spojitého ratingu k třídám A–D</h3>
      <p>Nad ratingem aplikujeme shlukovou analýzu pomocí algoritmu <b>k-means</b>. Clustering se aplikuje pouze na hráče, kteří mají rating alespoň 1500 a odehráli minimálně 10 her. Používáme <b>k = 4</b> (čtyři clustery), které mapujeme na Class A–D.</p>

      <p>Třídy vznikají z přirozené struktury dat (minimalizace „inertia“), nikoli podle předem daných hranic. Hranice mezi třídami tedy nejsou pevně definovány konkrétním číslem – vznikají emergentně z aktuálního rozložení ratingů v komunitě.</p>

      <h3>Provozní režim systému</h3>
      <p>Hodnocení i klasifikace jsou plně automatizované: po každé aktualizaci dat se přepočítají ratingy a znovu provede clustering na kvalifikovaných hráčích. Systém je dynamický a reaguje na vývoj komunity v reálném čase.</p>

      <h3>Závěrečné shrnutí</h3>
      <p>Model kombinuje modifikované Elo s plošší škálou očekávání a datově řízený k-means clustering. Výsledkem je konzistentní odhad výkonnosti založený na odehraných zápasech, realistická interpretace rozdílů a přehledná segmentace bez arbitrárních hranic.</p>
    `,

    leader_matthew_role: "Předseda a zakladatel DCPR komise, spoluzakladatel Grail Series, spoluzakladatel ELO projektu",
    leader_ervin_role: "Člen DCPR komise, spoluzakladatel Grail Series, spoluzakladatel ELO projektu, architekt datového řešení DC ELO",

    // Support modal
    support_modal_title: "Podpořit",
    support_hero_title: "Podpořte DC ELO",
    support_hero_brand: "BY GRAIL SERIES",
    support_hero_tag: "Vaše podpora nám pomáhá organizovat lepší turnaje",
    support_acc_title: "INFORMACE O ÚČTU:",
    support_acc_aria: "Informace pro podporu",
    support_method_switch_aria: "Zvolte způsob podpory",
    support_method_bank: "BANKOVNÍ ÚČET",
    support_method_paypal: "PAYPAL",
    support_qr_alt: "QR kód pro platbu",
    support_acc_name: "NÁZEV ÚČTU",
    support_acc_name_value: "GRAIL SERIES",
    support_acc_number: "ČÍSLO ÚČTU",
    support_iban: "IBAN",
    support_bic: "BIC(SWIFT)",
    support_paypal_title: "PAYPAL:",
    support_paypal_email: "PayPal e-mail",
    support_paypal_me: "PayPal.me:",
    support_copy: "Kopírovat",
    support_thanks: "Děkujeme",
    support_thanks_aria: "Poděkování",
    copied: "Zkopírováno",
    copy_fail: "Nelze zkopírovat",

    // App (player detail)
    loading: "Načítám…",
    loading_player_data: "Načítám data hráče…",
    player_detail: "Detail hráče",
    opponents: "PROTIHRÁČI",
    current_rating: "aktuální rating",
    elo_evolution: "Vývoj ELO",
    dcpr_evolution: "Vývoj DCPR",
    chart_no_data: "Graf nelze vykreslit (málo dat).",
    data_load_failed: "❌ Data se nepodařilo načíst. Zkus „Znovu načíst“.",
    player_not_found: "❌ Podrobná data hráče nenalezena",
    avg_opp_elo: "Průměr ELO soupeřů:",
    opp_none: "Žádní soupeři nenalezeni.",
    opp_th_opponent: "Soupeř",
    opp_th_games: "Počet her",
    opp_subtitle: "Protihráči",
    opp_back: "← Zpět",
    opp_section_title: "Soupeři hráče:",
    opp_search_placeholder: "Hledat soupeře…",
    data_load_failed: "❌ Data se nepodařilo načíst. Zkus „Znovu načíst“.",
    player_data_not_found: "❌ Podrobná data hráče nenalezena",
    avg_opp_elo: "Průměr ELO soupeřů:",

    // Simple pages
    contact_title: "KONTAKT",
    contact_desc: "Kontakt a informace (zatím placeholder).",
    contact_h2: "KONTAKT",
    contact_p:
      "Tady bude kontaktní stránka, odkazy a základní informace o projektu. Později ji společně doladíme.",

    titles_title: "TITULY",
    titles_desc: "Přehled titulů (zatím placeholder).",
    records_title: "REKORDY",
    records_desc: "Rekordy a statistiky (zatím placeholder).",
  },

  en: {
    site_title: "DC ELO Rankings",
    by_grail: "by GRAIL SERIES",
    by_word: "by",
    menu: "Menu",
    support: "Support",
    theme_mode: "Mode",
    theme_light: "☀️ Light",
    theme_dark: "Dark 🌙",
    back: "Back",
    back_home: "Back to home",

    project_desc:
      "An ELO system for fair and transparent Duel Commander player ratings.",
    anon_line: "Don’t want your name shown on the website? ",
    anon_link: "Click here",
    anon_modal_title: "Anonymization",
    anon_modal_h1: "Don’t want to appear on the website?",
    anon_modal_p1: "We understand.",
    anon_modal_p2:
      "The published data comes from publicly available sources, tournament and league organizers, or stores that cooperate with us. This project helps display this information clearly in one place.",
    anon_modal_p3:
      "If you don’t want to be searchable on the website under your name, we can fully anonymize your data so you can’t be identified. To request anonymization, please fill out the form below.",
    anon_modal_btn: "Open the form",


    carousel_prev: "Previous slide",
    carousel_next: "Next slide",
    carousel_open: "Open slide link",

    info_median_elo: "Median ELO",
    info_total_games: "total games",
    info_unique_players: "unique players",
    info_last_data: "latest data",

    search_placeholder: "Search players…",
    reload: "Reload",
    rated_only: "DCPR only",
    rated_only_aria: "DCPR only",

    th_rank: "Rank",
    th_player: "Player",
    th_rating: "Rating",
    th_peak: "PEAK",
    th_games: "Games",
    th_win: "Win",
    th_loss: "Loss",
    th_draw: "Draw",
    th_winrate: "Winrate",

    tip_click_player: "Tip: Click a player's name to view details.",
    version: "version",

    menu_news: "NEWS",
    menu_management: "MANAGEMENT",
    menu_articles: "ARTICLES",
    menu_titles: "TITLES",
    menu_contact: "CONTACT",
    menu_records: "RECORDS",
    menu_upload: "UPLOAD DATA",

    upload_title: "Upload data",
    upload_sub: "Form",
    upload_desc: "Data is submitted via a Google Form.",
    upload_open: "Open form",

    news_title: "News",

    management_title: "Management",
    management_sub: "Placeholder",
    management_body: "Content will be added.",

    articles_title: "Articles",
    articles_sub: "Placeholder",
    articles_body: "Content will be added.",

    article_read: "Read article",
    article_elo_image: "assets/images/slider/carousel_eng_2.png",
    article_elo_title: "How we calculate Elo and performance classes in the Duel Commander community",
    article_elo_excerpt: "The exact settings of our modified Elo model and the data-driven Class A–D segmentation.",
    article_elo_body: `
      <p>In the Duel Commander community we use a rating system designed to estimate player performance over the long term in a transparent and consistent way, based on actually played matches. The core is a modified Elo model, complemented by a data-driven segmentation of players into four classes (Class A–D). This article summarizes the exact setup, the math behind it, and its practical implications.</p>

      <p>Methodologically, we build on the calibration used in the MTG Elo Project, tailored for card games with higher result variance. The goal is not an aggressive ladder with extreme gaps, but a stable and realistic estimate of relative strength.</p>

      <h3>Elo as a running performance estimate</h3>
      <p>Each player enters the system with an initial rating of <b>1500</b>. After every match, the rating is updated according to the classic Elo principle: the change is proportional to the difference between expected and actual outcome. We use <b>K = 36</b>.</p>

      <p>Expected score is computed as:</p>
      <div class="mathBlock"><code>E = 1 / (1 + 10^((Rb − Ra)/1135))</code></div>

      <p>The key parameter is the constant <b>1135</b>, which makes the expectation curve flatter. In practice, a 200-point difference corresponds to roughly a 60% expected win rate for the stronger player (much less steep than chess’ 400 scale).</p>

      <p>The rating update is:</p>
      <div class="mathBlock"><code>R' = R + K (S − E)</code></div>
      <p>where <code>S</code> is the actual result (1 win, 0 loss, 0.5 draw).</p>

      <h3>What is counted — and what is not</h3>
      <ul>
        <li>Only match result matters (2–0 and 2–1 have the same impact).</li>
        <li>BYEs have no effect on rating.</li>
        <li>Invalid or incomplete records are excluded.</li>
      </ul>

      <h3>Interpreting rating differences</h3>
      <ul>
        <li>0 points → 50% expected</li>
        <li>~100 points → 55%</li>
        <li>200 points → 60%</li>
        <li>300 points → ~65%</li>
        <li>400 points → ~69%</li>
      </ul>

      <h3>From a continuous rating to Classes A–D</h3>
      <p>On top of Elo we apply clustering using <b>k-means</b>. Clustering is applied only to players with rating at least 1500 and at least 10 matches played. We use <b>k = 4</b>, mapping clusters to Classes A–D.</p>

      <p>Classes emerge from the natural structure of the data (minimizing inertia), not from fixed numeric thresholds. Boundaries therefore shift with the current distribution of ratings in the community.</p>

      <h3>Operational mode</h3>
      <p>Ratings and classes are fully automated: after any data update, all ratings are recomputed and clustering is rerun for eligible players. The system is dynamic and adapts in real time.</p>

      <h3>Summary</h3>
      <p>The model combines a flatter modified Elo with data-driven k-means clustering. The result is a consistent match-based estimate, a realistic interpretation of differences in a high-variance card game, and a clear segmentation without arbitrary cutoffs.</p>
    `,

    leader_matthew_role: "Chair and founder of the DCPR commission, co-founder of Grail Series, co-founder of the ELO project",
    leader_ervin_role: "Member of the DCPR commission, co-founder of Grail Series, co-founder of the ELO project, architect of the DC ELO data solution",

    support_modal_title: "Support",
    support_hero_title: "Support DC ELO",
    support_hero_brand: "BY GRAIL SERIES",
    support_hero_tag: "Your support helps us organize better tournaments",
    support_acc_title: "ACCOUNT INFORMATION:",
    support_acc_aria: "Support information",
    support_method_switch_aria: "Choose a support method",
    support_method_bank: "BANK ACCOUNT",
    support_method_paypal: "PAYPAL",
    support_qr_alt: "Payment QR code",
    support_acc_name: "ACCOUNT NAME",
    support_acc_name_value: "GRAIL SERIES",
    support_acc_number: "ACCOUNT NUMBER",
    support_iban: "IBAN",
    support_bic: "BIC(SWIFT)",
    support_paypal_title: "PAYPAL:",
    support_paypal_email: "PayPal e-mail",
    support_paypal_me: "PayPal.me:",
    support_copy: "Copy",
    support_thanks: "Thank you",
    support_thanks_aria: "Thanks",
    copied: "Copied",
    copy_fail: "Copy failed",

    // App (player detail)
    loading: "Loading…",
    loading_player_data: "Loading player data…",
    player_detail: "Player detail",
    opponents: "OPPONENTS",
    current_rating: "current rating",
    elo_evolution: "ELO progression",
    dcpr_evolution: "DCPR progression",
    chart_no_data: "Chart can’t be rendered (not enough data).",
    data_load_failed: "❌ Failed to load data. Try “Reload”.",
    player_not_found: "❌ Player details not found",
    avg_opp_elo: "Average opponent ELO:",
    opp_none: "No opponents found.",
    opp_th_opponent: "Opponent",
    opp_th_games: "Games",
    opp_subtitle: "Opponents",
    opp_back: "← Back",
    opp_section_title: "Opponents of player:",
    opp_search_placeholder: "Search opponents…",
    data_load_failed: "❌ Failed to load data. Try Reload.",
    player_data_not_found: "❌ Detailed player data not found",
    avg_opp_elo: "Average opponent ELO:",

    contact_title: "CONTACT",
    contact_desc: "Contact and info (placeholder).",
    contact_h2: "CONTACT",
    contact_p:
      "This page will contain contact details, links, and basic project information. We’ll refine it together later.",

    titles_title: "TITLES",
    titles_desc: "Titles overview (placeholder).",
    records_title: "RECORDS",
    records_desc: "Records & stats (placeholder).",
  },

  fr: {
    site_title: "Classement DC ELO",
    by_grail: "par GRAIL SERIES",
    by_word: "par",
    menu: "Menu",
    support: "Soutenir",
    theme_mode: "Mode",
    theme_light: "☀️ Clair",
    theme_dark: "Sombre 🌙",
    back: "Retour",
    back_home: "Retour à l’accueil",

    project_desc:
      "Un système ELO pour une évaluation juste et transparente des joueurs de Duel Commander.",
    anon_line: "Vous ne voulez pas que votre nom apparaisse sur le site ? ",
    anon_link: "Cliquez ici",
    anon_modal_title: "Anonymisation",
    anon_modal_h1: "Vous ne voulez pas apparaître sur le site ?",
    anon_modal_p1: "Nous comprenons.",
    anon_modal_p2:
      "Les données publiées proviennent de sources publiques, des organisateurs de tournois et de ligues, ou des boutiques qui coopèrent avec nous. Ce projet permet d’afficher clairement ces informations en un seul endroit.",
    anon_modal_p3:
      "Si vous ne souhaitez pas être recherché sur le site sous votre nom, nous pouvons anonymiser complètement vos données afin qu’elles ne permettent plus de vous identifier. Pour demander l’anonymisation, veuillez remplir le formulaire ci-dessous.",
    anon_modal_btn: "Ouvrir le formulaire",


    carousel_prev: "Diapositive précédente",
    carousel_next: "Diapositive suivante",
    carousel_open: "Ouvrir le lien de la diapositive",

    info_median_elo: "ELO médian",
    info_total_games: "parties totales",
    info_unique_players: "joueurs uniques",
    info_last_data: "dernières données",

    search_placeholder: "Rechercher un joueur…",
    reload: "Recharger",
    rated_only: "DCPR uniquement",
    rated_only_aria: "DCPR uniquement",

    th_rank: "Rang",
    th_player: "Joueur",
    th_rating: "Classement",
    th_peak: "PIC",
    th_games: "Parties",
    th_win: "Victoires",
    th_loss: "Défaites",
    th_draw: "Nuls",
    th_winrate: "Taux",

    tip_click_player: "Astuce : cliquez sur le nom d’un joueur pour voir le détail.",
    version: "version",

    menu_news: "ACTUALITÉS",
    menu_management: "ÉQUIPE",
    menu_articles: "ARTICLES",
    menu_titles: "TITRES",
    menu_contact: "CONTACT",
    menu_records: "RECORDS",
    menu_upload: "ENVOYER DES DONNÉES",

    upload_title: "Envoyer des données",
    upload_sub: "Formulaire",
    upload_desc: "Les données sont envoyées via un formulaire Google.",
    upload_open: "Ouvrir le formulaire",

    news_title: "Actualités",

    management_title: "Équipe",
    management_sub: "Placeholder",
    management_body: "Le contenu sera ajouté.",

    articles_title: "Articles",
    articles_sub: "Placeholder",
    articles_body: "Le contenu sera ajouté.",

    article_read: "Lire l’article",
    article_elo_image: "assets/images/slider/carousel_fr_2.png",
    article_elo_title: "Comment nous calculons l’Elo et les classes de performance dans la communauté Duel Commander",
    article_elo_excerpt: "Le paramétrage exact de notre modèle Elo modifié et la segmentation data-driven en Classes A–D.",
    article_elo_body: `
      <p>Dans la communauté Duel Commander, nous utilisons un système de classement dont l’objectif est d’estimer la performance des joueurs de manière durable, transparente et cohérente, à partir des matchs réellement joués. Le cœur du système est un modèle Elo modifié, complété par une segmentation pilotée par les données en quatre classes (Class A–D). Cet article résume le paramétrage, les bases mathématiques et les implications pratiques.</p>

      <p>Sur le plan méthodologique, nous nous appuyons sur la calibration du MTG Elo Project, adaptée aux jeux de cartes avec une variance plus élevée. L’objectif n’est pas une échelle agressive avec des écarts extrêmes, mais une estimation stable et réaliste de la force relative.</p>

      <h3>L’Elo comme estimation continue</h3>
      <p>Chaque joueur démarre avec une valeur initiale de <b>1500</b>. Après chaque match, le score est mis à jour selon le principe Elo classique : la variation est proportionnelle à l’écart entre résultat attendu et résultat réel. Nous utilisons <b>K = 36</b>.</p>

      <p>Le score attendu est :</p>
      <div class="mathBlock"><code>E = 1 / (1 + 10^((Rb − Ra)/1135))</code></div>

      <p>La constante clé est <b>1135</b>, qui rend la courbe d’attente plus « plate ». En pratique, 200 points d’écart correspondent à environ 60% de probabilité de victoire attendue pour le joueur le plus fort (bien moins raide que l’échelle 400 aux échecs).</p>

      <p>La mise à jour du rating est :</p>
      <div class="mathBlock"><code>R' = R + K (S − E)</code></div>
      <p>où <code>S</code> est le résultat réel (1 victoire, 0 défaite, 0.5 nul).</p>

      <h3>Ce qui est compté — et ce qui ne l’est pas</h3>
      <ul>
        <li>Seul le résultat du match compte (2–0 et 2–1 ont le même impact).</li>
        <li>Les BYE n’affectent pas le rating.</li>
        <li>Les enregistrements invalides ou incomplets sont exclus.</li>
      </ul>

      <h3>Interpréter les écarts de rating</h3>
      <ul>
        <li>0 point → 50% attendu</li>
        <li>~100 points → 55%</li>
        <li>200 points → 60%</li>
        <li>300 points → ~65%</li>
        <li>400 points → ~69%</li>
      </ul>

      <h3>D’un rating continu aux Classes A–D</h3>
      <p>Au-dessus de l’Elo, nous appliquons un clustering <b>k-means</b>. Il est appliqué uniquement aux joueurs avec un rating ≥ 1500 et au moins 10 matchs. Nous utilisons <b>k = 4</b>, puis associons les clusters aux Classes A–D.</p>

      <p>Les classes émergent de la structure naturelle des données (minimisation de l’inertie), et non de seuils fixes. Les frontières évoluent donc avec la distribution actuelle des ratings.</p>

      <h3>Fonctionnement</h3>
      <p>Le classement et la classification sont entièrement automatisés : après chaque mise à jour des données, tous les ratings sont recalculés et le clustering est relancé pour les joueurs éligibles. Le système est dynamique et s’adapte en temps réel.</p>

      <h3>Résumé</h3>
      <p>Le modèle combine un Elo modifié plus « plat » et un clustering k-means piloté par les données. On obtient une estimation cohérente basée sur les matchs, une interprétation réaliste des écarts dans un jeu à forte variance, et une segmentation claire sans seuils arbitraires.</p>
    `,

    leader_matthew_role: "Président et fondateur de la commission DCPR, cofondateur de Grail Series, cofondateur du projet ELO",
    leader_ervin_role: "Membre de la commission DCPR, cofondateur de Grail Series, cofondateur du projet ELO, architecte de la solution data DC ELO",

    support_modal_title: "Soutenir",
    support_hero_title: "Soutenez DC ELO",
    support_hero_brand: "PAR GRAIL SERIES",
    support_hero_tag: "Votre soutien nous aide à organiser de meilleurs tournois",
    support_acc_title: "INFORMATIONS DU COMPTE :",
    support_acc_aria: "Informations de soutien",
    support_method_switch_aria: "Choisissez une méthode de soutien",
    support_method_bank: "COMPTE BANCAIRE",
    support_method_paypal: "PAYPAL",
    support_qr_alt: "QR code de paiement",
    support_acc_name: "NOM DU COMPTE",
    support_acc_name_value: "GRAIL SERIES",
    support_acc_number: "NUMÉRO DE COMPTE",
    support_iban: "IBAN",
    support_bic: "BIC(SWIFT)",
    support_paypal_title: "PAYPAL :",
    support_paypal_email: "PayPal e-mail",
    support_paypal_me: "PayPal.me :",
    support_copy: "Copier",
    support_thanks: "Merci",
    support_thanks_aria: "Remerciement",
    copied: "Copié",
    copy_fail: "Impossible de copier",

    // App (player detail)
    loading: "Chargement…",
    loading_player_data: "Chargement des données du joueur…",
    player_detail: "Détail du joueur",
    opponents: "ADVERSAIRES",
    current_rating: "classement actuel",
    elo_evolution: "Évolution ELO",
    dcpr_evolution: "Évolution DCPR",
    chart_no_data: "Le graphique ne peut pas être affiché (données insuffisantes).",
    data_load_failed: "❌ Impossible de charger les données. Essayez “Recharger”.",
    player_not_found: "❌ Détails du joueur introuvables",
    avg_opp_elo: "ELO moyen des adversaires :",
    opp_none: "Aucun adversaire trouvé.",
    opp_th_opponent: "Adversaire",
    opp_th_games: "Parties",
    opp_subtitle: "Adversaires",
    opp_back: "← Retour",
    opp_section_title: "Adversaires du joueur :",
    opp_search_placeholder: "Rechercher un adversaire…",

    contact_title: "CONTACT",
    contact_desc: "Contact et informations (placeholder).",
    contact_h2: "CONTACT",
    contact_p:
      "Cette page contiendra les coordonnées, des liens et des informations de base sur le projet. Nous l’améliorerons ensemble plus tard.",

    titles_title: "TITRES",
    titles_desc: "Aperçu des titres (placeholder).",
    records_title: "RECORDS",
    records_desc: "Records et statistiques (placeholder).",
  }
};

let current = "cs";
const listeners = new Set();

export function getLang(){
  return current;
}

export function t(key){
  return (DICT[current] && DICT[current][key]) || (DICT.cs && DICT.cs[key]) || key;
}

export function onLangChange(fn){
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setLang(lang){
  if (!LANGS.includes(lang)) lang = "cs";
  current = lang;
  try{ localStorage.setItem(STORAGE_KEY, lang); }catch(e){}

  // html lang attr
  try{
    document.documentElement.setAttribute("lang", lang);
  }catch(e){}

  applyI18n(document);
  listeners.forEach((fn) => {
    try{ fn(lang); }catch(e){}
  });
}

export function initI18n(){
  let saved = null;
  try{ saved = localStorage.getItem(STORAGE_KEY); }catch(e){}
  const initial = LANGS.includes(saved) ? saved : (document.documentElement.getAttribute("lang") || "cs");
  current = LANGS.includes(initial) ? initial : "cs";
  document.documentElement.setAttribute("lang", current);
  applyI18n(document);
}

export function applyI18n(root=document){
  // text
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    el.textContent = t(key);
  });

  // placeholders
  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (!key) return;
    el.setAttribute("placeholder", t(key));
  });

  // title
  root.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    if (!key) return;
    el.setAttribute("title", t(key));
  });

  // aria-label
  root.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria");
    if (!key) return;
    el.setAttribute("aria-label", t(key));
  });
}
