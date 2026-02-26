import { openModal } from "./modal.js";
import { getLang, t } from "./i18n.js";

function isLangSeg(seg){
  return (seg === "eng" || seg === "cz" || seg === "fr");
}

function getRepoBase(){
  // Works both for:
  //  - GitHub Pages project site: /<repo>/<lang>/...
  //  - Root deploy (own domain): /<lang>/...
  const parts = window.location.pathname.split("/").filter(Boolean);
  if (!parts.length) return "/";
  return isLangSeg(parts[0]) ? "/" : `/${parts[0]}/`;
}

function assetUrl(rel){
  return getRepoBase() + String(rel || "").replace(/^\/+/, "");
}

// Centralized update definitions (template-like structure for all versions)
const UPDATES = [
  {
    version: "1.2.0",
    image: "assets/images/update/verze_1.2.0.png",
    title: {
      cs: "🚀 Aktualizace aplikace 1.2.0",
      en: "🚀 App update 1.2.0",
      fr: "🚀 Mise à jour de l’application 1.2.0"
    },
    body: {
      cs: `
        <p class="muted">Verze <b>1.2.0</b> přináší rozšíření obsahu, nové možnosti práce s hodnocením hráčů a významná technická i vizuální vylepšení. Zaměřili jsme se na lepší přehled aktualit, vícejazyčnost a přípravu aplikace na větší objem dat.</p>

        <div class="sectionTitle" style="margin-top:12px;">🆕 Nové záložky: Vedení a Články</div>
        <ul class="bullets">
          <li>👥 <b>Vedení</b> – přehled organizační struktury a odpovědných osob.</li>
          <li>📰 <b>Články</b> – prostor pro odborné i komunitní články, analýzy a zajímavosti.</li>
        </ul>

        <div class="sectionTitle" style="margin-top:12px;">🗞 Vylepšení sekce Aktuality</div>
        <ul class="bullets">
          <li>🎨 Grafická úprava záložky Aktuality (lepší čitelnost a přehled).</li>
          <li>🎞 Slider na titulní stránce pro rychlou orientaci v novinkách.</li>
        </ul>

        <div class="sectionTitle" style="margin-top:12px;">🌍 Vícejazyčnost a technické úpravy</div>
        <ul class="bullets">
          <li>🇬🇧 🇫🇷 Lokalizace do <b>ENG</b> a <b>FR</b> (celkem CZ/ENG/FR).</li>
          <li>🌗 Oprava tmavého a světlého režimu.</li>
          <li>🔗 Proklik na anonymizaci – přímý odkaz z úvodu stránky.</li>
        </ul>

        <div class="sectionTitle" style="margin-top:12px;">❤️ Možnost podpořit projekt</div>
        <ul class="bullets">
          <li>💳 Přidána možnost podpory projektu.</li>
          <li>🛠 Přepracovaná stránka Podpořit pro jednodušší proces.</li>
        </ul>

        <div class="sectionTitle" style="margin-top:12px;">📊 Nové hodnocení hráčů – DCPR</div>
        <ul class="bullets">
          <li>⚙️ Implementace DCPR na datové vrstvě.</li>
          <li>🔄 Přepínač mezi ELO a DCPR na hlavním seznamu hráčů.</li>
          <li>👤 Přepínač hodnocení i na individuální kartě hráče.</li>
        </ul>

        <div class="sectionTitle" style="margin-top:12px;">🗂 Příprava na větší objem dat</div>
        <ul class="bullets">
          <li>Úprava datové struktury pro vyšší škálovatelnost.</li>
          <li>Přizpůsobení filtrace turnajů na individuální kartě hráče.</li>
          <li>Efektivnější práce s větším objemem výsledků.</li>
        </ul>

        <div class="muted" style="margin-top:10px; line-height:1.65;">
          <b>🔮 Směřujeme dál</b><br>
          Verze 1.2.0 je důležitým krokem k robustnější a obsahově bohatší platformě. Děkujeme za vaši podporu a zpětnou vazbu! 🎯
        </div>
      `,
      en: `
        <p class="muted">Version <b>1.2.0</b> expands content, adds new ways to work with player ratings, and brings major technical and visual improvements. We focused on clearer updates, multilingual support, and preparing the app for a larger dataset.</p>

        <div class="sectionTitle" style="margin-top:12px;">🆕 New tabs: Management and Articles</div>
        <ul class="bullets">
          <li>👥 <b>Management</b> – an overview of the organizational structure and responsible people.</li>
          <li>📰 <b>Articles</b> – a new space for community and expert articles, analysis, and insights.</li>
        </ul>

        <div class="sectionTitle" style="margin-top:12px;">🗞 Improvements to the Updates section</div>
        <ul class="bullets">
          <li>🎨 Visual refresh for better readability and scanning.</li>
          <li>🎞 A homepage slider to quickly highlight the latest news.</li>
        </ul>

        <div class="sectionTitle" style="margin-top:12px;">🌍 Multilingual + technical fixes</div>
        <ul class="bullets">
          <li>🇬🇧 🇫🇷 Localization for <b>EN</b> and <b>FR</b> (CZ/EN/FR total).</li>
          <li>🌗 Dark/light mode fixes for consistent rendering.</li>
          <li>🔗 A direct anonymization link from the homepage intro.</li>
        </ul>

        <div class="sectionTitle" style="margin-top:12px;">❤️ Support the project</div>
        <ul class="bullets">
          <li>💳 Added a way to support the project.</li>
          <li>🛠 Reworked Support page for a simpler flow.</li>
        </ul>

        <div class="sectionTitle" style="margin-top:12px;">📊 New player rating – DCPR</div>
        <ul class="bullets">
          <li>⚙️ DCPR implemented at the data layer.</li>
          <li>🔄 Toggle between ELO and DCPR on the main player list.</li>
          <li>👤 Rating toggle also on the player detail page.</li>
        </ul>

        <div class="sectionTitle" style="margin-top:12px;">🗂 Prepared for more data</div>
        <ul class="bullets">
          <li>Data structure adjustments for scalability.</li>
          <li>Improved tournament filtering on player detail.</li>
          <li>More efficient handling of larger result sets.</li>
        </ul>

        <div class="muted" style="margin-top:10px; line-height:1.65;">
          <b>🔮 What’s next</b><br>
          Version 1.2.0 is an important step toward a more robust and content‑rich platform. Thanks for your support and feedback! 🎯
        </div>
      `,
      fr: `
        <p class="muted">La version <b>1.2.0</b> enrichit le contenu, ajoute de nouvelles possibilités autour du classement des joueurs et apporte des améliorations techniques et visuelles importantes. Nous avons amélioré la lisibilité des actualités, la prise en charge multilingue et la préparation à un volume de données plus élevé.</p>

        <div class="sectionTitle" style="margin-top:12px;">🆕 Nouveaux onglets : Commission et Articles</div>
        <ul class="bullets">
          <li>👥 <b>Commission</b> – aperçu de la structure organisationnelle et des personnes responsables.</li>
          <li>📰 <b>Articles</b> – un espace pour publier des articles, analyses et contenus communautaires.</li>
        </ul>

        <div class="sectionTitle" style="margin-top:12px;">🗞 Améliorations de la section Actualités</div>
        <ul class="bullets">
          <li>🎨 Refonte graphique pour une meilleure lisibilité.</li>
          <li>🎞 Slider sur la page d’accueil pour mettre en avant les nouveautés.</li>
        </ul>

        <div class="sectionTitle" style="margin-top:12px;">🌍 Multilingue et correctifs techniques</div>
        <ul class="bullets">
          <li>🇬🇧 🇫🇷 Localisation en <b>EN</b> et <b>FR</b> (CZ/EN/FR).</li>
          <li>🌗 Correctifs du mode clair/sombre.</li>
          <li>🔗 Lien direct vers l’anonymisation depuis l’accueil.</li>
        </ul>

        <div class="sectionTitle" style="margin-top:12px;">❤️ Soutenir le projet</div>
        <ul class="bullets">
          <li>💳 Ajout d’une option pour soutenir le projet.</li>
          <li>🛠 Page « Soutenir » retravaillée pour plus de clarté.</li>
        </ul>

        <div class="sectionTitle" style="margin-top:12px;">📊 Nouveau classement des joueurs – DCPR</div>
        <ul class="bullets">
          <li>⚙️ Implémentation de DCPR au niveau des données.</li>
          <li>🔄 Interrupteur ELO/DCPR dans la liste principale des joueurs.</li>
          <li>👤 Interrupteur aussi sur la fiche individuelle du joueur.</li>
        </ul>

        <div class="sectionTitle" style="margin-top:12px;">🗂 Préparation à davantage de données</div>
        <ul class="bullets">
          <li>Ajustement de la structure des données pour la scalabilité.</li>
          <li>Amélioration du filtrage des tournois sur la fiche joueur.</li>
          <li>Traitement plus efficace d’un grand volume de résultats.</li>
        </ul>

        <div class="muted" style="margin-top:10px; line-height:1.65;">
          <b>🔮 Et ensuite ?</b><br>
          La version 1.2.0 est une étape clé vers une plateforme plus robuste et plus riche. Merci pour votre soutien et vos retours ! 🎯
        </div>
      `
    }
  },
  {
    version: "1.1.0",
    image: "assets/images/update/verze_1.1.0.png",
    title: {
      cs: "🚀 Aktualizace aplikace 1.1.0",
      en: "🚀 App update 1.1.0",
      fr: "🚀 Mise à jour 1.1.0"
    },
    body: {
      cs: `
        <div class="muted" style="line-height:1.65;">Verze 1.1.0 přinesla výkonnostní třídy (A–D), metodiku hodnocení a úpravy mobilního zobrazení.</div>
        <div class="sectionTitle" style="margin-top:12px;">🏆 Ranking Class (A–D)</div>
        <div class="muted" style="margin-top:6px; line-height:1.65;">Hráči jsou rozděleni do tříd podle aktuálního Elo, pouze pokud mají rating ≥1500 a alespoň 10 zápasů. Třídy se tvoří pomocí k‑means clusteringu.</div>
        <img src="${assetUrl("assets/images/update/version_1.1.0_data.png")}" alt="Verze 1.1.0 – data" style="width:100%; height:auto; border-radius:16px; border:1px solid var(--border2); margin-top:14px;" loading="lazy" decoding="async" />
      `,
      en: `
        <div class="muted" style="line-height:1.65;">Version 1.1.0 introduced performance tiers (A–D), rating methodology, and mobile UI refinements.</div>
        <div class="sectionTitle" style="margin-top:12px;">🏆 Ranking Class (A–D)</div>
        <div class="muted" style="margin-top:6px; line-height:1.65;">Players are grouped into tiers based on their current Elo rating (only with rating ≥1500 and at least 10 games). Tiers are created using k‑means clustering.</div>
        <img src="${assetUrl("assets/images/update/version_1.1.0_data.png")}" alt="Version 1.1.0 – data" style="width:100%; height:auto; border-radius:16px; border:1px solid var(--border2); margin-top:14px;" loading="lazy" decoding="async" />
      `,
      fr: `
        <div class="muted" style="line-height:1.65;">La version 1.1.0 a introduit des classes de performance (A–D), la méthodologie de classement et des améliorations mobiles.</div>
        <div class="sectionTitle" style="margin-top:12px;">🏆 Classes de performance (A–D)</div>
        <div class="muted" style="margin-top:6px; line-height:1.65;">Les joueurs sont regroupés selon leur Elo (uniquement avec un rating ≥1500 et au moins 10 matchs). Les classes sont créées via un clustering k‑means.</div>
        <img src="${assetUrl("assets/images/update/version_1.1.0_data.png")}" alt="Version 1.1.0 – données" style="width:100%; height:auto; border-radius:16px; border:1px solid var(--border2); margin-top:14px;" loading="lazy" decoding="async" />
      `
    }
  },
  {
    version: "1.0.0",
    image: "assets/images/update/verze_1.0.0.png",
    title: {
      cs: "📱 Verze 1.0.0 – Aktualizace aplikace",
      en: "📱 Version 1.0.0 – App update",
      fr: "📱 Version 1.0.0 – Mise à jour"
    },
    body: {
      cs: `
        <div class="muted" style="line-height:1.65;">Základní verze aplikace + vylepšení mobilního zobrazení a refaktoring projektu.</div>
      `,
      en: `
        <div class="muted" style="line-height:1.65;">Initial release + mobile UI improvements and project refactoring.</div>
      `,
      fr: `
        <div class="muted" style="line-height:1.65;">Version initiale + améliorations mobiles et refactorisation du projet.</div>
      `
    }
  }
];

function getUpdateCardHtml(update, lang){
  const img = assetUrl(update.image);
  const title = (update.title && (update.title[lang] || update.title.en)) || update.version;
  const body = (update.body && (update.body[lang] || update.body.en)) || "";
  return `
    <div class="box boxPad" style="margin-bottom:14px;">
      <img
        src="${img}"
        alt="${update.version}"
        style="width:100%; height:auto; border-radius:16px; border:1px solid var(--border2); margin-bottom:12px;"
        loading="lazy"
        decoding="async"
      />
      <div class="sectionTitle">${title}</div>
      <div style="margin-top:8px;">${body}</div>
    </div>
  `;
}

// HTML content for the Updates page (shared for modal + mobile page)
export function buildNewsHtml(){
  const lang = getLang();
  const cards = UPDATES.map(u => getUpdateCardHtml(u, lang)).join("");
  return `
    <div class="newsWrap">
      ${cards}
      <div class="endSpacer"></div>
    </div>
  `;
}

export function openNewsModal(){
  const lang = getLang();
  const subtitle = (lang === "cs") ? "Verze 1.2.0" : "Version 1.2.0";
  openModal({
    title: t("news_title"),
    subtitle,
    fullscreen: false,
    html: buildNewsHtml()
  });
}
