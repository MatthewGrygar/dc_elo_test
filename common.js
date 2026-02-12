// common.js – menu ovládání + mobilní "stránky" + přepínač režimu
import { openModal, closeModal } from "./modal.js";
import { openNewsModal, buildNewsHtml } from "./aktuality.js";

const htmlEl = document.documentElement;
const logoImg = document.getElementById("logoImg");

function isNarrowMobile(){
  return window.matchMedia && window.matchMedia("(max-width: 560px)").matches;
}

function isMobileModal(){
  // Fullscreen modal for smaller screens (homepage uses 760px).
  return window.matchMedia && window.matchMedia("(max-width: 760px)").matches;
}

// -------------------- PODPOŘIT --------------------
function openSupportModal(){
  const bodyHtml = `
    <div class="supportModal">
      <div class="supportHero">
        <div class="supportTitle">Podpořte DC ELO</div>
        <div class="supportBrand">BY GRAIL SERIES</div>
        <div class="supportTagline">Vaše podpora nám pomáhá organizovat lepší turnaje</div>
      </div>

      <div class="supportQrWrap">
        <img class="supportQr" src="QR.png" alt="QR kód" loading="lazy" />
      </div>

      <div class="supportInfo" aria-label="Informace o účtu">
        <div class="supportInfoTitle">INFORMACE O ÚČTU:</div>

        <div class="supportInfoLine">
          <b>Číslo účtu:</b>
          <span class="supportCopy" role="button" tabindex="0" data-copy="2640017029/3030">2640017029/3030</span>
          <span class="supportCopyFeedback" aria-live="polite"></span>
        </div>

        <div class="supportInfoLine">
          <b>IBAN:</b>
          <span class="supportCopy" role="button" tabindex="0" data-copy="CZ03 3030 0000 0026 4001 7029">CZ03 3030 0000 0026 4001 7029</span>
          <span class="supportCopyFeedback" aria-live="polite"></span>
        </div>

        <div class="supportInfoLine">
          <b>BIC (SWIFT):</b>
          <span class="supportCopy" role="button" tabindex="0" data-copy="AIRACZP">AIRACZP</span>
          <span class="supportCopyFeedback" aria-live="polite"></span>
        </div>
      </div>

      <div class="supportNote" aria-label="Poděkování">
        Děkujeme
      </div>
    </div>
  `;

  openModal({
    title: "Podpořit",
    subtitle: "",
    html: bodyHtml,
    fullscreen: isMobileModal()
  });

  // Copy-to-clipboard (support modal) – binding after modal render
  const overlayEl = document.getElementById("modalOverlay");
  if (!overlayEl) return;
  const rootEl = overlayEl.querySelector(".supportModal");
  if (!rootEl) return;

  const doCopy = async (text) => {
    try{
      if (navigator.clipboard && navigator.clipboard.writeText){
        await navigator.clipboard.writeText(text);
        return true;
      }
    }catch(e){}

    // Fallback
    try{
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return !!ok;
    }catch(e){
      return false;
    }
  };

  const flash = (wrapEl, msg) => {
    const feedback = wrapEl?.querySelector?.(".supportCopyFeedback");
    if (!feedback) return;
    feedback.textContent = msg;
    window.setTimeout(() => { feedback.textContent = ""; }, 1200);
  };

  const binds = rootEl.querySelectorAll(".supportCopy");
  binds.forEach((el) => {
    const text = el.getAttribute("data-copy") || "";
    const wrap = el.closest(".supportInfoLine");

    const handler = async () => {
      if (!text) return;
      const ok = await doCopy(text);
      flash(wrap, ok ? "Zkopírováno" : "Nelze zkopírovat");
    };

    el.addEventListener("click", handler);
    el.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " "){
        ev.preventDefault();
        handler();
      }
    });
  });
}

// -------------------- THEME --------------------
function syncLogo(){
  if (!logoImg) return;
  const theme = htmlEl.getAttribute("data-theme") || "dark";
  logoImg.src = (theme === "dark") ? "logo.png" : "logo2.png";
}

function setTheme(theme){
  htmlEl.setAttribute("data-theme", theme);
  const themeLabel = document.getElementById("themeLabel");
  if (themeLabel){
    themeLabel.textContent = (theme === "dark") ? "☀️ Světlý" : "Tmavý 🌙";
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
      title: "Nahrání dat",
      subtitle: "Formulář",
      html: `
        <div class="pageModal">
          <h2>NAHRÁNÍ DAT</h2>
          <p class="muted">Data se nahrávají přes Google formulář.</p>
          <a class="btnPrimary" href="https://forms.gle/Y7aHApF5NLFLw6MP9" target="_blank" rel="noopener">Otevřít formulář</a>
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
        title: "Aktuality",
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
      title: "Vedení",
      subtitle: "Placeholder",
      html: `
        <div class="pageModal">
          <h2>VEDENÍ</h2>
          <p class="muted">Obsah bude doplněn.</p>
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
      title: "Články",
      subtitle: "Placeholder",
      html: `
        <div class="pageModal">
          <h2>ČLÁNKY</h2>
          <p class="muted">Obsah bude doplněn.</p>
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
      title: "Tituly",
      subtitle: "Přehled",
      html: `
        <div class="pageModal">
          <h2>TITULY</h2>
          <p class="muted">Zatím krátký popis. Tuhle stránku následně spolu přepracujeme.</p>
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
      title: "Kontakt",
      subtitle: "Info",
      html: `
        <div class="pageModal">
          <h2>KONTAKT</h2>
          <p class="muted">Zatím krátký popis. Později doplníme kontaktní údaje a odkazy.</p>
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
      title: "Rekordy",
      subtitle: "Přehled",
      html: `
        <div class="pageModal">
          <h2>REKORDY</h2>
          <p class="muted">Zatím krátký popis. Následně doplníme konkrétní rekordy a statistiky.</p>
        </div>
      `
    });
  });
}
