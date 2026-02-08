import { openModal } from "./modal.js";

export function openNewsModal(opts = {}) {
  openModal({
    title: "Aktuality",
    subtitle: "Přehled změn a novinek",
    fullscreen: !!opts.fullscreen,
    html: `
      <div class="box boxPad">

     <!-- VERZE 1.0.0 -->
        <div style="text-align:center; margin:20px 0 10px;">
          <img src="verze 1.0.0.png" 
               alt="Verze 1.0.0"
               style="max-width:100%; border-radius:12px; box-shadow:0 4px 14px rgba(0,0,0,0.25);">
        </div>

        <div class="sectionTitle">
          🚀 Verze 1.0.0
        </div>
        <div class="muted" style="margin-bottom:10px;">
          První oficiální vydání aplikace DC ELO
        </div>

        <div class="sectionTitle">✨ Vylepšení mobilního zobrazení</div>

        <div style="margin-top:10px;">
          <b>Titulní stránka (mobil)</b>
          <ul style="margin:6px 0 12px; padding-left:18px;">
            <li>U dlouhých jmen hráčů se nyní zobrazuje pouze <b>první a poslední slovo</b>, aby nedocházelo k narušení layoutu.</li>
            <li>Pole <b>„Načteno: datum, čas“</b> je menší a užší a již nezabírá celou šířku obrazovky.</li>
          </ul>
        </div>

        <div>
          <b>Individuální karta hráče (mobil)</b>
          <ul style="margin:6px 0 12px; padding-left:18px;">
            <li><b>Filtr turnaje</b> a výběrové pole jsou nyní zobrazeny v jednom řádku.</li>
            <li>Název tabulky byl přesunut pod filtr pro přehlednější rozvržení.</li>
            <li>Názvy tabulek jsou nově zarovnány doleva.</li>
            <li>Celkově upraven layout pro lepší čitelnost na telefonech.</li>
          </ul>
        </div>

        <div class="sectionTitle">🎨 Grafické úpravy a opravy</div>
        <ul style="margin:10px 0 12px; padding-left:18px;">
          <li>Opraven problém s přesahem černého pozadí v tabulce <b>Protiháči</b> (mobilní zobrazení).</li>
          <li>Opraveny drobné grafické chyby při přepínání světlého a tmavého režimu.</li>
          <li>Lehká vizuální úprava individuální karty hráče.</li>
          <li>Optimalizace zobrazení karty hráče pro lepší uživatelský zážitek.</li>
        </ul>

        <div class="sectionTitle">🆕 Nové funkce</div>
        <ul style="margin:10px 0 12px; padding-left:18px;">
          <li>Přidáno nové okno <b>Protiháči</b> na individuální kartu hráče.</li>
          <li>Přidána možnost <b>Filtru turnaje</b> na individuální kartě hráče.</li>
          <li>Na titulní stránku přidáno menu pro snadnější navigaci.</li>
        </ul>

        <div class="sectionTitle">🛠 Technické změny</div>
        <ul style="margin:10px 0 0; padding-left:18px;">
          <li>Kompletní refaktoring projektu.</li>
          <li>Původní struktura s jedním souborem <b>main.html</b> byla přepracována.</li>
          <li>Aplikace nyní využívá strukturovaný repozitář (<b>index.html, app.js, common.js</b> atd.).</li>
          <li>Zlepšena přehlednost kódu a připravenost na další rozvoj.</li>
        </ul>

      </div>
    `
  });
}

window.openNewsModal = openNewsModal;
