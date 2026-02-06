/* common.js – menu + theme + základní akce (používá se na všech stránkách) */

(function(){
  const htmlEl = document.documentElement;

  const menuBtn = document.getElementById("menuBtn");
  const menuPanel = document.getElementById("menuPanel");

  const requestUploadBtn = document.getElementById("requestUploadBtn");
  const newsBtn = document.getElementById("newsBtn");

  const themeToggle = document.getElementById("themeToggle");
  const themeLabel = document.getElementById("themeLabel");

  function setTheme(next){
    htmlEl.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch(e){}
    if (themeLabel){
      themeLabel.textContent = (next === "dark" ? "🌙 Tmavý" : "☀️ Světlý");
    }
  }

  // init theme from storage
  try{
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") setTheme(saved);
    else setTheme(htmlEl.getAttribute("data-theme") || "dark");
  }catch(e){
    setTheme(htmlEl.getAttribute("data-theme") || "dark");
  }

  // theme toggle
  if (themeToggle){
    themeToggle.addEventListener("click", () => {
      const cur = htmlEl.getAttribute("data-theme") || "dark";
      setTheme(cur === "dark" ? "light" : "dark");
    });
  }

  // menu open/close
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
      // klik mimo panel zavře
      if (!menuPanel.classList.contains("isOpen")) return;
      if (menuPanel.contains(e.target) || menuBtn.contains(e.target)) return;
      closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  // menu actions
  if (requestUploadBtn){
    requestUploadBtn.addEventListener("click", () => {
      closeMenu();
      window.location.href = "https://forms.gle/Y7aHApF5NLFLw6MP9";
    });
  }

  if (newsBtn){
    newsBtn.addEventListener("click", () => {
      closeMenu();
      const fn = window.openNewsModal;
      if (typeof fn === "function") fn();
    });
  }
})();
