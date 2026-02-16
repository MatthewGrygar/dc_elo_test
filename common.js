// common.js – menu ovládání + mobilní "stránky" + přepínač režimu
import { openModal, closeModal } from "./modal.js";
import { openNewsModal, buildNewsHtml } from "./aktuality.js";
import { initI18n, t, setLang, getLang, onLangChange, langToSegment } from "./i18n.js";

const htmlEl = document.documentElement;

function getRepoBase(){
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts.length ? `/${parts[0]}/` : "/";
}
function getLangSegment(){
  const parts = window.location.pathname.split("/").filter(Boolean);
  const seg = parts[1] || "";
  return (seg === "eng" || seg === "cz" || seg === "fr") ? seg : null;
}
function getBasePath(){
  const repoBase = getRepoBase();
  const seg = getLangSegment();
  return seg ? `${repoBase}${seg}/` : repoBase;
}
function assetUrl(rel){
  // rel like "assets/..."
  return getRepoBase() + rel.replace(/^\/+/, "");
}
const logoImg = document.getElementById("logoImg");

// Init i18n early
initI18n();

function isNarrowMobile(){
  return window.matchMedia && window.matchMedia("(max-width: 560px)").matches;
}

function isMobileModal(){
  // Fullscreen modal for smaller screens (homepage uses 760px).
  return window.matchMedia && window.matchMedia("(max-width: 760px)").matches;
}

// -------------------- PODPOŘIT --------------------
function openSupportModal(){
  const lang = getLang();
  const defaultMethod = (lang === "cs") ? "bank" : "paypal";

  const bodyHtml = `
    <div class="supportXWrap"><div class="supportX">
      <div class="supportXHero">
        <div class="supportXTitle">${t("support_hero_title")}</div>
        <div class="supportXBrand">${t("support_hero_brand")}</div>
        <div class="supportXTagline">${t("support_hero_tag")}</div>
      </div>

      <div class="supportXTabs" role="tablist" aria-label="${t("support_method_switch_aria")}">
        <button class="supportXTab" type="button" data-method="bank" role="tab" aria-selected="false">${t("support_method_bank")}</button>
        <button class="supportXTab" type="button" data-method="paypal" role="tab" aria-selected="false">${t("support_method_paypal")}</button>
      </div>

      <div class="supportXGrid">
        <div class="supportXCol supportXColQr">
          <div class="supportXQrCard">
            <img class="supportXQr" src="${assetUrl(assetUrl("assets/images/support/QR.png"))}" alt="${t("support_qr_alt")}" loading="lazy" />
          </div>
        </div>

        <div class="supportXCol supportXColInfo">
          <div class="supportXCard" aria-label="${t("support_acc_aria")}">
            <div class="supportXSection" data-section="bank" hidden>
              <div class="supportXCardTitle">${t("support_acc_title")}</div>

              <div class="supportXRow">
                <div class="supportXKey">${t("support_acc_name")}</div>
                <div class="supportXVal">${t("support_acc_name_value")}</div>
                <button class="supportXCopy" type="button" data-copy="${t("support_acc_name_value")}">${t("support_copy")}</button>
              </div>

              <div class="supportXRow">
                <div class="supportXKey">${t("support_acc_number")}</div>
                <div class="supportXVal supportXMono">2640017029 / 3030</div>
                <button class="supportXCopy" type="button" data-copy="2640017029 / 3030">${t("support_copy")}</button>
              </div>

              <div class="supportXRow">
                <div class="supportXKey">${t("support_iban")}</div>
                <div class="supportXVal supportXMono">CZ03 3030 0000 0026 4001 7029</div>
                <button class="supportXCopy" type="button" data-copy="CZ03 3030 0000 0026 4001 7029">${t("support_copy")}</button>
              </div>

              <div class="supportXRow">
                <div class="supportXKey">${t("support_bic")}</div>
                <div class="supportXVal supportXMono">AIRACZP</div>
                <button class="supportXCopy" type="button" data-copy="AIRACZP">${t("support_copy")}</button>
              </div>
            </div>

            <div class="supportXSection" data-section="paypal" hidden>
              <div class="supportXCardTitle">${t("support_paypal_title")}</div>

              <div class="supportXRow">
                <div class="supportXKey">${t("support_paypal_email")}</div>
                <div class="supportXVal">matthew.grygar@seznam.cz</div>
                <button class="supportXCopy" type="button" data-copy="matthew.grygar@seznam.cz">${t("support_copy")}</button>
              </div>

              <div class="supportXRow">
                <div class="supportXKey">${t("support_paypal_me")}</div>
                <div class="supportXVal">
                  <a class="supportXLink" href="https://paypal.me/GrailSeriesELO" target="_blank" rel="noopener noreferrer">https://paypal.me/GrailSeriesELO</a>
                </div>
                <button class="supportXCopy" type="button" data-copy="https://paypal.me/GrailSeriesELO">${t("support_copy")}</button>
              </div>
            </div>
          </div>

          <div class="supportXThanks" aria-label="${t("support_thanks_aria")}">${t("support_thanks")}</div>
        </div>
      </div>
    </div>
    </div>
  `;

  openModal({
    title: t("support_modal_title"),
    subtitle: "",
    html: bodyHtml,
    fullscreen: false
  });

  try{ document.getElementById("modalOverlay")?.classList.add("isSupport"); }catch(_e){}


  const overlayEl = document.getElementById("modalOverlay");
  if (!overlayEl) return;
  const rootEl = overlayEl.querySelector(".supportX");
  if (!rootEl) return;

  const qrImg = rootEl.querySelector(".supportXQr");
  const tabBtns = rootEl.querySelectorAll(".supportXTab");
  const sections = rootEl.querySelectorAll(".supportXSection");
  const copyBtns = rootEl.querySelectorAll(".supportXCopy");

  const setMethod = (method) => {
    tabBtns.forEach((b) => {
      const on = (b.getAttribute("data-method") === method);
      b.classList.toggle("isActive", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });

    sections.forEach((s) => {
      s.hidden = (s.getAttribute("data-section") !== method);
    });

    if (qrImg){
      qrImg.src = (method === "paypal")
        ? assetUrl("assets/images/support/QR2.png")
        : assetUrl("assets/images/support/QR.png");
    }
  };

  tabBtns.forEach((b) => {
    b.addEventListener("click", () => setMethod(b.getAttribute("data-method")));
  });

  // Copy buttons
  copyBtns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const val = btn.getAttribute("data-copy") || "";
      try{
        await navigator.clipboard.writeText(val);
        const prev = btn.textContent;
        btn.textContent = t("support_copied") || "ZKOPÍROVÁNO";
        btn.classList.add("isCopied");
        setTimeout(() => { btn.textContent = prev; btn.classList.remove("isCopied"); }, 1400);
      }catch(_e){
        // fallback: do nothing
      }
    });
  });

  setMethod(defaultMethod);
}

