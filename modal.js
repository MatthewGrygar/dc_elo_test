// modal.js
// setModalOnCloseRequest umožní navázat vlastní akci na zavření (např. návrat URL zpět na seznam).
let __modalOnCloseRequest = null;

export function setModalOnCloseRequest(fn){
  __modalOnCloseRequest = (typeof fn === "function") ? fn : null;
}

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
    if (e.target === overlay) (__modalOnCloseRequest ? __modalOnCloseRequest() : closeModal());
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.style.display === "block") (__modalOnCloseRequest ? __modalOnCloseRequest() : closeModal());
  });

  overlay.querySelector("#closeModalBtn").addEventListener("click", () => (__modalOnCloseRequest ? __modalOnCloseRequest() : closeModal()));

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
  overlay.style.display = "block";
  document.body.style.overflow = "hidden";
}

export function closeModal() {
  const overlay = document.getElementById("modalOverlay");
  if (!overlay) return;
  const modalEl = overlay.querySelector('.modal');
  if (modalEl) modalEl.classList.remove('modalFullscreen');
  overlay.style.display = "none";
  document.body.style.overflow = "";
  const body = overlay.querySelector("#modalBody");
  if (body) body.innerHTML = "";

  const actions = overlay.querySelector("#modalActions");
  if (actions) actions.innerHTML = "";
}

// zpřístupnění i mimo ES moduly (např. common.js, aktuality.js)
try{
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.setModalContent = setModalContent;
  window.setModalHeaderMeta = setModalHeaderMeta;
  window.setModalActions = setModalActions;
}catch(e){}

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
