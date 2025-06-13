Komponenten-Kochbuch 
Dieses Dokument zeigt praktische Anwendungsbeispiele für jede Komponente des Baukastens. Nutze diese Schnipsel als Referenz und Startpunkt für den Aufbau deiner Benutzeroberfläche in index.php.

Übersicht:
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

-----------------------------------------------------------------------------------------------------------------------

<app-header>
Eine flexible Kopfzeile für die App. Sie kann einen Titel, eine linke Navigations-Aktion (z.B. "Zurück") und mehrere rechte Aktionen (z.B. "Einstellungen", "Logout") aufnehmen.

Attribute:

title="Text": Der Haupttitel, der in der Mitte oder links angezeigt wird.
nav-action='{ "icon": "...", "tooltip": "..." }': Definiert einen einzelnen Button auf der linken Seite. Ideal für "Zurück"-Pfeile in Overlays. Löst ein nav-click-Event aus.
actions='[{ "id": "...", "icon": "...", "tooltip": "..." }]': Definiert einen oder mehrere Buttons auf der rechten Seite. Erwartet ein JSON-Array. Löst ein action-click-Event mit der id im Detail aus.

Anwendungsfall 1: Haupt-Header der App

Zeigt einen Titel und einen Einstellungs-Button auf der rechten Seite an.

<app-header
  id="main-header"
  title="Moin Thorsten!"
  actions='[{ "id": "settings", "icon": "⚙️", "tooltip": "Einstellungen" }]'>
</app-header>

Anwendungsfall 2: Header für ein Overlay

Zeigt einen "Zurück"-Pfeil auf der linken Seite und einen zentrierten Titel.

<app-header
  slot="header"
  title="Einstellungen"
  nav-action='{ "icon": "❮", "tooltip": "Zurück" }'>
</app-header>

Die dazugehörige Logik in app.js:

JavaScript

// Für den Overlay-Header
const overlayHeader = document.querySelector('app-overlay app-header');
overlayHeader.addEventListener('nav-click', () => {
    // Schließe das Overlay, wenn der Zurück-Pfeil geklickt wird
    document.getElementById('settingsOverlay').close();
});

--

<section-box>
Die <section-box> ist der primäre Container zur Gliederung von Inhalten. Sie kann andere Komponenten aufnehmen und optional über das collapsed-Attribut eingeklappt dargestellt werden.

Standard-Anwendung:

<section-box title="Allgemeines Befinden">
  <input-field label="Gewicht" name="gewicht" suffix="kg"></input-field>
  <range-slider label="Schlafqualität" name="schlafqualitaet"></range-slider>
</section-box>

Anwendung mit Footer-Bereich und eingeklapptem Zustand:

Der slot="footer" wird verwendet, um Elemente wie den Haupt-Speichern-Button im abgetrennten Fußbereich der Box zu platzieren.

<section-box title="Tagesprotokoll" collapsed>
  <!-- Hauptinhalt -->
  <input-field label="Gewicht" name="gewicht" suffix="kg"></input-field>
  <range-slider label="Schlafqualität" name="schlafqualitaet"></range-slider>

  <!-- Inhalt für den Footer -->
  <div slot="footer">
    <form-button label="Tagesprotokoll speichern" type="submit"></form-button>
  </div>
</section-box>

--

<range-slider>
Eine Skala von 1-5, ideal für Bewertungen. Das emoji-Attribut ist optional und erwartet eine komma-separierte Liste von Emojis.

Einfacher Slider:

<range-slider label="Stress-Level" name="stress_level" value="2"></range-slider>

Slider mit Emojis:

<range-slider
  label="Schlafqualität"
  name="schlafqualitaet"
  value="5"
  emoji="😴,😟,😐,🙂,🤩">
</range-slider>

--

<button-set>
Für eine Mehrfachauswahl, bei der eine oder mehrere Optionen gewählt werden können. Die Optionen werden als komma-separierter String im options-Attribut übergeben.