// -------------------- THEME --------------------
function syncLogo(){
  if (!logoImg) return;
  const theme = htmlEl.getAttribute("data-theme") || "dark";
  logoImg.src = (theme === "dark") ? assetUrl("assets/images/logos/logo.png") : assetUrl("assets/images/logos/logo2.png");
}

function setTheme(theme){
  htmlEl.setAttribute("data-theme", theme);
  const themeLabel = document.getElementById("themeLabel");
  if (themeLabel){
    themeLabel.textContent = (theme === "dark") ? t("theme_light") : t("theme_dark");
  }
  localStorage.setItem("theme", theme);
  syncLogo();
}

(function initTheme(){
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") setTheme(saved);
  else setTheme(htmlEl.getAttribute("data-theme") || "dark");
})();

const themeToggle = document.getElementById("themeToggle");
if (themeToggle){
  themeToggle.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const cur = htmlEl.getAttribute("data-theme") || "dark";
    setTheme(cur === "dark" ? "light" : "dark");
  });
}
// Aby app.js nedělalo dvojí bind
window.__themeHandled = true;

// If language changes, re-render theme label too.
onLangChange(() => {
  const cur = htmlEl.getAttribute("data-theme") || "dark";
  const themeLabel = document.getElementById("themeLabel");
  if (themeLabel){
    themeLabel.textContent = (cur === "dark") ? t("theme_light") : t("theme_dark");
  }
  // Also update document title if keyed
  const titleKey = document.querySelector("meta[name='dc-title-key']")?.getAttribute("content");
  if (titleKey){
    document.title = t(titleKey);
  }
});

