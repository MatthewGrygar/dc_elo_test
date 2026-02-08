import { openModal } from "./modal.js";

export function openNewsModal(opts = {}) {
  openModal({
    title: "Aktuality",
    subtitle: "Přehled změn a novinek",
    fullscreen: !!opts.fullscreen,
    html: `
      <div class="box boxPad"
           style="
             max-height: calc(100dvh - 140px);
             overflow: auto;
             -webkit-overflow-scrolling: touch;
             padding-bottom: calc(18px + env(safe-area-inset-bottom));
           ">

        <!-- VERZE 1.0.0 -->
        <div style="text-align:center; margin:18px 0 10px;">
          <img src="./assets/verze-1.0.0.png"
               alt="Verze 1.0.0"
               style="
                 max-width:100%;
                 height:auto;
                 border-radius:12px;
                 box-shadow:0 4px 14px rgba(0,0,0,0.25);
               ">
        </div>

        <div class="sectionTitle">🚀 Verze 1.0.0</div>
        <div class="muted" style="margin-bottom:10px;">
          První oficiální vydání aplikace DC ELO
        </div>

        <div style="margin-top:10px;">
          <b>Titulní stránka (mobil)</b>
          <ul style="margin:6px 0 12px; padding-left:18px;">
            <li>U dlouhých jmen hráčů se nyní zobrazuje pouze <b>první a poslední slovo</b>.</li>
            <li>Pole <b>„Načteno: datum, čas“</b> je menší a užší.</li>
          </ul>
        </div>

        <div>
          <b>Individuální karta hráče (mobil)</b>
          <ul style="margin:6px 0 12px; padding-left:18px;">
            <li><b>Filtr turnaje</b> a výběr jsou nově v jednom řádku.</li>
            <li>Název tabulky přesunut pod filtr.</li>
            <li>Názvy tabulek zarovnány doleva.</li>
            <li>Vylepšená čitelnost na telefonech.</li>
          </ul>
        </div>

        <div class="sectionTitle">🎨 Grafické úpravy a opravy</div>
        <ul style="margin:10px 0 12px; padding-left:18px;">
          <li>Opraven přesah černého pozadí v tabulce <b>Protiháči</b>.</li>
          <li>Opraveny drobné chyby ve světlém/tmavém režimu.</li>
          <li>Optimalizace karty hráče.</li>
        </ul>

        <div class="sectionTitle">🆕 Nové funkce</div>
        <ul style="margin:10px 0 12px; padding-left:18px;">
          <li>Nové okno <b>Protiháči</b>.</li>
          <li><b>Filtr turnaje</b> na kartě hráče.</li>
          <li>Menu na titulní stránce.</li>
        </ul>

        <div class="sectionTitle">🛠 Technické změny</div>
        <ul style="margin:10px 0 18px; padding-left:18px;">
          <li>Kompletní refaktoring projektu.</li>
          <li>Přechod z jednoho souboru na strukturovaný repozitář.</li>
          <li>Lepší připravenost na další rozvoj.</li>
        </ul>

        <div class="hr"></div>

      </div>
    `
  });
}

window.openNewsModal = openNewsModal;
