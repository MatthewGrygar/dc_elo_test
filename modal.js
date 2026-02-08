// modal.js
export function ensureModal() {
  let overlay = document.getElementById("modalOverlay");
  if (overlay) return overlay;

  overlay = document.createElement("div");
  overlay.id = "modalOverlay";
  overlay.className = "modalOverlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");

  overlay.innerHTML = `
    <div class="modal">
      <div class="modalHeader">
        <div class="modalTitle">
          <b id="modalName">Hráč</b>
          <span id="modalSub">Detail hráče</span>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <div id="modalActions" class="modalActions"></div>
          <button id="closeModalBtn" class="btnDanger" type="button">Zavřít</button>
        </div>
      </div>
      <div class="modalBody" id="modalBody"></div>
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("isOpen")) closeModal();
  });

  overlay.querySelector("#closeModalBtn").addEventListener("click", closeModal);

  return overlay;
}

export function openModal({ title, subtitle, html, fullscreen }) {
  const overlay = ensureModal();
  const modalEl = overlay.querySelector('.modal');
  if (modalEl){
    modalEl.classList.toggle('modalFullscreen', !!fullscreen);
  }
  overlay.querySelector("#modalName").textContent = title || "Hráč";
  overlay.querySelector("#modalSub").textContent = subtitle || "Detail hráče";
  overlay.querySelector("#modalBody").innerHTML = html || "";
  const actions = overlay.querySelector("#modalActions");
  if (actions) actions.innerHTML = "";

  // Zamknutí scrollu stránky:
  // - "position: fixed" na body často způsobuje useknutí obsahu na mobilech (URL bar / spodní lišta)
  // - používáme proto overflow lock na <html>/<body> + overscroll containment
  const y = window.scrollY || 0;
  document.body.dataset.scrollY = String(y);
  document.documentElement.classList.add("modalOpen");
  document.body.classList.add("modalOpen");

  overlay.classList.add("isOpen");
}

// zpřístupnění pro non-module skripty (menu/aktuality)
try{
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.setModalContent = setModalContent;
  window.setModalHeaderMeta = setModalHeaderMeta;
  window.setModalActions = setModalActions;
}catch(e){}

export function closeModal() {
  const overlay = document.getElementById("modalOverlay");
  if (!overlay) return;
  const modalEl = overlay.querySelector('.modal');
  if (modalEl) modalEl.classList.remove('modalFullscreen');

  overlay.classList.remove("isOpen");

  // Obnovení scrollu stránky
  const y = parseInt(document.body.dataset.scrollY || "0", 10) || 0;
  delete document.body.dataset.scrollY;
  document.documentElement.classList.remove("modalOpen");
  document.body.classList.remove("modalOpen");
  window.scrollTo(0, y);
  const body = overlay.querySelector("#modalBody");
  if (body) body.innerHTML = "";

  const actions = overlay.querySelector("#modalActions");
  if (actions) actions.innerHTML = "";
}

export function setModalContent(html) {
  const overlay = ensureModal();
  overlay.querySelector("#modalBody").innerHTML = html || "";
}

export function setModalHeaderMeta({ title, subtitle }){
  const overlay = ensureModal();
  if (title != null) overlay.querySelector("#modalName").textContent = title;
  if (subtitle != null) overlay.querySelector("#modalSub").textContent = subtitle;
}

// Nastaví/změní akční tlačítka vpravo v horní liště modalu (vedle Zavřít)
export function setModalActions(html){
  const overlay = ensureModal();
  const actions = overlay.querySelector("#modalActions");
  if (!actions) return;
  actions.innerHTML = html || "";
}

// Zpřístupnění i mimo ES moduly (např. common.js, aktuality.js)
try{
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.setModalContent = setModalContent;
  window.setModalHeaderMeta = setModalHeaderMeta;
  window.setModalActions = setModalActions;
}catch(e){}