// -------------------- MOBILNÍ "STRÁNKA" --------------------
// Na mobilu nechceme "okno" (modal), ale samostatnou celou stránku přes displej.
function ensureMobilePage(){
  let page = document.getElementById("mobilePage");
  if (page) return page;

  page = document.createElement("div");
  page.id = "mobilePage";
  page.className = "mobilePage";
  page.setAttribute("aria-hidden", "true");

  page.innerHTML = `
    <div class="mobilePageHeader">
      <button class="btnPrimary mobileBackBtn" type="button" id="mobileBackBtn">← Zpět</button>
      <div class="mobilePageTitles">
        <div class="mobilePageTitle" id="mobilePageTitle"></div>
        <div class="mobilePageSub" id="mobilePageSub"></div>
      </div>
    </div>
    <div class="mobilePageBody" id="mobilePageBody"></div>
  `;

  document.body.appendChild(page);

  const backBtn = page.querySelector("#mobileBackBtn");
  backBtn.addEventListener("click", () => {
    // pokud jsme pushnuli stav, vrátíme se backem
    if (history.state && history.state.__mobilePage){
      history.back();
    } else {
      closeMobilePage();
    }
  });

  window.addEventListener("popstate", () => {
    // když se uživatel vrátí zpět, zavřeme mobilní stránku
    if (!history.state || !history.state.__mobilePage){
      closeMobilePage(true);
    }
  });

  return page;
}

function openMobilePage({ title, subtitle, html }){
  const page = ensureMobilePage();
  // kdyby byl otevřený modal, zavřeme ho (na mobilu chceme čistou stránku)
  try{ closeModal(); }catch(e){}

  page.querySelector("#mobilePageTitle").textContent = title || "";
  page.querySelector("#mobilePageSub").textContent = subtitle || "";
  page.querySelector("#mobilePageBody").innerHTML = html || "";

  page.classList.add("isOpen");
  page.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  // "oddělená stránka" – push do historie
  if (!history.state || !history.state.__mobilePage){
    history.pushState({ __mobilePage: true }, "");
  }
}

function closeMobilePage(fromPopState=false){
  const page = document.getElementById("mobilePage");
  if (!page) return;

  page.classList.remove("isOpen");
  page.setAttribute("aria-hidden", "true");
  page.querySelector("#mobilePageBody").innerHTML = "";
  document.body.style.overflow = "";

  // když zavíráme ručně (ne přes back), zkusíme vrátit historii
  if (!fromPopState && history.state && history.state.__mobilePage){
    try{ history.back(); }catch(e){}
  }
}

function openMenuDestination({ title, subtitle, html }){
  if (isNarrowMobile()){
    openMobilePage({ title, subtitle, html });
  } else {
    // Na PC: klasické okno stejné velikosti jako karta hráče (tj. NE fullscreen)
    openModal({ title, subtitle, html, fullscreen: false });
  }
}

// -------------------- MENU --------------------
const supportBtn = document.getElementById("supportBtn");
const menuBtn = document.getElementById("menuBtn");
const menuPanel = document.getElementById("menuPanel");

// -------------------- LANGUAGE --------------------
const langBtn = document.getElementById("langBtn");
const langPanel = document.getElementById("langPanel");

function flagFor(lang){
  const src = (lang === "en") ? assetUrl("assets/images/flags/eng.png") : (lang === "fr") ? assetUrl("assets/images/flags/fr.png") : assetUrl("assets/images/flags/cz.png");
  const alt = (lang === "en") ? "GB" : (lang === "fr") ? "FR" : "CZ";
  return `<img class="langFlagImg" src="${src}" alt="${alt}" loading="lazy" decoding="async">`;
}

function codeFor(lang){
  if (lang === "en") return "GB";
  if (lang === "fr") return "FR";
  return "CZ";
}

function labelFor(lang){
  if (lang === "en") return "English";
  if (lang === "fr") return "Français";
  return "Čeština";
}

function openLang(){
  if (!langPanel) return;
  langPanel.classList.add("isOpen");
  langPanel.setAttribute("aria-hidden", "false");
}

