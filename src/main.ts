import "./styles.css";

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// Scroll reveal
const revealEls = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
const underline = document.querySelector<HTMLElement>(".underline");

const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        (e.target as HTMLElement).classList.add("is-visible");

        // Draw underline when the headline comes in
        if (underline && e.target === underline.closest(".reveal")) {
          underline.classList.add("is-drawn");
        }
        io.unobserve(e.target);
      }
    }
  },
  { threshold: 0.14 }
);

revealEls.forEach((el) => io.observe(el));

// Gentle parallax for the portrait card
const parallaxCard = document.querySelector<HTMLElement>("[data-parallax]");
const portraitImg = document.querySelector<HTMLImageElement>(".portrait img");

function onMove(ev: PointerEvent) {
  if (!parallaxCard || !portraitImg) return;
  const r = parallaxCard.getBoundingClientRect();
  const px = (ev.clientX - (r.left + r.width / 2)) / r.width; // -0.5..0.5
  const py = (ev.clientY - (r.top + r.height / 2)) / r.height;

  const tx = clamp(px * 8, -8, 8);
  const ty = clamp(py * 8, -8, 8);

  // Move the image a bit (calm motion)
  portraitImg.style.transform = `translate(${tx}px, ${ty}px) scale(1.03)`;
}

function onLeave() {
  if (!portraitImg) return;
  portraitImg.style.transform = "translate(0px, 0px) scale(1.02)";
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

if (parallaxCard && portraitImg && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  parallaxCard.addEventListener("pointermove", onMove);
  parallaxCard.addEventListener("pointerleave", onLeave);
}

// Nice anchor scrolling (native but consistent)
document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if (!href || href === "#") return;
    const id = href.slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.pushState(null, "", href);
  });
});
