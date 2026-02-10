import { openModal } from "./modal.js";

// HTML obsah "Aktuality" – sdílený pro modal i mobilní "stránku"
export function buildNewsHtml(){
  return `

      <div class="box boxPad">
        <img
          src="verze 1.1.0.png"
          alt="Verze 1.1.0"
          style="width:100%; height:auto; border-radius:16px; border:1px solid var(--border2); margin-bottom:12px;"
        />

        <div class="sectionTitle">🚀 Aktualizace aplikace 1.1.0</div>
        <div class="muted" style="margin-top:6px; line-height:1.65;">
          Verze 1.1.0 přináší zásadní novinku v podobě výkonnostního hodnocení hráčů a několik vylepšení přehlednosti i uživatelského rozhraní.
        </div>

        <div class="sectionTitle" style="margin-top:12px;">🏆 Nové hodnocení hráčů – Ranking Class (A–D)</div>
        <div class="muted" style="margin-top:6px; line-height:1.65;">
          Hráči jsou nově rozděleni do výkonnostních tříd na základě svého aktuálního Elo ratingu.
        </div>

        <div class="sectionTitle" style="margin-top:12px;">📊 Metodika hodnocení</div>
        <div class="muted" style="margin-top:6px; line-height:1.65;">Do žebříčku jsou zařazeni pouze hráči:</div>
        <ul class="bullets">
          <li>s ratingem 1500 a vyšším</li>
          <li>s minimálně 10 odehranými zápasy</li>
        </ul>
        <div class="muted" style="margin-top:6px; line-height:1.65;">
          Ostatní hráči jsou označeni jako nezařazení.
        </div>
        <div class="muted" style="margin-top:8px; line-height:1.65;">
          Zařazení hráči jsou rozděleni do čtyř výkonnostních tříd pomocí algoritmu K-means clustering.
          Tato metoda neurčuje pevné bodové hranice, ale automaticky vytváří skupiny podle podobnosti ratingu.
        </div>

        <div class="sectionTitle" style="margin-top:12px;">Výkonnostní třídy</div>
        <ul class="bullets">
          <li><b>Class A</b> – nejvyšší výkonnostní třída</li>
          <li><b>Class B</b></li>
          <li><b>Class C</b></li>
          <li><b>Class D</b> – nejnižší výkonnostní třída</li>
        </ul>
        <div class="muted" style="margin-top:6px; line-height:1.65;">
          Hodnocení se automaticky přepočítává při každé aktualizaci dat.
        </div>

        <div class="sectionTitle" style="margin-top:12px;">🔎 Nový filtr na titulní stránce</div>
        <div class="muted" style="margin-top:6px; line-height:1.65;">
          Přidán toggle switch, který umožňuje zobrazit pouze hráče s minimálně 10 odehranými zápasy.
        </div>
        <div class="muted" style="margin-top:6px; line-height:1.65;">
          Při zapnutí filtru dochází k samostatnému seřazení hodnocených hráčů (1st, 2nd, 3rd…).
        </div>

        <div class="sectionTitle" style="margin-top:12px;">📋 Zobrazení Ranking Class</div>
        <div class="muted" style="margin-top:6px; line-height:1.65;">Ranking Class se nyní zobrazuje:</div>
        <ul class="bullets">
          <li>v seznamu hráčů</li>
          <li>na individuální kartě hráče</li>
        </ul>

        <div class="sectionTitle" style="margin-top:12px;">📱 Úpravy mobilního zobrazení</div>
        <div class="muted" style="margin-top:6px; line-height:1.65;">
          Optimalizace rozhraní pro mobilní zařízení. Lehké vizuální úpravy pro lepší přehlednost a čistší vzhled.
        </div>

        <div class="sectionTitle" style="margin-top:12px;">🔮 Co chystáme do budoucna</div>
        <div class="muted" style="margin-top:6px; line-height:1.65;">Plánujeme rozšíření systému o hráčské tituly, například:</div>
        <ul class="bullets">
          <li>CM (Kandidát mistra)</li>
          <li>M (Mistr)</li>
        </ul>
        <div class="muted" style="margin-top:6px; line-height:1.65;">
          Pro přesné nastavení podmínek získání těchto titulů je však potřeba větší objem dat, aby definice byly spravedlivé a dlouhodobě udržitelné.
        </div>

        <div class="muted" style="margin-top:10px; line-height:1.65;">
          Děkujeme za používání aplikace a těšíme se na vaši zpětnou vazbu! 🎯
        </div>

        <img
          src="version 1.1.0_data.jpg"
          alt="Verze 1.1.0 – data"
          style="width:100%; height:auto; border-radius:16px; border:1px solid var(--border2); margin-top:14px;"
        />
      </div>
      <div class="box boxPad">
        <img
          src="verze 1.0.0.png"
          alt="Verze 1.0.0"
          style="width:100%; height:auto; border-radius:16px; border:1px solid var(--border2); margin-bottom:12px;"
        />

        <div class="sectionTitle">📱 Verze 1.0.0 – Aktualizace aplikace</div>
        <div class="muted" style="margin-top:-4px; margin-bottom:12px;">✨ Vylepšení mobilního zobrazení</div>

        <div class="sectionTitle" style="margin-top:10px;">Titulní stránka (mobil)</div>
        <ul class="bullets">
          <li>U dlouhých jmen hráčů se nyní zobrazuje pouze první a poslední slovo, aby nedocházelo k rozbití layoutu.</li>
          <li>Pole „Načteno: datum, čas“ je na mobilu nově menší a užší, již nezabírá celou šířku obrazovky.</li>
        </ul>

        <div class="sectionTitle" style="margin-top:12px;">Individuální karta hráče (mobil)</div>
        <ul class="bullets">
          <li>FILTR TURNAJE a výběrové pole jsou nově zobrazeny v jednom řádku.</li>
          <li>Název tabulky je přesunut pod filtr pro přehlednější rozvržení.</li>
          <li>Názvy tabulek jsou nyní zarovnány doleva.</li>
          <li>Celkově upraven layout pro lepší čitelnost na telefonech.</li>
        </ul>

        <div class="sectionTitle" style="margin-top:12px;">🎨 Grafické úpravy a opravy chyb</div>
        <ul class="bullets">
          <li>Opraven problém s přesahem černého pozadí v tabulce Protiháči (mobilní zobrazení).</li>
          <li>Opraveny drobné grafické chyby při přepínání světlého a tmavého režimu.</li>
          <li>Lehká vizuální úprava individuální karty hráče.</li>
          <li>Optimalizace zobrazení karty hráče pro lepší uživatelský zážitek.</li>
        </ul>

        <div class="sectionTitle" style="margin-top:12px;">🆕 Nové funkce</div>
        <ul class="bullets">
          <li>Přidáno nové okno Protiháči na individuální kartu hráče.</li>
          <li>Přidána možnost FILTR TURNAJE na individuální kartě hráče.</li>
          <li>Na titulní stránku přidáno menu pro snadnější navigaci.</li>
        </ul>

        <div class="sectionTitle" style="margin-top:12px;">🛠 Technické změny</div>
        <div class="muted" style="margin-bottom:6px;">Refaktoring projektu:</div>
        <ul class="bullets">
          <li>Původní struktura s jedním souborem main.html byla kompletně přepracována.</li>
          <li>Aplikace nyní využívá strukturovaný repozitář (index.html, app.js, common.js atd.).</li>
          <li>Zlepšena přehlednost kódu a připravenost na další rozvoj.</li>
        </ul>
      </div>
      <div class="endSpacer"></div>
  `;
}

// Okno "Aktuality" – desktop modal
export function openNewsModal(){
  openModal({
    title: "Aktuality",
    subtitle: "Verze 1.0.0",
    fullscreen: false,
    html: buildNewsHtml()
  });
}