function closeLang(){
  if (!langPanel) return;
  langPanel.classList.remove("isOpen");
  langPanel.setAttribute("aria-hidden", "true");
}

function toggleLang(){
  if (!langPanel) return;
  langPanel.classList.contains("isOpen") ? closeLang() : openLang();
}

function renderLangUi(){
  if (!langBtn || !langPanel) return;

  const cur = getLang();
  langBtn.innerHTML = `<span class="langCurrent"><span class="langCircle" aria-hidden="true">${flagFor(cur)}</span><span class="langCode">${codeFor(cur)}</span></span>`;
langBtn.setAttribute("aria-label", "Language");
  langBtn.setAttribute("title", "Language");

  // show other two languages (requested: CZ shows EN+FR)
  const options = ["cs", "en", "fr"].filter((l) => l !== cur);
  langPanel.innerHTML = options
    .map((l) =>
      `<button class="langItem" type="button" data-lang="${l}"><span class="langCircle" aria-hidden="true">${flagFor(l)}</span><span class="langName">${labelFor(l)}</span></button>`
    )
    .join("");

  langPanel.querySelectorAll(".langItem").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const l = btn.getAttribute("data-lang") || "cs";
      closeLang();
      setLang(l);
      renderLangUi();

      // Switch URL namespace as well: /<repo>/<lang>/
      try{
        const repoBase = getRepoBase();
        const currentSeg = getLangSegment();
        const targetSeg = langToSegment(l);

        // Keep current route (player/article slug) but swap language prefix.
        let rest = window.location.pathname.slice(repoBase.length);
        if (currentSeg){
          rest = rest.slice(currentSeg.length);
        }
        rest = rest.replace(/^\/+/, ""); // slug...
        const target = `${repoBase}${targetSeg}/` + (rest ? rest : "");
        window.location.assign(target + window.location.search + window.location.hash);
        return;
      }catch(e){}
    });
  });
}

if (langBtn && langPanel){
  renderLangUi();

  langBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    // keep menu and lang dropdown mutually exclusive
    try{ closeMenu(); }catch(_e){}
    toggleLang();
  });

  document.addEventListener("click", (e) => {
    if (!langPanel.classList.contains("isOpen")) return;
    if (langPanel.contains(e.target) || langBtn.contains(e.target)) return;
    closeLang();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLang();
  });

  onLangChange(() => {
    renderLangUi();
  });
}

const uploadBtn = document.getElementById("menuUpload");
const newsBtn = document.getElementById("menuNews");
const managementBtn = document.getElementById("menuManagement");
const articlesBtn = document.getElementById("menuArticles");
const titlesBtn = document.getElementById("menuTitles");
const contactBtn = document.getElementById("menuContact");
const recordsBtn = document.getElementById("menuRecords");

if (supportBtn){
  supportBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeMenu();
    openSupportModal();
  });
}

function openMenu(){
  if (!menuPanel) return;
  menuPanel.classList.add("isOpen");
  menuPanel.setAttribute("aria-hidden", "false");
}
function closeMenu(){
  if (!menuPanel) return;
  menuPanel.classList.remove("isOpen");
  menuPanel.setAttribute("aria-hidden", "true");
}
function toggleMenu(){
  if (!menuPanel) return;
  menuPanel.classList.contains("isOpen") ? closeMenu() : openMenu();
}

