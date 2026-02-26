(() => {
  // Mark ready to trigger hero entrance
  window.addEventListener('load', () => {
    document.body.classList.add('is-ready');

    const y = document.getElementById('year');
    if (y) y.textContent = String(new Date().getFullYear());
  });

  // Smooth anchor scrolling
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href');
    if (!id || id === '#') return;

    const el = document.querySelector(id);
    if (!el) return;

    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Reveal on scroll
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12 }
  );

  revealEls.forEach((el) => io.observe(el));
})();
