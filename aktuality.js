import { openModal } from "./modal.js";

// Okno "Aktuality" (dočasný obsah – později upravíme podle reálných změn)
export function openNewsModal(){
  openModal({
    title: "Aktuality",
    subtitle: "Informace o verzi",
    html: `
      <div class="box boxPad">
        <div class="sectionTitle" style="margin-top:0;">Aktuální verze</div>
        <p class="muted" style="margin-top:6px;">
          Toto okno slouží jako rychlý přehled změn. Text je zatím zástupný a později ho doplníme.
        </p>
        <ul style="margin:10px 0 0; padding-left:18px;">
          <li><b>Beta 0.9</b> – žebříček a detail hráče</li>
          <li>Načítání dat z Google Sheets</li>
          <li>Světlý / tmavý režim</li>
          <li>Tlačítko Aktuality + úprava souhrnných panelů na mobilu</li>
        </ul>
        <div class="hr"></div>
        <div class="sectionTitle">Co chystáme</div>
        <ul style="margin:10px 0 0; padding-left:18px;">
          <li>Další statistiky a filtry</li>
          <li>Rychlejší načítání detailu hráče</li>
        </ul>
      </div>
    `
  });
}
