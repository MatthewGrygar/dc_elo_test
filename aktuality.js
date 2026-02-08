import { openModal } from "./modal.js";

export function openNewsModal(opts = {}){
  openModal({
    title: "Aktuality",
    subtitle: "Informace o verzi",
    fullscreen: !!opts.fullscreen,
    html: `
      <div class="box boxPad newsWrap">
        <img class="newsHero" src="verze 1.0.0.png" alt="Verze 1.0.0" />

        <div class="newsTitle">📱 Verze 1.0.0 – Aktualizace aplikace</div>
        <div class="newsSubtitle">✨ Vylepšení mobilního zobrazení</div>

        <div class="newsH">Titulní stránka (mobil)</div>
        <ul class="newsList">
          <li>U dlouhých jmen hráčů se nyní zobrazuje pouze první a poslední slovo, aby nedocházelo k rozbití layoutu.</li>
          <li>Pole „Načteno: datum, čas“ je na mobilu nově menší a užší, již nezabírá celou šířku obrazovky.</li>
        </ul>

        <div class="newsH">Individuální karta hráče (mobil)</div>
        <ul class="newsList">
          <li>FILTR TURNAJE a výběrové pole jsou nově zobrazeny v jednom řádku.</li>
          <li>Název tabulky je přesunut pod filtr pro přehlednější rozvržení.</li>
          <li>Názvy tabulek jsou nyní zarovnány doleva.</li>
          <li>Celkově upraven layout pro lepší čitelnost na telefonech.</li>
        </ul>

        <div class="newsSubtitle" style="margin-top:14px;">🎨 Grafické úpravy a opravy chyb</div>
        <ul class="newsList">
          <li>Opraven problém s přesahem černého pozadí v tabulce Protiháči (mobilní zobrazení).</li>
          <li>Opraveny drobné grafické chyby při přepínání světlého a tmavého režimu.</li>
          <li>Lehká vizuální úprava individuální karty hráče.</li>
          <li>Optimalizace zobrazení karty hráče pro lepší uživatelský zážitek.</li>
        </ul>

        <div class="newsSubtitle" style="margin-top:14px;">🆕 Nové funkce</div>
        <ul class="newsList">
          <li>Přidáno nové okno Protiháči na individuální kartu hráče.</li>
          <li>Přidána možnost FILTR TURNAJE na individuální kartě hráče.</li>
          <li>Na titulní stránku přidáno menu pro snadnější navigaci.</li>
        </ul>

        <div class="newsSubtitle" style="margin-top:14px;">🛠 Technické změny</div>
        <div class="newsH" style="margin-top:6px;">Refaktoring projektu:</div>
        <ul class="newsList">
          <li>Původní struktura s jedním souborem main.html byla kompletně přepracována.</li>
          <li>Aplikace nyní využívá strukturovaný repozitář (index.html, app.js, common.js atd.).</li>
          <li>Zlepšena přehlednost kódu a připravenost na další rozvoj.</li>
        </ul>
      </div>
    `
  });
}

// zpřístupnění pro app.js (který může běžet samostatně jako modul)
window.openNewsModal = openNewsModal;
