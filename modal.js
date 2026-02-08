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
    if (e.key === "Escape" && overlay.style.display === "block") closeModal();
  });

  overlay.querySelector("#closeModalBtn").addEventListener("click", closeModal);

  return overlay;
}

let __modalScrollY = 0;
let __modalPrev = null;
let __modalLocked = false;

function __lockPageScroll(){
  if (__modalLocked) return;
  __modalLocked = true;

  __modalScrollY = window.scrollY || 0;

  const html = document.documentElement;
  const body = document.body;

  // save previous inline styles to restore later
  __modalPrev = {
    htmlOverflow: html.style.overflow || "",
    bodyOverflow: body.style.overflow || "",
    bodyPosition: body.style.position || "",
    bodyTop: body.style.top || "",
    bodyLeft: body.style.left || "",
    bodyRight: body.style.right || "",
    bodyWidth: body.style.width || "",
    bodyPaddingRight: body.style.paddingRight || ""
  };

  // prevent layout shift on desktop due to scrollbar disappearing
  const scrollbarW = window.innerWidth - html.clientWidth;
  if (scrollbarW > 0) {
    body.style.paddingRight = `${scrollbarW}px`;
  }

  html.style.overflow = "hidden";
  body.style.overflow = "hidden";

  // iOS Safari needs position:fixed to actually lock background scroll
  body.style.position = "fixed";
  body.style.top = `-${__modalScrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
}

function __unlockPageScroll(){
  if (!__modalLocked) return;
  __modalLocked = false;

  const html = document.documentElement;
  const body = document.body;

  if (__modalPrev){
    html.style.overflow = __modalPrev.htmlOverflow;
    body.style.overflow = __modalPrev.bodyOverflow;
    body.style.position = __modalPrev.bodyPosition;
    body.style.top = __modalPrev.bodyTop;
    body.style.left = __modalPrev.bodyLeft;
    body.style.right = __modalPrev.bodyRight;
    body.style.width = __modalPrev.bodyWidth;
    body.style.paddingRight = __modalPrev.bodyPaddingRight;
  } else {
    html.style.overflow = "";
    body.style.overflow = "";
    body.style.position = "";
    body.style.top = "";
    body.style.left = "";
    body.style.right = "";
    body.style.width = "";
    body.style.paddingRight = "";
  }

  window.scrollTo(0, __modalScrollY);
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
  __lockPageScroll();

  // always scroll modal content to top on open (nice on mobile)
  const bodyEl = overlay.querySelector("#modalBody");
  if (bodyEl) bodyEl.scrollTop = 0;
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
  overlay.style.display = "none";

  const body = overlay.querySelector("#modalBody");
  if (body) body.innerHTML = "";

  const actions = overlay.querySelector("#modalActions");
  if (actions) actions.innerHTML = "";

  __unlockPageScroll();
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
