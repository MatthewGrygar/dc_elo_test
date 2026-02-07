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

export function openModal({ title, subtitle, html }) {
  const overlay = ensureModal();
  overlay.querySelector("#modalName").textContent = title || "Hráč";
  overlay.querySelector("#modalSub").textContent = subtitle || "Detail hráče";
  overlay.querySelector("#modalBody").innerHTML = html || "";
  overlay.style.display = "block";
  document.body.style.overflow = "hidden";
}

export function closeModal() {
  const overlay = document.getElementById("modalOverlay");
  if (!overlay) return;
  overlay.style.display = "none";
  document.body.style.overflow = "";
  const body = overlay.querySelector("#modalBody");
  if (body) body.innerHTML = "";
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
