import { getLang, onLangChange } from "../i18n.js";

const LANG_PREFIX = { cs: "cz", en: "eng", fr: "fr" };

function prefixFor(lang){
  return LANG_PREFIX[lang] || "cz";
}

function srcFor(lang, idx){
  const p = prefixFor(lang);
  // Resolve from this module's location so it works from /cz, /eng, /fr pages (GitHub Pages)
  return new URL(`../assets/images/slider/carousel_${p}_${idx}.png`, import.meta.url).toString();
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

function openSlideLink(k){
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
}

function initCarousel(){
  const hero = document.querySelector(".heroCarousel");
  const track = document.getElementById("carouselTrack");
  const dotsWrap = document.getElementById("carouselDots");
  const prevBtn = document.getElementById("carouselPrev");
  const nextBtn = document.getElementById("carouselNext");
  const goBtn = document.getElementById("carouselGo");
  if (!track || !hero) return;

  const imgs = Array.from(track.querySelectorAll(".carouselImg"));
  if (imgs.length < 2) return;

  let i = 0;
  let timer = null;

  // Dots (clickable)
  let dots = [];
  if (dotsWrap){
    dotsWrap.innerHTML = "";
    dots = imgs.map((_, idx) => {
      const d = document.createElement("span");
      d.className = "carouselDot" + (idx === 0 ? " isActive" : "");
      d.setAttribute("role", "button");
      d.setAttribute("tabindex", "0");
      d.setAttribute("aria-label", `Go to slide ${idx + 1}`);
      d.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        go(idx);
        startAuto();
      });
      d.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " "){
          e.preventDefault();
          go(idx);
          startAuto();
        }
      });
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

  // Center click zone: open slide link
  if (goBtn){
    goBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openSlideLink(i);
    });
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
}

// Init
applyLangToSlides(getLang());
onLangChange((lang) => applyLangToSlides(lang));
initCarousel();
