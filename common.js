/* common.js – menu ovládání + menu stránky jako fullscreen okna */

(function(){
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
    if (menuPanel.classList.contains("isOpen")) closeMenu();
    else openMenu();
  }

  if (menuBtn && menuPanel){
    menuBtn.addEventListener("click", (e) => {
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

  function openFullscreenPage({ title, subtitle, html }){
    const fn = window.openModal;
    if (typeof fn !== "function") return;
    fn({ title, subtitle, html, fullscreen: true });
  }

  // NAHRÁNÍ DAT – otevře fullscreen okno s odkazem
  if (uploadBtn){
    uploadBtn.addEventListener("click", () => {
      closeMenu();
      openFullscreenPage({
        title: "Nahrání dat",
        subtitle: "Formulář",
        html: `
          <div class="pageModal">
            <h2>Nahrání dat</h2>
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
      const fn = window.openNewsModal;
      if (typeof fn === "function") fn({ fullscreen: true });
    });
  }

  // TITULY
  if (titlesBtn){
    titlesBtn.addEventListener("click", () => {
      closeMenu();
      openFullscreenPage({
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
      openFullscreenPage({
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
      openFullscreenPage({
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
})();