--

<button-set
  label="Heutiges Training"
  name="training"
  options="Brust/Bizeps,Rücken/Trizeps,Beine/Rumpf,Yoga/Meditation,PC-Muskel">
</button-set>

--

<form-button>
Der Standard-Aktionsbutton, meistens zum Speichern oder Abschicken von Daten.

<form-button label="Änderungen speichern" type="submit"></form-button>

--

<icon-button icon="♻️" tooltip="Neu laden"></icon-button>

--

<textarea-field 
  label="Allgemeine Bemerkungen zum Tag" 
  name="bemerkungen" 
  placeholder="Gedanken, Erlebnisse, Erfolge...">
</textarea-field>

--

Ein <value-tile> ist eine visuelle Web-Komponente aus deinem BaaS-Baukasten – gedacht zur kompakten Darstellung einzelner Messwerte oder Statusanzeigen, z.B. „Gewicht heute: 85,2 kg“ oder „Libido: 4/5 ↗

✅ Features:
label = z.B. "STRESS", "LIBIDO"
value = aktuelle Zahl oder Text (z.B. "5" oder "126.6")
trend = "up" "down" "flat" → zeigt Symbol ▲ ▼ →
chart = JSON-Array (z.B. [5, 6, 4, 7]) → Mini-Bar-Chart
color = "positive", "neutral", "negative" → beeinflusst heutige Balkenfarbe

<value-tile 
  label="Gewicht (kg)" 
  value="126.6" 
  trend="up" 
  color="negative"
  chart="[125.2, 125.5, 126.0, 126.6]">
</value-tile>

--

<app-message>
🔧 Attribute:
type="info" → lila-blauer Verlauf (Standard)
type="alert" → rot-orangener Verlauf
kein type → grau-neutraler Hintergrund

🖼 Beispiel:

<app-message type="info">
  Starke Leistung gestern beim Training! Heute ist ein neuer Tag, um wieder voll durchzustarten.
</app-message>

--

<app-overlay id="settingsOverlay">
  <!-- 
    HIER PASSIERT DIE MAGIE:
    Wir stecken eine vollwertige <app-header>-Komponente in den "header"-Slot des Overlays.
    Der Zurück-Pfeil ist jetzt einfach ein Action-Button.
  -->
  <app-header 
    slot="header" 
    title="Einstellungen"
    actions='[{ "id": "closeOverlay", "icon": "❮", "tooltip": "Zurück" }]'>
  </app-header>

  <!-- Der restliche Inhalt für das Overlay -->
  <div slot="body">
    <p>Hier sind die Einstellungsoptionen...</p>
    <toggle-switch label="Sex-Tracking anzeigen" name="sex_tracking" checked></toggle-switch>
  </div>
</app-overlay>

⚙️ Öffnen per JS:
In app.js:

// Den 'action-click'-Event vom Header im Overlay abfangen
const settingsOverlay = document.getElementById('settingsOverlay');

settingsOverlay.addEventListener('action-click', (e) => {
    // Wenn der Button mit der ID 'closeOverlay' geklickt wurde...
    if (e.detail.actionId === 'closeOverlay') {
        // ...rufe die close()-Methode des Overlays auf.
        settingsOverlay.close();
    }
});

// Das Overlay wie gewohnt öffnen
document.getElementById('openSettingsButton').addEventListener('click', () => {
    settingsOverlay.open();
});

🔁 Schließen:
Klick auf ✖ oben rechts
document.getElementById('settingsOverlay').close();

--

<settings-item>
Ein flexibler Listeneintrag, ideal für Einstellungsseiten. Er kann entweder als klickbarer Navigationslink oder als Container für ein anderes interaktives Element (wie einen Toggle-Schalter) fungieren.

Attribute:

