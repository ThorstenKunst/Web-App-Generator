Übersicht aller Web-Components:
| Komponente | Attribute | Beschreibung |
| :---- | :---- | :---- |
| \<app-header\> | title, nav-action, actions | Flexible Kopfzeile mit optionalen Aktionen links/rechts. |
| \<section-box\> | title, collapsed | Visueller Container für Inhaltsbereiche. |
| \<sticky-footer\> | – | Ein am unteren Bildschirmrand fixierter Button-Bereich. |
| \<app-overlay\> | id | Ein seitlich einfahrender Layer für Einstellungen o.Ä. |
| \<settings-item\> | icon, label, description, action | Flexibler Listeneintrag für Einstellungsseiten. |
| \<modal-dialog\> | title, type, confirm-label, cancel-label | Modale Dialogbox für Warnungen und Bestätigungen. |

### **📝 Formular- & Interaktions-Komponenten**

| Komponente | Attribute | Beschreibung |
| :---- | :---- | :---- |
| \<input-field\> | label, name, value, type, step, suffix | Flexibles Eingabefeld für Text oder Zahlen (mit Stepper). |
| \<textarea-field\> | label, name, value, placeholder | Mehrzeiliges Textfeld. |
| \<range-slider\> | label, name, value, emoji | Skala 1–5 mit optionalen Emojis für Bewertungen. |
| \<toggle-switch\> | label, name, checked | An/Aus-Schalter. |
| \<button-set\> | label, name, options | Button-Gruppe für Mehrfachauswahl. |
| \<date-selector\> | value | Interaktiver Datums-Auswähler mit Pfeilnavigation. |
| \<form-button\> | label, type | Primärer Aktionsbutton, z.B. zum Speichern. |
| \<icon-button\> | icon, tooltip | Ein kleiner, runder Button mit einem Emoji/Icon. |

### **📊 Visualisierungs-Komponenten**

| Komponente | Attribute | Beschreibung |
| :---- | :---- | :---- |
| \<value-tile\> | label, value, trend, chart, color | Kachel zur Darstellung eines Werts mit Verlauf. |
| \<app-message\> | type="info" oder "alert" | Farbiger Hinweisbereich für Benutzer-Feedback. |

#### **Slot-, Event- & Kontext-Definitionen**

| Komponente | Slots | Events | Sichtbarkeitsbereich |
| :---- | :---- | :---- | :---- |
| \<app-header\> | – | nav-click, action-click | Global |
| \<section-box\> | default, footer | toggle | main, overlay |
| \<sticky-footer\> | default | – | main |
| \<app-overlay\> | header, body | overlay-open, overlay-close | Global |
| \<settings-item\> | default | item-click | overlay (spez. Settings) |
| \<modal-dialog\> | default | confirm, cancel | Global |
| \<input-field\> | – | input, change | Formulare |
| \<textarea-field\> | – | input, change | Formulare |
| \<range-slider\> | – | change | Formulare |
| \<toggle-switch\> | – | change | Formulare, Settings |
| \<button-set\> | – | change | Formulare, Settings |
| \<date-selector\> | – | change | Formulare |
| \<form-button\> | – | click | main, overlay |
| \<icon-button\> | – | click | Überall |
| \<value-tile\> | – | – | Dashboard, main |
| \<app-message\> | – | – | main, overlay |
| \<label-with-info\> | label, default | info-click | Formulare |

#### **Regeln für Attribut-Werte**

| Komponente | Attribut | Erlaubte Werte / Format |
| :---- | :---- | :---- |
| \<form-button\> | type | "submit", "reset", "button" |
| \<range-slider\> | emoji | Komma-separierte Emoji-Folge (max. 5\) |
| \<app-message\> | type | "info", "alert" |
| \<button-set\> | type | "single", "multi" |
| \<input-field\> | type | "text", "number", "email", "password" |

#### **Datenbindungs-Verhalten (Formulare)**

| Komponente | name-Pflicht | Liefert Wert | Empfängt Wert |
| :---- | :---- | :---- | :---- |
| \<input-field\> | ✅ | ✅ (via .value) | ✅ (via .value) |
| \<textarea-field\> | ✅ | ✅ (via .value) | ✅ (via .value) |
| \<range-slider\> | ✅ | ✅ (via .value) | ✅ (via .value) |
| \<toggle-switch\> | ✅ | ✅ (via **.checked**) | ✅ (via **.checked**) |
| \<button-set\> | ✅ | ✅ (via .value) | ✅ (via .value) |
| \<date-selector\> | ✅ | ✅ (via .value) | ✅ (via .value) |
| \<form-button\> | ❌ | ❌ | ❌ |
| \<icon-button\> | ❌ | ❌ | ❌ |


#### WICHTIG:
Modal = nur für Alerts/Bestätigungen
Overlay = für komplexe Formulare/Settings

Best Practise für Settings:
--------------------------
<app-overlay id="settingsOverlay">
  <app-header slot="header" title="Einstellungen" 
    actions='[{"id": "closeOverlay", "icon": "❮", "tooltip": "Zurück"}]'>
  </app-header>
  <div slot="body">
    <!-- Settings-Inhalte hier -->
  </div>
</app-overlay>