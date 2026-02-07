// common.js – menu ovládání + fullscreen "stránky" v modalu + přepínač režimu
import { openModal } from "./modal.js";
import { openNewsModal } from "./aktuality.js";

const htmlEl = document.documentElement;
const logoImg = document.getElementById("logoImg");

// --- THEME (stejně jako dřív) ---
function syncLogo(){
  if (!logoImg) return;
  const theme = htmlEl.getAttribute("data-theme") || "dark";
  // Pokud máš jiné názvy souborů, uprav zde
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

// --- MENU ---
const menuBtn = document.getElementById("menuBtn");
const menuPanel = document.getElementById("menuPanel");

const uploadBtn = document.getElementById("menuUpload");
const newsBtn = document.getElementById("menuNews");
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

// Otevírá obsah jako standardní modal ve stejném formátu jako detail hráče
function openMenuPage({ title, subtitle, html }){
  openModal({ title, subtitle, html });
}

// NAHRÁNÍ DAT
if (uploadBtn){
  uploadBtn.addEventListener("click", () => {
    closeMenu();
    openMenuPage({
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
    openNewsModal();
  });
}

// TITULY
if (titlesBtn){
  titlesBtn.addEventListener("click", () => {
    closeMenu();
    openMenuPage({
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
    openMenuPage({
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
    openMenuPage({
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