icon="👤": Das Emoji oder Icon, das links angezeigt wird.
label="Text": Die Haupt-Überschrift des Eintrags.
description="Text": Der kleinere Beschreibungstext darunter.
action: Ein optionales Attribut. Wenn es vorhanden ist, wird das gesamte Element klickbar, ein ›-Pfeil wird rechts angezeigt und bei einem Klick wird ein item-click-Event ausgelöst.

Anwendungsfall 1: Als Navigationslink

Das action-Attribut signalisiert, dass dies ein klickbarer Menüpunkt ist, der zu einer anderen Seite oder Ansicht führt.

<settings-item
  id="stammdaten-link"
  icon="👤"
  label="Stammdaten"
  description="Größe, Gewicht, Ernährung & Training"
  action>
</settings-item>

In app.js kannst du auf den Klick lauschen:
document.getElementById('stammdaten-link').addEventListener('item-click', ...)

Anwendungsfall 2: Als Container für ein Steuerelement

Hier wird das action-Attribut weggelassen. Stattdessen wird eine andere Komponente (z.B. <toggle-switch>) in den Standard-Slot eingefügt.

<settings-item
  icon="❤️"
  label="Sex-Tracking anzeigen"
  description="Sexuelle Aktivitäten im Protokoll">

  <toggle-switch name="sex_tracking" checked></toggle-switch>

</settings-item>

--

<modal-dialog>
Eine flexible, modale Dialogbox, die die nativen alert()- und confirm()-Funktionen ersetzt. Sie kann für einfache Benachrichtigungen oder für Bestätigungsabfragen mit zwei Optionen verwendet werden.

Best Practice:
Die Komponente sollte einmal im Body deiner index.php platziert werden. Gesteuert wird sie dann ausschließlich über die globalen Helfer-Funktionen App.alert() und App.confirm() in deinem JavaScript.

Attribute (für die Steuerung per JS):

title: Der Titel des Dialogs.

type: "alert" (nur OK-Button) oder "confirm" (OK- und Abbrechen-Button).

confirm-label: Text für den Bestätigungs-Button (z.B. "Löschen").

cancel-label: Text für den Abbrechen-Button.

Anwendungsfall 1: Eine einfache Warnung anzeigen

So rufst du eine einfache Benachrichtigung auf.

In index.php (einmalig platzieren):

<body>
  <!-- ... rest deiner App ... -->
  <modal-dialog>
    <!-- Der Inhalt wird per JS gefüllt -->
  </modal-dialog>
</body>

In app.js (der empfohlene Weg):

// Ruft die globale Alert-Funktion auf
App.alert("Keine Datensätze für diesen Tag gefunden.", "Hinweis");

Anwendungsfall 2: Eine kritische Aktion bestätigen lassen

Die App.confirm()-Funktion gibt ein Promise zurück. Das Ergebnis ist true, wenn der Benutzer bestätigt, und false, wenn er abbricht.

In app.js (der empfohlene Weg):

async function deleteAccount() {
    const confirmed = await App.confirm(
        "Möchtest du deinen Account wirklich endgültig löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
        "Account löschen?"
    );

    if (confirmed) {
        console.log("Account wird gelöscht...");
        // Führe hier die Logik zum Löschen aus, z.B. einen API-Call
        // await System.call('deleteAccount');
    } else {
        console.log("Löschvorgang abgebrochen.");
    }
}

Einrichtung der App-Helfer-Funktionen

Füge diesen Code am besten am Anfang deiner app.js oder in einer separaten app-helpers.js ein, um die einfachen App.alert() und App.confirm() Befehle global verfügbar zu machen.

