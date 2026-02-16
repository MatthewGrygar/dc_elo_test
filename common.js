// common.js – menu ovládání + mobilní "stránky" + přepínač režimu
import { openModal, closeModal } from "./modal.js";
import { openNewsModal, buildNewsHtml } from "./aktuality.js";
import { initI18n, t, setLang, getLang, onLangChange } from "./i18n.js";

const htmlEl = document.documentElement;
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
    <div class="supportX">
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
            <img class="supportXQr" src="assets/images/support/QR.png" alt="${t("support_qr_alt")}" loading="lazy" />
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
        ? "assets/images/support/QR2.png"
        : "assets/images/support/QR.png";
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
  logoImg.src = (theme === "dark") ? "assets/images/logos/logo.png" : "assets/images/logos/logo2.png";
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
  const src = (lang === "en") ? "assets/images/flags/eng.png" : (lang === "fr") ? "assets/images/flags/fr.png" : "assets/images/flags/cz.png";
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
        <div class="pageModal">
          <h2>${t("menu_management")}</h2>
          <p class="muted">${t("management_body")}</p>
        </div>
      `
    });
  });
}

// ČLÁNKY
if (articlesBtn){
  articlesBtn.addEventListener("click", () => {
    closeMenu();
    openMenuDestination({
      title: t("articles_title"),
      subtitle: t("articles_sub"),
      html: `
        <div class="pageModal articleCard">
          <img class="articleHero" src="assets/images/articles/elo_article_cover.png" alt="Article cover" loading="lazy" />
          <div class="articleRow">
            <div class="articleTitle">Jak počítáme Elo a výkonostní třídy v Duel Commanders komunitě.</div>
            <a class="btnPrimary articleBtn" href="https://grailseries.cz/" target="_blank" rel="noopener">${t("articles_read")}</a>
          </div>
        </div>
      `
    });
  });
}

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
