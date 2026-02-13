import { getLang, onLangChange } from "../i18n.js";

const LANG_PREFIX = { cs: "cz", en: "eng", fr: "fr" };

function prefixFor(lang){
  return LANG_PREFIX[lang] || "cz";
}

function srcFor(lang, idx){
  const p = prefixFor(lang);
  return `slider/carousel_${p}_${idx}.png`;
}

function applyLangToSlides(lang){
  const track = document.getElementById("carouselTrack");
  if (!track) return;
  const imgs = Array.from(track.querySelectorAll(".carouselImg"));
  imgs.forEach((img, k) => {
    const idx = k + 1;
    img.src = srcFor(lang, idx);
  });
}

function wireSlideClicks(){
  const track = document.getElementById("carouselTrack");
  if (!track) return;

  track.addEventListener("click", (e) => {
    const img = e.target && e.target.closest ? e.target.closest(".carouselImg") : null;
    if (!img) return;

    const imgs = Array.from(track.querySelectorAll(".carouselImg"));
    const k = imgs.indexOf(img);
    if (k === -1) return;

    // 1) Vedení (interní)
    if (k === 0){
      const btn = document.getElementById("menuManagement");
      if (btn) btn.click();
      return;
    }
    // 2) Články (interní)
    if (k === 1){
      const btn = document.getElementById("menuArticles");
      if (btn) btn.click();
      return;
    }
    // 3) Externí web
    if (k === 2){
      window.open("https://grailseries.cz/", "_blank", "noopener,noreferrer");
    }
  });
}

function initCarousel(){
  const hero = document.querySelector(".heroCarousel");
  const track = document.getElementById("carouselTrack");
  const dotsWrap = document.getElementById("carouselDots");
  const prevBtn = document.getElementById("carouselPrev");
  const nextBtn = document.getElementById("carouselNext");
  if (!track || !hero) return;

  const imgs = Array.from(track.querySelectorAll(".carouselImg"));
  if (imgs.length < 2) return;

  let i = 0;
  let timer = null;

  // Dots
  let dots = [];
  if (dotsWrap){
    dotsWrap.innerHTML = "";
    dots = imgs.map((_, idx) => {
      const d = document.createElement("span");
      d.className = "carouselDot" + (idx === 0 ? " isActive" : "");
      d.setAttribute("role", "presentation");
      dotsWrap.appendChild(d);
      return d;
    });
  }

  const setActive = (idx) => {
    imgs.forEach((img, k) => img.classList.toggle("isActive", k === idx));
    if (dots.length) dots.forEach((d, k) => d.classList.toggle("isActive", k === idx));
  };

  const go = (idx) => {
    i = (idx + imgs.length) % imgs.length;
    setActive(i);
  };

  const next = () => go(i + 1);
  const prev = () => go(i - 1);

  const startAuto = () => {
    stopAuto();
    timer = window.setInterval(next, 5200);
  };
  const stopAuto = () => {
    if (timer){
      window.clearInterval(timer);
      timer = null;
    }
  };

  // Desktop click zones (no visible arrows)
  if (prevBtn){
    prevBtn.addEventListener("click", () => { prev(); startAuto(); });
  }
  if (nextBtn){
    nextBtn.addEventListener("click", () => { next(); startAuto(); });
  }

  // Touch swipe
  let startX = 0, startY = 0, dx = 0, dy = 0, isTracking = false, isHorizontal = false;

  const onTouchStart = (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    dx = 0; dy = 0;
    isTracking = true;
    isHorizontal = false;
  };

  const onTouchMove = (e) => {
    if (!isTracking || !e.touches || e.touches.length !== 1) return;
    const t = e.touches[0];
    dx = t.clientX - startX;
    dy = t.clientY - startY;

    if (!isHorizontal){
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);
      if (adx > 8 || ady > 8) isHorizontal = adx > ady;
    }
    if (isHorizontal) e.preventDefault();
  };

  const onTouchEnd = () => {
    if (!isTracking) return;
    isTracking = false;

    const adx = Math.abs(dx);
    const ady = Math.abs(dy);
    if (!isHorizontal || adx < 30 || adx < ady) return;

    if (dx < 0) next(); else prev();
    startAuto();
  };

  hero.addEventListener("touchstart", onTouchStart, { passive: true });
  hero.addEventListener("touchmove", onTouchMove, { passive: false });
  hero.addEventListener("touchend", onTouchEnd);
  hero.addEventListener("mouseenter", stopAuto);
  hero.addEventListener("mouseleave", startAuto);

  startAuto();
  wireSlideClicks();
}

// Init
applyLangToSlides(getLang());
onLangChange((lang) => applyLangToSlides(lang));
initCarousel();
