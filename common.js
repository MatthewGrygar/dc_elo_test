// common.js – menu ovládání + mobilní "stránky" + přepínač režimu
import { openModal, closeModal } from "./modal.js";
import { openNewsModal, buildNewsHtml } from "./aktuality.js";
import { openComparePlayers } from "./compare.js";

const htmlEl = document.documentElement;
const logoImg = document.getElementById("logoImg");

function isNarrowMobile(){
  return window.matchMedia && window.matchMedia("(max-width: 560px)").matches;
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
const menuBtn = document.getElementById("menuBtn");
const menuPanel = document.getElementById("menuPanel");

const uploadBtn = document.getElementById("menuUpload");
const newsBtn = document.getElementById("menuNews");
const compareBtn = document.getElementById("menuCompare");
const titlesBtn = document.getElementById("menuTitles");
const contactBtn = document.getElementById("menuContact");
const recordsBtn = document.getElementById("menuRecords");

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

// POROVNAT HRÁČE
if (compareBtn){
  compareBtn.addEventListener("click", () => {
    closeMenu();
    // Fullscreen overlay/modal – no URL change
    openComparePlayers();
  });
}

// POROVNAT HRÁČE
if (compareBtn){
  compareBtn.addEventListener("click", () => {
    closeMenu();
    // Fullscreen overlay on desktop; on mobile it will use the same overlay/page pattern.
    openComparePlayers();
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