if (menuBtn && menuPanel){
  menuBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    try{ closeLang(); }catch(_e){}
    toggleMenu();
  });

  document.addEventListener("click", (e) => {
    if (!menuPanel.classList.contains("isOpen")) return;
    if (menuPanel.contains(e.target) || menuBtn.contains(e.target)) return;
    closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}

// NAHRÁNÍ DAT
if (uploadBtn){
  uploadBtn.addEventListener("click", () => {
    closeMenu();
    openMenuDestination({
      title: t("upload_title"),
      subtitle: t("upload_sub"),
      html: `
        <div class="pageModal">
          <h2>${t("menu_upload")}</h2>
          <p class="muted">${t("upload_desc")}</p>
          <a class="btnPrimary" href="https://forms.gle/Y7aHApF5NLFLw6MP9" target="_blank" rel="noopener">${t("upload_open")}</a>
        </div>
      `
    });
  });
}

// AKTUALITY
if (newsBtn){
  newsBtn.addEventListener("click", () => {
    closeMenu();
    if (isNarrowMobile()){
      openMobilePage({
        title: t("news_title"),
        subtitle: "Verze 1.0.0",
        html: buildNewsHtml()
      });
    } else {
      openNewsModal();
    }
  });
}

// VEDENÍ
if (managementBtn){
  managementBtn.addEventListener("click", () => {
    closeMenu();
    openMenuDestination({
      title: t("management_title"),
      subtitle: t("management_sub"),
      html: `
        <div class="pageModal managementWrap">
          <div class="managementGrid">
            <section class="managementCard">
              <h3 class="managementName">Matthew Grygar</h3>
              <img class="managementPhoto" src="${assetUrl("assets/images/management/matthew_grygar.png")}" alt="Matthew Grygar" loading="lazy" />
              <div class="managementRole">
                <div>Předseda a zakladatel DCPR komise</div>
                <div>Spoluzakladatel Grail Series</div>
                <div>Spoluzakladatel ELO projektu</div>
              </div>
            </section>

            <section class="managementCard">
              <h3 class="managementName">Ervin Kuč</h3>
              <img class="managementPhoto" src="${assetUrl("assets/images/management/ervin_kuc.png")}" alt="Ervin Kuč" loading="lazy" />
              <div class="managementRole">
                <div>Člen DCPR komise</div>
                <div>Spoluzakladatel Grail Series</div>
                <div>Spoluzakladatel ELO projektu</div>
                <div>Architekt datového řešení DC ELO</div>
              </div>
            </section>
          </div>
        </div>
      `
    });
  });
}


// ČLÁNKY
const ARTICLES = [
  {
    slug: "article1",
    banner: "assets/images/articles/articles1.png",
    title: {
      cs: "Jak počítáme Elo a výkonostní třídy v Duel Commanders komunitě",
      en: "How we calculate Elo and performance tiers in the Duel Commanders community",
      fr: "Comment nous calculons l’Elo et les catégories de performance dans la communauté Duel Commanders"
    },
    teaser: {
      cs: "Krátké vysvětlení, co znamená Elo v DC komunitě, jak se počítá a proč jsme zvolili výkonostní třídy.",
      en: "A short overview of what Elo means in DC, how we calculate it, and why we use performance tiers.",
      fr: "Un aperçu de ce que signifie l’Elo en DC, comment nous le calculons et pourquoi nous utilisons des catégories de performance."
    },
    content: {
      cs: `
        <p><strong>Elo</strong> je bodové hodnocení, které odhaduje aktuální sílu hráče na základě výsledků zápasů.</p>
        <p>V DC ELO projektu používáme turnajová data a každému zápasu přiřazujeme změnu podle očekávaného výsledku (silnější hráč získá méně bodů, slabší více).</p>
        <h3>Výkonostní třídy</h3>
        <p>Aby šlo žebříček lépe číst, rozdělujeme hráče do výkonostních tříd. Třídy se odvíjejí od rozsahu Elo a průběžně je ladíme podle velikosti komunity.</p>
        <p class="muted">Pozn.: Tento článek je zatím „v1“ – text můžeme kdykoli rozšířit, jakmile doplníte finální znění.</p>
      `,
      en: `
        <p><strong>Elo</strong> is a rating system that estimates a player’s current strength based on match results.</p>
        <p>In DC ELO we use tournament data and adjust ratings using expected outcome (a stronger player gains fewer points; an underdog gains more).</p>
        <h3>Performance tiers</h3>
        <p>To make the ladder easier to read, we group players into performance tiers based on rating ranges. We fine-tune the ranges as the community grows.</p>
        <p class="muted">Note: This is a v1 draft — we can replace it with your final wording anytime.</p>
      `,
      fr: `
        <p><strong>Elo</strong> est un système de classement qui estime la force actuelle d’un joueur à partir des résultats.</p>
        <p>Dans DC ELO, nous utilisons les données de tournois et ajustons le classement selon le résultat attendu (un joueur plus fort gagne moins de points ; l’outsider en gagne plus).</p>
        <h3>Catégories de performance</h3>
        <p>Pour rendre le classement plus lisible, nous regroupons les joueurs en catégories selon des plages d’Elo. Les plages peuvent évoluer avec la communauté.</p>
        <p class="muted">Remarque : version v1 — nous pouvons remplacer ce texte par votre version finale à tout moment.</p>
      `
    }
  }
];

function getArticleBySlug(slug){
  return ARTICLES.find(a => a.slug === slug) || null;
}

function openArticleList(){
  const lang = getLang();
  const listHtml = ARTICLES.map(a => `
    <article class="articleCardFull">
      <img class="articleBanner" src="${assetUrl(a.banner)}" alt="${a.title[lang] || a.title.en}" loading="lazy" />
      <div class="articleInner">
        <h3 class="articleH">${a.title[lang] || a.title.en}</h3>
        <p class="muted articleP">${a.teaser[lang] || a.teaser.en}</p>
        <button class="btnPrimary articleReadBtn" type="button" data-article="${a.slug}">${t("articles_read")}</button>
      </div>
    </article>
  `).join("");

  openMenuDestination({
    title: t("articles_title"),
    subtitle: t("articles_sub"),
    html: `<div class="pageModal articlesWrap">${listHtml}</div>`
  });

  // wire buttons
  setTimeout(() => {
    document.querySelectorAll(".articleReadBtn").forEach(btn => {
      btn.addEventListener("click", () => {
        const slug = btn.getAttribute("data-article");
        if (slug) openArticle(slug, true);
      });
    });
  }, 0);
}

function openArticle(slug, push){
  const article = getArticleBySlug(slug);
  if (!article) return;

  const lang = getLang();
  const title = article.title[lang] || article.title.en;

  if (push){
    const url = getBasePath() + slug;
    history.pushState({ __articleSlug: slug }, "", url);
  }

  openMenuDestination({
    title,
    subtitle: t("articles_sub"),
    html: `
      <div class="pageModal articleDetail">
        <img class="articleBanner" src="${assetUrl(article.banner)}" alt="${title}" loading="lazy" />
        <div class="articleInner">
          ${article.content[lang] || article.content.en}
        </div>
      </div>
    `
  });
}

if (articlesBtn){
  articlesBtn.addEventListener("click", () => {
    closeMenu();
    openArticleList();
  });
}

// Restore article deep link
function tryOpenArticleFromUrl(){
  const base = getBasePath();
  const rel = window.location.pathname.startsWith(base) ? window.location.pathname.slice(base.length) : "";
  const slug = rel.replace(/^\/+/, "").split("/")[0];
  const article = getArticleBySlug(slug);
  if (article){
    openArticle(article.slug, false);
    return true;
  }
  return false;
}

// Also handle back/forward navigation for article routes
window.addEventListener("popstate", () => {
  try{
    if (history.state && history.state.__articleSlug){
      openArticle(history.state.__articleSlug, false);
      return;
    }
    // If URL points to an article (e.g. user refreshed and navigated back), open it.
    if (tryOpenArticleFromUrl()) return;
  }catch(e){}
});


// TITULY
if (titlesBtn){
  titlesBtn.addEventListener("click", () => {
    closeMenu();
    openMenuDestination({
      title: t("titles_title"),
      subtitle: t("titles_desc"),
      html: `
        <div class="pageModal">
          <h2>${t("menu_titles")}</h2>
          <p class="muted">${t("titles_desc")}</p>
        </div>
      `
    });
  });
}

// KONTAKT
if (contactBtn){
  contactBtn.addEventListener("click", () => {
    closeMenu();
    openMenuDestination({
      title: t("contact_title"),
      subtitle: t("contact_desc"),
      html: `
        <div class="pageModal">
          <h2>${t("menu_contact")}</h2>
          <p class="muted">${t("contact_desc")}</p>
        </div>
      `
    });
  });
}

// REKORDY
if (recordsBtn){
  recordsBtn.addEventListener("click", () => {
    closeMenu();
    openMenuDestination({
      title: t("records_title"),
      subtitle: t("records_desc"),
      html: `
        <div class="pageModal">
          <h2>${t("menu_records")}</h2>
          <p class="muted">${t("records_desc")}</p>
        </div>
      `
    });
  });
}
