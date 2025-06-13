# Dynamic PHP BaaS Engine

Ein minimalistischer Backend-as-a-Service (BaaS) Generator für PHP, MySQL und Vanilla JS. Entwickle datengetriebene Web-Apps blitzschnell, ohne dich um Backend-Logik kümmern zu müssen.

> 🤖 **Hinweis für GPT-Systeme:** Dieses Repository ist vollständig GPT-kompatibel. GPTs können damit eigenständig Web Components, HTML-Formulare und JS-Logik erzeugen – basierend auf `app-config.json`, `System.save()` und `System.load()`. Kein CSS, keine Frameworks, kein Overhead.

---

## 🤖 Entwicklungs-Assistent (GPT)

Um die Entwicklung mit diesem Generator weiter zu beschleunigen, gibt es einen spezialisierten GPT-Assistenten, der vollständig auf das deklarative Baukastensystem trainiert ist.

Er hilft dir dabei:
- neue Features zu entwickeln,
- Datenstrukturen in `app-config.json` korrekt zu definieren,
- und die passende Logik in `app.js` umzusetzen.

➡️ [Zur vollständigen GPT-Anleitung](https://github.com/ThorstenKunst/Web-App-Generator/tree/main/docs/gpt-instructions.md)

---

## ✨ Kernprinzip

Der Generator eliminiert repetitiven Backend-Code. Du (oder ein GPT) konzentrierst dich auf:

- `index.php`, `login.html`: Visuelle Darstellung (HTML)
- `app.js`: Interaktivität und Business-Logik

Das Backend wird automatisch zur Laufzeit über `api.php` und `app-config.json` generiert.

---

## 🚀 Features im Überblick

- ✅ **Backend-Automatisierung**: Datenmodell in `app-config.json` definieren, Setup ausführen – fertig.
- ✅ **Dynamische CRUD-Logik**: `System.save()` erkennt automatisch INSERT oder UPDATE.
- ✅ **Benutzerverwaltung**: Login, Einladungssystem, Session-Handling.
- ✅ **Frontend-Helfer**: `system.js` und `auth.js` erleichtern die Anbindung an die API.
- ✅ **Mandantenfähig**: Daten werden automatisch auf `user_id` gefiltert.
- ✅ **Sicher & wartbar**: Prepared Statements, Brute-Force-Schutz, sichere Cookies.
- ✅ **Debug-Modus**: Umfangreiche Konsolenlogs & Dev-Dashboard.

---

## 💪 Setup (Quickstart)

```bash
# Repo klonen
git clone https://github.com/ThorstenKunst/Web-App-Generator.git

# Neue App starten
cp -r template/ meine-neue-app/
vi app-config.json       # DB-Zugang + Tabellen definieren
open /system/api.php?action=setup
vi index.php             # HTML bauen
vi app.js                # JS-Logik schreiben
```

---

## 🛠️ Installation & Deployment (Von Null zur Live-App)

### Schritt 1: Lokales Projekt erstellen

```bash
# Repository auf deinen Computer klonen
git clone https://github.com/ThorstenKunst/Web-App-Generator.git

# Neue App aus der Vorlage erstellen
cp -r template/ meine-neue-app/
cd meine-neue-app/
```

### Schritt 2: Hosting & Server-Setup

- **Webserver mit PHP/MySQL**: z. B. IONOS, Strato, All-Inkl.de
- **Datenbank anlegen**: im Hoster-Panel
- **Dateien hochladen**: alle außer `app-config.json` und `generate_codes.php`
- **Live-Konfiguration**: `app-config.json` direkt auf dem Server mit Zugangsdaten füllen

### Schritt 3: Anwendung initialisieren

- Setup aufrufen:  `https://deine-domain.de/system/api.php?action=setup`
- Einladungscodes erzeugen: `generate_codes.php` hochladen, ausführen, dann löschen

### Schritt 4: Weiterentwickeln
Die Hauptarbeit findet in index.php und app.js statt.

index.php (Die Struktur)
Hier baust du deine Benutzeroberfläche deklarativ mit den vordefinierten Web Components zusammen. Damit die Komponenten funktionieren, müssen sie über den automatischen loader.php eingebunden werden.
```php
<!-- beispiel.index.php -->
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Meine App</title>
</head>
<body>
    <app-header title="Dashboard"></app-header>
    <main>
        <section-box title="Tagesprotokoll">
            <input-field label="Gewicht" name="gewicht"></input-field>
        </section-box>
    </main>

    <!--
      WICHTIG: Die Ladereihenfolge ist entscheidend!
      1. Komponenten laden (damit die Tags im HTML bekannt sind)
      2. System-Bibliothek laden
      3. Eigene App-Logik laden (die auf alles zugreift)
    -->
    <?php include __DIR__ . '/system/loader.php'; ?>
    <script src="/system/system.js"></script>
    <script src="app.js"></script>
</body>
</html>
```

app.js (Die Logik)
Hier schreibst du die JavaScript-Logik, die die Komponenten mit Leben füllt.
```JS
document.addEventListener('DOMContentLoaded', () => {
    // Logik hier...
});
```
---

## 🚀 Best Practices: Datenzugriff effizient gestalten

Statt in jeder Web Component direkt `System.load()` aufzurufen, verwende eine zentrale DataHelper-Klasse, um häufig genutzte Daten (z. B. Profil, heutige Einträge) nur **einmalig** zu laden und lokal zwischenzuspeichern.

### Vorteile:

- Weniger API-Calls
- Mehr Performance
- Saubere Komponenten

### Beispiel: Globale DataManager-Klasse

```js
class DataManager {
    constructor() {
        this.userProfile = null;
    }

    async getProfile() {
        if (this.userProfile === null) {
            const result = await System.load('userProfileForm', {});
            this.userProfile = (result.success && result.data.length > 0) ? result.data[0] : {};
        }
        return this.userProfile;
    }

    async saveProfile(data) {
        const result = await System.save('userProfileForm', data);
        if (result.success) {
            this.userProfile = { ...this.userProfile, ...data, id: result.id };
        }
        return result;
    }
}

const DataHelper = new DataManager();
```

### Verwendung in Web Components

```js
class ProfileEditor extends HTMLElement {
    async connectedCallback() {
        const profile = await DataHelper.getProfile();
        this.render(profile);
    }

    render(profile) {
        this.innerHTML = `<h3>Profil bearbeiten</h3><p>Körpergröße: ${profile.koerpergroesse_cm || 'k.A.'}</p>`;
    }
}
customElements.define('profile-editor', ProfileEditor);
```

---

## 🧠 app-config.json im Detail

Zentrale Konfigurationsdatei – steuert Datenbank, Formulare, Auth.

### Wichtige Felder:

- **"app_name"**: App-Titel
- **"debug_mode"**: Debug-Interface aktivieren (`true/false`)
- **"database"**: Verbindungsdaten zur MySQL-DB
- **"tables_sql"**: Liste von `CREATE TABLE`-Statements
- **"form_mappings"**: Verknüpft Formulare mit DB-Tabellen (für `System.save()` / `System.load()`)

> 🛡️ Konfigurationsdateien mit Zugangsdaten sollten nie ins Repo – via `.gitignore` ausschließen!

---

## 🔐 Sicherheit (automatisch integriert)

- Alle Queries via Prepared Statements
- Login-Schutz nach 5 Fehlversuchen (IP-Block)
- Cookies: HTTP-only, SameSite=Lax
- Zugriff immer auf `user_id` beschränkt

---

## 👤 Benutzerverwaltung per Einladung

```php
// generate_codes.php
<?php
$numberOfCodes = 20;
$config = json_decode(file_get_contents('app-config.json'), true);
$dbUrl = parse_url($config['database']);
$db = new mysqli($dbUrl['host'], $dbUrl['user'], $dbUrl['pass'], ltrim($dbUrl['path'], '/'));
$stmt = $db->prepare("INSERT INTO invitation_codes (code) VALUES (?)");
for ($i = 0; $i < $numberOfCodes; $i++) {
    $code = bin2hex(random_bytes(16));
    $stmt->bind_param("s", $code);
    $stmt->execute();
}
$stmt->close();
$db->close();
?>
```

> Nach Nutzung löschen oder absichern

---

## 📦 JavaScript-API (system.js)

```js
System.checkAuth();                         // Prüft Login-Status
System.logout();                            // Beendet Session
System.save('formId', datenObjekt);         // Insert/Update
System.load('formId', filterObjekt);        // Einträge laden
System.enableDebug();                       // API-Debug aktivieren
```

### Beispiel:

```js
const result = await System.load('dailyForm', { datum: '2025-06-13' });
console.log(result.data);
```

---

## 🔐 Auth-Logik (auth.js)

```js
Auth.bindForm('loginForm');                      // Login binden
Auth.bindForm('registerForm', (res) => {
  alert(res.message);
  window.location.href = 'login.html';
});
Auth.updateUserDisplay();                        // Begrüßung aktualisieren
```

---

## 🧪 Debug-Dashboard

- `"debug_mode": true` in `app-config.json`
- Einloggen, dann `/system/debug.php` öffnen

### Zeigt:

- Session-Daten, Tabellenstruktur
- Form-Mappings
- Login-Versuche, API-Log, Fehler

> 🖼️ (Platzhalter für Screenshot oder GIF)

---

## 🤖 GPT-Use: App bauen in 3 Schritten

1. Tabelle in `app-config.json` definieren
2. HTML-Formular mit passender `id` schreiben
3. JavaScript mit `System.save()` und `System.load()` schreiben

👉 GPT kann all das automatisiert erstellen – nutze dieses Repo als Engine.

---

## ✅ Status

- Minimalistisch, stabil, offen
- Ideal für Tools, Coaching-Apps, Dashboards
- Kein CSS, kein Framework, kein Ballast

---

**Lizenz:** MIT | © Thorsten Kunz 2025

