# Dynamic PHP BaaS Engine

Ein minimalistischer Backend-as-a-Service (BaaS) Generator für PHP, MySQL und Vanilla JS. Entwickle datengetriebene Web-Apps blitzschnell, ohne dich um Backend-Logik kümmern zu müssen.

> 💡 **Hinweis für GPT**: Dieses Projekt ist GPT-kompatibel. GPT soll Web Components, HTML-Formulare und JS-Logik auf Basis von `System.save()` und `System.load()` erzeugen. Kein CSS, keine Frameworks.

---

## ✨ Kernprinzip

Der Generator eliminiert repetitiven Backend-Code. Du konzentrierst dich auf:

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

## 🛠️ Setup (Quickstart)

```bash
# Repo klonen
git clone https://github.com/deinname/app-generator.git

# Neue App starten
cp -r template/ meine-neue-app/
vi app-config.json       # DB-Zugang + Tabellen definieren
open /system/api.php?action=setup
vi index.php             # HTML bauen
vi app.js                # JS-Logik schreiben
```

---

## 🛠️ Installation & Deployment (Von Null zur Live-App)

Folge diesen Schritten, um eine neue App mit dem Generator zu erstellen und live zu schalten.

### Schritt 1: Lokales Projekt erstellen

```bash
# Repository auf deinen Computer klonen
git clone https://github.com/deinname/app-generator.git

# Neue App aus der Vorlage erstellen
cp -r template/ meine-neue-app/
cd meine-neue-app/
```

### Schritt 2: Hosting & Server-Setup

Deine App benötigt einen Webserver mit PHP- und MySQL-Unterstützung.

- **Hoster wählen**: z. B. IONOS, Strato, All-Inkl.de
- **Datenbank anlegen**: im Admin-Panel deines Hosters
- **Dateien hochladen**: alle außer `app-config.json` und `generate_codes.php`
- **Live-Konfiguration**: `app-config.json` direkt auf dem Server erstellen und mit Live-Zugangsdaten füllen

### Schritt 3: Anwendung initialisieren

- **Datenbanktabellen anlegen**:
  `https://deine-live-domain.de/system/api.php?action=setup`
- **Einladungscodes generieren**:
  `generate_codes.php` hochladen, ausführen, danach wieder löschen

### Schritt 4: Weiterentwickeln

```bash
vi index.php      # HTML-Grundgerüst deiner App
vi app.js         # JavaScript-Logik deiner App
```

Lokaler Workflow: Änderungen lokal machen → auf GitHub pushen → auf Live-Server übertragen (FTP oder `git pull`).

---

## Die app-config.json verstehen

Diese Datei ist das Herzstück deiner Anwendung. Eine kommentierte Vorlage findest du direkt im Projekt: `app-config.example.json`

### Die wichtigsten Bereiche:

- **"app_name"**: Der Name deiner App.
- **"debug_mode"**: Aktiviert das Debug-Dashboard (`true` oder `false`).
- **"database"**: Verbindungs-String zu deiner MySQL-Datenbank.
- **"tables_sql"**: Eine Liste deiner `CREATE TABLE`-Statements.
- **"form_mappings"**: Verknüpft `formId`s aus dem Frontend mit DB-Tabellen – damit `System.save()` & `System.load()` wissen, wohin die Daten gehören.

> 🧠 **Tipp**: Verändere nie direkt die produktive `app-config.json` im Repository. Nutze `.gitignore`, um sensible Daten auszuschließen.

---

## 🔐 Sicherheit (automatisch integriert)

- Alle Queries per Prepared Statements
- Brute-Force-Schutz beim Login (5 Fehlversuche = IP-Sperre)
- HTTP-only Cookies, SameSite=Lax
- Datenzugriff strikt auf `user_id` des eingeloggten Nutzers begrenzt

---

## 👤 Benutzerverwaltung per Einladung

Registrierungen erfolgen nur über gültige Einladungscodes.

### Einladungscodes generieren

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

> ⚠️ Die Datei nach Verwendung löschen oder schützen.

---

## 🧹 JavaScript-API (system.js)

```js
System.checkAuth();                         // Session prüfen
System.logout();                            // Abmelden
System.save('formId', datenObjekt);         // Speichern (insert/update)
System.load('formId', filterObjekt);        // Laden (einzeln oder Liste)
System.enableDebug();                       // API-Logging aktivieren
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
Auth.updateUserDisplay();                        // Begrüßung updaten
```

---

## 🧪 Debug-Dashboard aktivieren

1. In `app-config.json`: `"debug_mode": true`
2. Einloggen
3. Im Browser öffnen: `/system/debug.php`

### Zeigt:

- Session-Daten live
- DB-Status & Tabellenstruktur
- Form-Mappings
- Login-Versuche
- API-Log & Fehleranzeige

> 📸 [Hier Screenshot des Dashboards einfügen]

---

## 🧠 Für GPT & dich

Du willst eine neue App bauen?\
Dann brauchst du nur:

- eine definierte Tabelle (in `app-config.json`)
- ein Formular mit entsprechender `id`
- eine JS-Logik mit `System.save()` / `System.load()`

GPT kann dir alles liefern – aus einem Satz.

---

## ✅ Status

- Minimal, stabil, flexibel
- Ideal für Microtools, Prototypen, Daten-Visualisierung, Coaching-Apps
- Kein Framework nötig. Kein CSS. Kein Overhead.

---

**Lizenz:** MIT | © Thorsten Kunz 2025

