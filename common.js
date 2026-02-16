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
    const lang = getLang();

    const intro = {
      cs: `DCPR komise vznikla jako organizační a metodický orgán projektu DC ELO pro formát Duel Commander (MtG). Jejím cílem je dlouhodobě budovat stabilní, transparentní a férové kompetitivní prostředí pro hráče v České republice i v širším regionu.`,
      en: `The DCPR Commission was established as the organizational and methodological body of the DC ELO project for the Duel Commander (MtG) format. Its goal is to build a stable, transparent, and fair competitive environment for players in the Czech Republic and the wider region in the long term.`,
      fr: `La Commission DCPR a été créée comme organe organisationnel et méthodologique du projet DC ELO pour le format Duel Commander (MtG). Son objectif est de construire durablement un environnement compétitif stable, transparent et équitable pour les joueurs en République tchèque et dans la région.`
    };

    const activitiesTitle = { cs: "Hlavní činnosti komise:", en: "Main activities of the commission:", fr: "Activités principales de la commission :" };

    const activities = {
      cs: [
        { h: "Správa projektu DC ELO", p: "Komise zastřešuje celý ELO systém, který sleduje dlouhodobou (lifetime) výkonnost hráčů napříč zapojenými turnaji. Dbáme na správnost výpočtů, transparentnost dat a jejich pravidelnou aktualizaci." },
        { h: "DCPR žebříček", p: "Vedle lifetime ELO spravujeme také DCPR hodnocení, které je založeno pouze na výsledcích z vybraných velkých turnajů. Tento žebříček slouží jako ukazatel aktuální výkonnosti hráčů na nejvyšší kompetitivní úrovni." },
        { h: "Komunikace s organizátory lig a turnajů", p: "Aktivně spolupracujeme s pořadateli Duel Commander akcí. Pomáháme se začleněním turnajů do ELO systému, nastavujeme metodiku reportování výsledků a zajišťujeme jednotné standardy." },
        { h: "Sběr a správa hráčských dat", p: "Zajišťujeme evidenci výsledků, správu databáze hráčů a kontrolu správnosti nahlášených dat. Transparentnost a důvěryhodnost systému je pro nás klíčová." },
        { h: "Monitoring kompetitivního prostředí", p: "Sledujeme vývoj metagame, účast na turnajích i celkový stav komunity. Naším cílem je podporovat zdravé a vyvážené soutěžní prostředí." },
        { h: "Budoucí rozvoj a speciální akce", p: "Do budoucna plánujeme organizaci akcí pro hráče s určitým ELO ratingem, výkonnostní turnaje a další formáty, které podpoří růst komunity i motivaci hráčů." },
        { h: "Mezinárodní spolupráce", p: "Komunikujeme se zahraničními organizátory a komunitami Duel Commanderu s cílem sdílet zkušenosti, sjednocovat standardy a do budoucna propojovat hráčské základny napříč regiony." }
      ],
      en: [
        { h: "DC ELO project administration", p: "The commission oversees the entire ELO system that tracks players’ long‑term (lifetime) performance across included tournaments. We focus on calculation correctness, data transparency, and regular updates." },
        { h: "DCPR ranking", p: "Alongside lifetime ELO, we also maintain the DCPR ranking, based only on results from selected major tournaments. It serves as an indicator of current performance at the highest competitive level." },
        { h: "Communication with league and tournament organizers", p: "We actively cooperate with Duel Commander event organizers. We help integrate tournaments into the ELO system, set reporting methodology, and ensure consistent standards." },
        { h: "Player data collection and management", p: "We record results, manage the player database, and verify reported data. Transparency and trustworthiness are key priorities." },
        { h: "Monitoring the competitive environment", p: "We track metagame evolution, tournament participation, and the overall state of the community. Our goal is to support a healthy and balanced competitive scene." },
        { h: "Future development and special events", p: "We plan events for players above certain ELO thresholds, performance‑based tournaments, and other formats that support community growth and motivation." },
        { h: "International cooperation", p: "We communicate with foreign organizers and Duel Commander communities to share experience, align standards, and gradually connect player bases across regions." }
      ],
      fr: [
        { h: "Gestion du projet DC ELO", p: "La commission supervise l’ensemble du système ELO, qui suit la performance à long terme (lifetime) des joueurs sur les tournois intégrés. Nous veillons à l’exactitude des calculs, à la transparence des données et à leur mise à jour régulière." },
        { h: "Classement DCPR", p: "En plus du lifetime ELO, nous gérons le classement DCPR, basé uniquement sur les résultats de certains grands tournois. Il sert d’indicateur de la performance actuelle au plus haut niveau compétitif." },
        { h: "Communication avec les organisateurs de ligues et de tournois", p: "Nous collaborons activement avec les organisateurs d’événements Duel Commander. Nous aidons à intégrer les tournois au système ELO, définissons la méthodologie de reporting et garantissons des standards cohérents." },
        { h: "Collecte et gestion des données joueurs", p: "Nous assurons l’enregistrement des résultats, la gestion de la base de joueurs et la vérification des données rapportées. La transparence et la fiabilité du système sont essentielles." },
        { h: "Suivi de l’environnement compétitif", p: "Nous suivons l’évolution de la metagame, la participation aux tournois et l’état général de la communauté. Notre objectif est de soutenir une scène compétitive saine et équilibrée." },
        { h: "Développement futur et événements spéciaux", p: "Nous prévoyons des événements pour les joueurs au‑dessus de certains seuils d’ELO, des tournois axés performance et d’autres formats pour soutenir la croissance et la motivation de la communauté." },
        { h: "Coopération internationale", p: "Nous échangeons avec des organisateurs et communautés Duel Commander à l’étranger afin de partager l’expérience, harmoniser les standards et connecter progressivement les bases de joueurs entre régions." }
      ]
    };

    const coopTitle = { cs: "Spolupráce", en: "Cooperation", fr: "Collaboration" };
    const coopBody = {
      cs: `Máte zájem s námi spolupracovat, zapojit svůj turnaj do systému DC ELO, nebo se stát členem naší organizace?\n\nNeváhejte nás kontaktovat na e-mailu:\n<strong>prague-dc-series@seznam.cz</strong>\n\nRádi s vámi probereme možnosti spolupráce a dalšího rozvoje Duel Commander scény.`,
      en: `Interested in working with us, adding your tournament to the DC ELO system, or becoming part of our organization?\n\nContact us at:\n<strong>prague-dc-series@seznam.cz</strong>\n\nWe’ll be happy to discuss cooperation opportunities and further development of the Duel Commander scene.`,
      fr: `Vous souhaitez collaborer avec nous, intégrer votre tournoi au système DC ELO, ou devenir membre de notre organisation ?\n\nContactez‑nous à :\n<strong>prague-dc-series@seznam.cz</strong>\n\nNous serons ravis d’échanger sur les possibilités de collaboration et le développement futur de la scène Duel Commander.`
    };

    const activityListHtml = (activities[lang] || activities.en).map(a => `
      <div class="managementAct">
        <div class="managementActH">${a.h}</div>
        <div class="managementActP">${a.p}</div>
      </div>
    `).join("");

    openMenuDestination({
      title: t("management_title"),
      subtitle: t("management_sub"),
      html: `
        <div class="pageModal managementWrap">
          <div class="managementIntro">
            <p class="muted">${intro[lang] || intro.en}</p>
          </div>

          <div class="managementGrid">
            <section class="managementCard">
              <h3 class="managementName">Matthew Grygar</h3>
              <img class="managementPhoto" src="${assetUrl("assets/images/management/matthew_grygar.png")}" alt="Matthew Grygar" loading="lazy" />
              <div class="managementRole">
                <div>${lang === "cs" ? "Předseda a zakladatel DCPR komise" : (lang === "fr" ? "Président et fondateur de la Commission DCPR" : "Chair and founder of the DCPR Commission")}</div>
                <div>${lang === "cs" ? "Spoluzakladatel Grail Series" : (lang === "fr" ? "Co‑fondateur de Grail Series" : "Co‑founder of Grail Series")}</div>
                <div>${lang === "cs" ? "Spoluzakladatel ELO projektu" : (lang === "fr" ? "Co‑fondateur du projet ELO" : "Co‑founder of the ELO project")}</div>
              </div>
              <div class="managementContact">
                <span class="muted">${lang === "cs" ? "Kontakt" : (lang === "fr" ? "Contact" : "Contact")}: </span>
                <a class="link" href="mailto:prague-dc-series@seznam.cz">prague-dc-series@seznam.cz</a>
              </div>
            </section>

            <section class="managementCard">
              <h3 class="managementName">Ervin Kuč</h3>
              <img class="managementPhoto" src="${assetUrl("assets/images/management/ervin_kuc.png")}" alt="Ervin Kuč" loading="lazy" />
              <div class="managementRole">
                <div>${lang === "cs" ? "Člen DCPR komise" : (lang === "fr" ? "Membre de la Commission DCPR" : "Member of the DCPR Commission")}</div>
                <div>${lang === "cs" ? "Spoluzakladatel Grail Series" : (lang === "fr" ? "Co‑fondateur de Grail Series" : "Co‑founder of Grail Series")}</div>
                <div>${lang === "cs" ? "Spoluzakladatel ELO projektu" : (lang === "fr" ? "Co‑fondateur du projet ELO" : "Co‑founder of the ELO project")}</div>
                <div>${lang === "cs" ? "Architekt datového řešení DC ELO" : (lang === "fr" ? "Architecte de la solution de données DC ELO" : "Architect of the DC ELO data solution")}</div>
              </div>
            </section>
          </div>

          <div class="managementActs">
            <h3 class="managementActsTitle">${activitiesTitle[lang] || activitiesTitle.en}</h3>
            ${activityListHtml}
          </div>

          <div class="managementCoop">
            <h3 class="managementCoopTitle">${coopTitle[lang] || coopTitle.en}</h3>
            <p class="muted">${(coopBody[lang] || coopBody.en).replace(/\n\n/g, "</p><p class=\"muted\">").replace(/\n/g, "<br>")}</p>
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
      cs: "Jak počítáme Elo a výkonnostní třídy v Duel Commander komunitě",
      en: "How we calculate Elo and performance tiers in the Duel Commander community",
      fr: "Comment nous calculons l’Elo et les classes de performance dans la communauté Duel Commander"
    },
    teaser: {
      cs: "Přesné nastavení našeho Elo, interpretace rozdílů a proč nad ratingem používáme třídy A–D (k‑means).",
      en: "Exact Elo settings, how to interpret rating gaps, and why we add A–D tiers via k‑means clustering.",
      fr: "Réglages exacts de l’Elo, interprétation des écarts et pourquoi nous ajoutons des classes A–D via un clustering k‑means."
    },
    content: {
      cs: `
        <p class="articleLead"><strong>V Duel Commander komunitě</strong> používáme systém hodnocení, jehož cílem je dlouhodobě, transparentně a konzistentně odhadovat výkonnost hráčů na základě skutečně odehraných matchů. Základem je <strong>modifikovaný model Elo</strong>, doplněný o datově řízenou segmentaci hráčů do čtyř tříd (<strong>Class A–D</strong>).</p>
        <p>Metodicky vycházíme z kalibrace používané v <strong>MTG Elo Project</strong>, která je navržena pro prostředí karetních her s vyšší variancí výsledků. Cílem není vytvořit agresivní žebříček s extrémními rozdíly, ale stabilní a realistický odhad relativní síly hráčů.</p>

        <h3>Elo jako průběžný odhad výkonnosti</h3>
        <p>Každý hráč vstupuje do systému s počátečním ratingem <strong>1500</strong> bodů. Rating se následně upravuje po každém odehraném matchi podle klasického Elo principu: změna je úměrná rozdílu mezi očekávaným a skutečným výsledkem.</p>
        <p>Použitý vývojový parametr je <strong>K = 36</strong>. Tento relativně vyšší faktor odráží skutečnost, že v komunitním prostředí je počet her na hráče omezený a variabilita výsledků vyšší než například v šachu.</p>

        <div class="articleCallout">
          <div class="articleCalloutH">Očekávané skóre</div>
          <div class="articleMath">E = 1 / (1 + 10^((R<sub>b</sub> − R<sub>a</sub>) / 1135))</div>
          <div class="muted">Klíčovým parametrem je konstanta <strong>1135</strong>, která určuje „plošnost“ křivky očekávání.</div>
        </div>

        <p>V praxi znamená, že rozdíl <strong>200</strong> ratingových bodů odpovídá přibližně <strong>60%</strong> očekávané úspěšnosti silnějšího hráče. Oproti klasické šachové škále (400) je tedy model výrazně méně strmý. Tato volba reflektuje vyšší míru variance v karetních hrách (náhoda, matchupy, prostředí) a záměrně „brzdí“ význam ratingových rozdílů.</p>

        <div class="articleCallout">
          <div class="articleCalloutH">Aktualizace ratingu</div>
          <div class="articleMath">R′ = R + K (S − E)</div>
          <div class="muted">S je skutečný výsledek: 1 (výhra), 0 (prohra), 0.5 (remíza).</div>
        </div>

        <p>Interně jsou ratingy vedeny s desetinnou přesností, aby nedocházelo k systematickým zaokrouhlovacím chybám. Navenek zobrazujeme hodnoty zaokrouhlené na celé body.</p>

        <h3>Co se do modelu započítává — a co ne</h3>
        <p>Model pracuje výhradně s výsledkem matchu. Skóre <strong>2–0</strong> a <strong>2–1</strong> má z hlediska ratingu stejný dopad. Hodnotíme pouze <strong>win/loss/draw</strong>, nikoli margin vítězství. Tento přístup odpovídá původní filozofii Elo a zabraňuje nežádoucím efektům spojeným s „optimalizací rozdílu skóre“.</p>
        <ul class="articleList">
          <li><strong>BYE</strong> nemá na rating žádný vliv.</li>
          <li>Nevalidní nebo neúplné záznamy se nezapočítávají.</li>
          <li>Rating reflektuje pouze skutečně odehrané head‑to‑head zápasy mezi dvěma hráči.</li>
        </ul>

        <h3>Praktická interpretace ratingových rozdílů</h3>
        <p class="muted">Orientačně (díky konstantě 1135):</p>
        <ul class="articleList">
          <li>rozdíl 0 bodů → 50 % očekávání</li>
          <li>rozdíl ~100 bodů → 55 %</li>
          <li>rozdíl 200 bodů → 60 %</li>
          <li>rozdíl 300 bodů → ~65 %</li>
          <li>rozdíl 400 bodů → ~69 %</li>
        </ul>
        <p>Zásadní je pochopení, že i rozdíl 200 bodů nepředstavuje dominanci, ale pouze mírnou až střední výhodu. To odpovídá charakteru karetní hry a je to vědomý designový cíl převzatý z MTG Elo Project.</p>

        <h3>Od spojitého ratingu k třídám A–D</h3>
        <p>Samotné Elo poskytuje spojitou metriku výkonnosti. Pro potřeby komunity je však užitečné doplnit ji o přehlednou segmentaci. Proto nad ratingem aplikujeme shlukovou analýzu pomocí algoritmu <strong>k‑means</strong>.</p>
        <p>Clustering se aplikuje pouze na hráče, kteří splňují dvě podmínky:</p>
        <ul class="articleList">
          <li>mají rating alespoň <strong>1500</strong>,</li>
          <li>odehráli minimálně <strong>10</strong> her.</li>
        </ul>
        <p>Používáme parametr <strong>k = 4</strong> (čtyři clustery), které mapujeme na Class A (nejvyšší) až Class D (nejnižší v rámci filtrovaného souboru). Algoritmus minimalizuje součet čtverců vzdáleností hráčů od centroidů (inertia), takže třídy vznikají z přirozené struktury dat, nikoli podle předem daných hranic.</p>
        <p class="muted">Pozn.: k‑means může konvergovat do lokálního minima a výsledek závisí na inicializaci centroidů. Proto je vhodné použít více startů (např. n_init) a vybrat řešení s nejnižší hodnotou inertia.</p>

        <h3>Empirická struktura tříd</h3>
        <p>Při vizualizaci ratingů jsou obvykle patrná čtyři relativně zřetelná výšková pásma: Class A (typicky jen několik hráčů kolem ~1680), pod nimi kompaktní horní střed Class B (~1600–1640), střední pás Class C (~1540–1580) a nejnižší pás po filtru ≥1500 odpovídá třídě Class D (blízko ~1500–1520).</p>
        <p>Důležité je, že hranice mezi třídami nejsou pevně definované konkrétním číslem. Vznikají emergentně z aktuálního rozložení ratingů v komunitě.</p>

        <h3>Provozní režim systému</h3>
        <p>Hodnocení i klasifikace jsou plně automatizované. Po každé aktualizaci nebo opravě dat:</p>
        <ul class="articleList">
          <li>se přepočítají všechny ratingy,</li>
          <li>následně se znovu provede clustering na kvalifikovaných hráčích.</li>
        </ul>
        <p>Systém je tedy dynamický a reaguje na vývoj komunity v reálném čase.</p>

        <h3>Závěrečné shrnutí</h3>
        <p>Použitý model kombinuje modifikované Elo s plošší škálou očekávání a datově řízený k‑means clustering. Výsledkem je:</p>
        <ul class="articleList">
          <li>konzistentní odhad výkonnosti založený výhradně na odehraných zápasech,</li>
          <li>realistická interpretace ratingových rozdílů v prostředí karetní hry,</li>
          <li>přehledná segmentace hráčské základny bez arbitrárních hranic.</li>
        </ul>
        <p class="muted">Jedná se o první systematickou verzi hodnocení, která je připravena k dalším metodologickým úpravám podle vývoje dat i potřeb komunity.</p>
      `,
      en: `
        <p class="articleLead"><strong>In the Duel Commander community</strong>, we use a rating system whose goal is to estimate player performance over the long term in a transparent and consistent way, based on matches that were actually played. The foundation is a <strong>modified Elo model</strong>, complemented by a data‑driven segmentation of players into four tiers (<strong>Class A–D</strong>).</p>
        <p>Methodologically, we follow the calibration used in the <strong>MTG Elo Project</strong>, designed for card games with higher result variance. The goal is not an aggressive ladder with extreme gaps, but a stable and realistic estimate of relative strength.</p>

        <h3>Elo as a running performance estimate</h3>
        <p>Every player enters the system with an initial rating of <strong>1500</strong>. After each match, the rating is updated using the classic Elo principle: the change is proportional to the gap between the expected and the actual result.</p>
        <p>We use an update factor of <strong>K = 36</strong>. This relatively higher value reflects the reality of community play: fewer games per player and higher variance than in deterministic games like chess.</p>

        <div class="articleCallout">
          <div class="articleCalloutH">Expected score</div>
          <div class="articleMath">E = 1 / (1 + 10^((R<sub>b</sub> − R<sub>a</sub>) / 1135))</div>
          <div class="muted">The key parameter is the <strong>1135</strong> constant, which controls how “flat” the expectation curve is.</div>
        </div>

        <p>In practice, a <strong>200</strong> point rating difference corresponds to roughly a <strong>60%</strong> expected win rate for the stronger player. Compared to the traditional chess scale (400), this model is much less steep — intentionally. Duel Commander (like many card formats) has higher variance (luck, matchups, environment), so we deliberately reduce the impact of rating gaps to better match reality.</p>

        <div class="articleCallout">
          <div class="articleCalloutH">Rating update</div>
          <div class="articleMath">R′ = R + K (S − E)</div>
          <div class="muted">S is the actual outcome: 1 (win), 0 (loss), 0.5 (draw).</div>
        </div>

        <p>Internally, ratings are stored with decimal precision to avoid systematic rounding error. Externally, we display values rounded to whole points.</p>

        <h3>What is counted — and what is not</h3>
        <p>The model uses only the match outcome. A <strong>2–0</strong> and <strong>2–1</strong> result have the same impact. We rate only <strong>win/loss/draw</strong>, not the margin of victory — aligned with original Elo philosophy and avoiding incentives to “optimize score margin”.</p>
        <ul class="articleList">
          <li><strong>BYE</strong> has no rating impact.</li>
          <li>Invalid or incomplete records are not included.</li>
          <li>The rating reflects only head‑to‑head matches between two players.</li>
        </ul>

        <h3>How to interpret rating differences</h3>
        <p class="muted">Rule of thumb (given the 1135 constant):</p>
        <ul class="articleList">
          <li>0 points → 50% expected</li>
          <li>~100 points → 55%</li>
          <li>200 points → 60%</li>
          <li>300 points → ~65%</li>
          <li>400 points → ~69%</li>
        </ul>
        <p>The important takeaway is that even a 200‑point gap is not dominance — just a mild to moderate advantage. This is a deliberate design goal borrowed from the MTG Elo Project.</p>

        <h3>From continuous rating to tiers A–D</h3>
        <p>Elo provides a continuous performance metric. For community use, it’s helpful to add an easy‑to‑read segmentation, so we apply <strong>k‑means</strong> clustering on top of the rating.</p>
        <p>Clustering is applied only to players who meet both conditions:</p>
        <ul class="articleList">
          <li>rating at least <strong>1500</strong>,</li>
          <li>at least <strong>10</strong> games played.</li>
        </ul>
        <p>We use <strong>k = 4</strong> clusters, mapped to Class A (highest) through Class D (lowest within the filtered set). The algorithm minimizes the sum of squared distances to cluster centroids (inertia), meaning tiers emerge from the data rather than fixed numeric cutoffs.</p>
        <p class="muted">Note: k‑means can converge to a local minimum and depends on centroid initialization. We therefore recommend multiple starts (e.g., n_init) and choosing the solution with the lowest inertia.</p>

        <h3>Empirical tier structure</h3>
        <p>When visualizing ratings, four relatively distinct bands are often visible: Class A (typically a few players around ~1680), then a compact upper‑middle Class B (~1600–1640), a mid band Class C (~1540–1580), and the lowest band after the ≥1500 filter corresponds to Class D (near ~1500–1520).</p>
        <p>Importantly, tier boundaries are not fixed numbers — they emerge from the current rating distribution in the community.</p>

        <h3>Operational mode</h3>
        <p>The rating and classification are fully automated. After any data update or correction:</p>
        <ul class="articleList">
          <li>all ratings are recalculated,</li>
          <li>then clustering is re‑run on qualified players.</li>
        </ul>
        <p>The system is dynamic and responds to community evolution in real time.</p>

        <h3>Summary</h3>
        <p>The model combines a modified Elo with a flatter expectation curve and data‑driven k‑means clustering. The result is:</p>
        <ul class="articleList">
          <li>a consistent performance estimate based only on played matches,</li>
          <li>a realistic interpretation of rating differences for a card game environment,</li>
          <li>a clear segmentation without arbitrary thresholds.</li>
        </ul>
        <p class="muted">This is the first systematic version of the rating, ready for further methodological refinements as data and community needs evolve.</p>
      `,
      fr: `
        <p class="articleLead"><strong>Dans la communauté Duel Commander</strong>, nous utilisons un système de classement dont l’objectif est d’estimer la performance des joueurs sur le long terme de manière transparente et cohérente, à partir de matchs réellement joués. La base est un <strong>modèle Elo modifié</strong>, complété par une segmentation pilotée par les données en quatre classes (<strong>Class A–D</strong>).</p>
        <p>Méthodologiquement, nous nous appuyons sur l’étalonnage du <strong>MTG Elo Project</strong>, conçu pour des jeux de cartes à variance plus élevée. L’objectif n’est pas un classement agressif avec des écarts extrêmes, mais une estimation stable et réaliste de la force relative.</p>

        <h3>L’Elo comme estimation continue de la performance</h3>
        <p>Chaque joueur entre dans le système avec un rating initial de <strong>1500</strong>. Après chaque match, le rating est mis à jour selon le principe Elo classique : la variation est proportionnelle à l’écart entre le résultat attendu et le résultat réel.</p>
        <p>Nous utilisons un facteur de mise à jour <strong>K = 36</strong>. Cette valeur relativement élevée reflète un contexte communautaire : moins de parties par joueur et une variance plus forte que dans des jeux déterministes comme les échecs.</p>

        <div class="articleCallout">
          <div class="articleCalloutH">Score attendu</div>
          <div class="articleMath">E = 1 / (1 + 10^((R<sub>b</sub> − R<sub>a</sub>) / 1135))</div>
          <div class="muted">Le paramètre clé est la constante <strong>1135</strong>, qui contrôle la « platitude » de la courbe d’attente.</div>
        </div>

        <p>En pratique, un écart de <strong>200</strong> points correspond à environ <strong>60%</strong> de chances attendues pour le joueur le plus fort. Par rapport à l’échelle des échecs (400), le modèle est donc beaucoup moins raide — volontairement. Duel Commander (comme beaucoup de formats de cartes) présente une variance plus élevée (chance, matchups, environnement), et nous réduisons donc l’impact des écarts de rating pour mieux coller à la réalité.</p>

        <div class="articleCallout">
          <div class="articleCalloutH">Mise à jour du rating</div>
          <div class="articleMath">R′ = R + K (S − E)</div>
          <div class="muted">S est le résultat réel : 1 (victoire), 0 (défaite), 0.5 (nul).</div>
        </div>

        <p>En interne, les ratings sont stockés avec une précision décimale afin d’éviter les erreurs d’arrondi systématiques. En externe, nous affichons des valeurs arrondies à l’unité.</p>

        <h3>Ce qui est pris en compte — et ce qui ne l’est pas</h3>
        <p>Le modèle utilise uniquement l’issue du match. Un score <strong>2–0</strong> ou <strong>2–1</strong> a le même impact. Nous notons seulement <strong>victoire/défaite/nul</strong>, pas la marge de victoire — conformément à la philosophie Elo et pour éviter des effets indésirables liés à l’« optimisation de l’écart de score ».</p>
        <ul class="articleList">
          <li><strong>BYE</strong> n’a aucun impact sur le rating.</li>
          <li>Les enregistrements invalides ou incomplets ne sont pas comptabilisés.</li>
          <li>Le rating reflète uniquement des matchs head‑to‑head entre deux joueurs.</li>
        </ul>

        <h3>Interprétation pratique des écarts</h3>
        <p class="muted">À titre indicatif (avec la constante 1135) :</p>
        <ul class="articleList">
          <li>0 point → 50% attendu</li>
          <li>~100 points → 55%</li>
          <li>200 points → 60%</li>
          <li>300 points → ~65%</li>
          <li>400 points → ~69%</li>
        </ul>
        <p>L’idée importante : même 200 points d’écart ne signifient pas une domination, mais un avantage léger à modéré. C’est un objectif de design assumé, inspiré du MTG Elo Project.</p>

        <h3>D’un rating continu aux classes A–D</h3>
        <p>L’Elo fournit une mesure continue. Pour la communauté, une segmentation lisible est utile ; nous appliquons donc un clustering <strong>k‑means</strong> au‑dessus du rating.</p>
        <p>Le clustering s’applique uniquement aux joueurs qui respectent deux conditions :</p>
        <ul class="articleList">
          <li>rating au moins <strong>1500</strong>,</li>
          <li>au moins <strong>10</strong> parties jouées.</li>
        </ul>
        <p>Nous utilisons <strong>k = 4</strong> clusters, ensuite mappés sur Class A (plus haut) à Class D (plus bas dans l’ensemble filtré). L’algorithme minimise la somme des distances au carré aux centroïdes (inertia) : les classes émergent donc des données plutôt que de seuils arbitraires.</p>
        <p class="muted">Remarque : k‑means peut converger vers un minimum local et dépend de l’initialisation. Nous recommandons plusieurs démarrages (p. ex. n_init) et de choisir la solution avec l’inertie la plus faible.</p>

        <h3>Structure empirique des classes</h3>
        <p>Lorsqu’on visualise les ratings, quatre bandes assez distinctes apparaissent souvent : Class A (quelques joueurs autour de ~1680), puis une bande supérieure compacte Class B (~1600–1640), une bande médiane Class C (~1540–1580) et la bande la plus basse après le filtre ≥1500 correspond à Class D (près de ~1500–1520).</p>
        <p>Il est important de noter que les frontières ne sont pas des nombres fixes : elles émergent de la distribution actuelle des ratings dans la communauté.</p>

        <h3>Mode de fonctionnement</h3>
        <p>Le rating et la classification sont entièrement automatisés. Après toute mise à jour ou correction des données :</p>
        <ul class="articleList">
          <li>tous les ratings sont recalculés,</li>
          <li>puis le clustering est relancé sur les joueurs qualifiés.</li>
        </ul>
        <p>Le système est donc dynamique et réagit à l’évolution de la communauté en temps réel.</p>

        <h3>Conclusion</h3>
        <p>Le modèle combine un Elo modifié (courbe d’attente plus plate) et un clustering k‑means piloté par les données. Le résultat :</p>
        <ul class="articleList">
          <li>une estimation cohérente basée uniquement sur des matchs joués,</li>
          <li>une interprétation réaliste des écarts dans un jeu de cartes,</li>
          <li>une segmentation claire sans seuils arbitraires.</li>
        </ul>
        <p class="muted">C’est la première version systématique du classement, prête à évoluer selon les données et les besoins de la communauté.</p>
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