const App = {
    _getModal: function() {
        const modal = document.querySelector('modal-dialog');
        if (!modal) console.error('Keine <modal-dialog>-Komponente im DOM gefunden.');
        return modal;
    },

    alert: function(message, title = 'Hinweis') {
        const modal = this._getModal();
        if (!modal) return;
        modal.setAttribute('title', title);
        modal.setAttribute('type', 'alert');
        modal.innerHTML = message;
        modal.open();
    },

    confirm: function(message, title = 'Bitte bestätigen') {
        return new Promise((resolve) => {
            const modal = this._getModal();
            if (!modal) return resolve(false);

            modal.setAttribute('title', title);
            modal.setAttribute('type', 'confirm');
            modal.innerHTML = message;

            const onConfirm = () => {
                cleanup();
                resolve(true);
            };
            const onCancel = () => {
                cleanup();
                resolve(false);
            };
            const cleanup = () => {
                modal.removeEventListener('confirm', onConfirm);
                modal.removeEventListener('cancel', onCancel);
            };

            modal.addEventListener('confirm', onConfirm);
            modal.addEventListener('cancel', onCancel);
            
            modal.open();
        });
    }
};

--

<input-field>
Ein flexibles Eingabefeld für Text oder Zahlen. Wenn type="number" gesetzt ist, werden automatisch Stepper-Pfeile (▲/▼) zur einfachen Werterhöhung oder -verringerung angezeigt.

Attribute:

label: Die sichtbare Beschriftung für das Feld.
name: Der Name des Feldes, der für Formulardaten verwendet wird.
value: Der initiale Wert des Feldes.
type: "text" (Standard) oder "number". Bei "number" werden die Stepper-Buttons aktiviert.
step: Nur bei type="number". Definiert die Schrittweite der Stepper-Buttons (z.B. "1", "0.1", "5").
suffix: Eine optionale Einheit, die rechts neben dem Feld angezeigt wird (z.B. "kg", "cm").

Anwendungsfall 1: Als einfaches Textfeld

Dies ist die Standard-Verwendung für jede Art von Texteingabe.

<input-field 
  label="Name des Trainings" 
  name="training_name" 
  placeholder="z.B. Morgenroutine">
</input-field>

Anwendungsfall 2: Als Zahlenfeld mit Stepper und Einheit

Durch type="number" werden die Pfeile aktiviert. step="0.1" erlaubt die Eingabe von Kommazahlen in 0,1er-Schritten.

<input-field 
  label="Gewicht Morgens" 
  name="gewicht" 
  type="number" 
  step="0.1" 
  value="85.5" 
  suffix="kg">
</input-field>

--

<date-selector>
Eine interaktive Komponente zur Auswahl eines Datums. Der Benutzer kann mit den Pfeil-Buttons tageweise vor- und zurücknavigieren. Zeigt "Heute" und "Gestern" für eine benutzerfreundliche Darstellung an.

Attribute:
value: Der initiale Wert des Datums im YYYY-MM-DD-Format. Wenn nicht gesetzt, startet die Komponente mit dem heutigen Datum.
Events:
date-change: Wird jedes Mal ausgelöst, wenn der Benutzer auf einen der Pfeil-Buttons klickt. Das Event-Detail (e.detail.date) enthält das neue Datum im YYYY-MM-DD-Format.

Anwendungsbeispiel
So wird die Komponente in index.php eingebunden und in app.js mit der Logik verbunden.

In index.php:

<date-selector id="main-date-selector"></date-selector>

In app.js:

document.addEventListener('DOMContentLoaded', () => {
    const dateSelector = document.getElementById('main-date-selector');

    // Funktion, die die Daten für das aktuell ausgewählte Datum lädt
    async function loadDataForSelectedDate() {
        const selectedDate = dateSelector.value;
        console.log(`Lade jetzt Daten für den ${selectedDate}...`);
        
        // Hier würde die Logik stehen, um z.B. das Tagesprotokoll zu laden
        // const data = await DataHelper.getDataForDate(selectedDate);
        // updateUI(data);
    }

    // Auf das 'date-change'-Event der Komponente lauschen
    dateSelector.addEventListener('date-change', (e) => {
        console.log('Das Datum hat sich geändert auf:', e.detail.date);
        loadDataForSelectedDate();
    });

    // Initial die Daten für das Standard-Datum (heute) laden
    loadDataForSelectedDate();
});