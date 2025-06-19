# Web-App-Generator

Ein minimalistischer Backend-as-a-Service (BaaS) Generator für PHP, MySQL und Vanilla JavaScript. Entwickle datengetriebene Web-Apps in Minuten - das Backend wird automatisch aus einer JSON-Konfiguration generiert.

## 🚀 Was ist das?

Ein System, das dir die komplette Backend-Entwicklung abnimmt. Du definierst deine Datenstruktur in einer JSON-Datei und schreibst nur noch HTML und JavaScript für deine App-Logik. Der Generator kümmert sich um:

- ✅ **Datenbank-Setup**: Tabellen werden automatisch erstellt
- ✅ **CRUD-API**: Create, Read, Update, Delete - alles automatisch
- ✅ **Authentifizierung**: Login, Registrierung, Sessions
- ✅ **Rechteverwaltung**: Jeder User sieht nur seine Daten
- ✅ **Sicherheit**: Prepared Statements, Session-Schutz, Brute-Force-Protection

## 🎯 Das Mapping-Konzept

Das System verbindet Frontend und Backend durch ein cleveres Mapping:

### 1. Form-ID → Tabelle (in app-config.json)
```json
"form_mappings": {
  "meinFormular": "meine_tabelle",  // Form-ID → Tabellen-Name
  "settingsForm": "user_settings"
}
```

### 2. NAME-Attribute → Datenbank-Spalten
```html
<!-- WICHTIG: name-Attribute = DB-Spaltenname! -->
<form id="meinFormular">
  <input name="titel" type="text">      <!-- → Spalte: titel -->
  <input name="betrag" type="number">   <!-- → Spalte: betrag -->
  <textarea name="notizen"></textarea>  <!-- → Spalte: notizen -->
</form>
```

### 3. Der Datenfluss
```
HTML Form (name="spaltenname")
    ↓
System.collectForm('formId') 
    ↓
JavaScript Object { spaltenname: wert }
    ↓
System.save('formId', data)
    ↓
form_mappings lookup → richtige Tabelle
    ↓
SQL INSERT/UPDATE (user_id automatisch!)
```

## 📁 Projektstruktur

```
meine-app/
├── index.php          # Deine HTML-Oberfläche
├── login.html         # Login/Registrierung
├── app.js            # Deine App-Logik
├── cache.js          # Cache-Manager
├── app-config.json   # Konfiguration
├── css/              # Styles
│   └── theme.css     # Standard-Theme
└── system/           # Generator-Kern
    ├── api.php
    ├── system.js
    ├── auth.js
    └── debug.php
```

## 🏃‍♂️ Schnellstart

### 1. Repository klonen
```bash
git clone https://github.com/ThorstenKunst/Web-App-Generator.git
cd Web-App-Generator
```

### 2. Neue App erstellen
```bash
cp -r template/ meine-app/
cd meine-app/
```

### 3. Datenbank konfigurieren
Bearbeite `app-config.json`:
```json
{
  "app_name": "Meine App",
  "database": "mysql://user:pass@localhost/dbname",
  "tables_sql": [
    "CREATE TABLE IF NOT EXISTS meine_tabelle (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      titel VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )"
  ],
  "form_mappings": {
    "meinFormular": "meine_tabelle"
  }
}
```

### 4. Setup ausführen
```bash
# Browser öffnen
http://localhost/meine-app/system/api.php?action=setup
```

### 5. App entwickeln!

## 🧠 Architekturprinzipien

Die Businesslogik der App befindet sich vollständig in `app.js`. HTML- und PHP-Dateien enthalten **keine eingebettete JavaScript-Logik**. Folgende Prinzipien gelten:

- **Kein Inline-JavaScript im HTML**  
  Alle Interaktionen laufen über Event-Handler in `app.js`.

- **Zentrale Event-Delegation**  
  UI-Aktionen wie Buttons oder Navigation werden über ein zentrales `data-action`-System gesteuert.

- **Formularverarbeitung standardisiert**  
  Eingaben werden über `System.collectForm()` und `System.save()` verarbeitet.

- **Caching über `DataCache`**  
  Lokale Zwischenspeicherung von Daten (RAM + localStorage mit TTL).

→ Die **technische Struktur von `app.js`** ist in der Datei selbst dokumentiert (siehe Kopfkommentar).


### HTML schreiben (index.php)
```html
<!-- index.php: Beispiel für HTML-Struktur -->
<header class="app-header">
  <h1 id="userWelcome">Moin!</h1>
  <button class="btn btn-setting" data-action="settings"></button>
</header>

<main>
  <section class="section-form">
    <h2>Körper & Geist</h2>
    <input type="checkbox" name="morgenerektion" />
    <input type="range" name="libido" />
  </section>
</main>
```
➡️ Siehe `index.php` in /template/boilerplate-index.php

### 📦 JavaScript-Logik (`/app.js`)

Die zentrale Steuerung der Anwendung (Events, Formulare, API-Aufrufe).  
Die Struktur ist im Kopf der Datei dokumentiert.

### Cache Manager (`/cache.js`)

Die App verwendet einen einfachen In-Memory + LocalStorage Cache mit 5 Minuten TTL.

Beispielnutzung:

```javascript
const daten = await cache.get('tagebuch', async () => {
  const result = await System.load('tagebuch');
  return result.data;
});

cache.clear('tagebuch'); // explizit leeren
```
Der Cache wird zentral über new DataCache() im state initialisiert.

## 🛠️ System-Helper API

### Authentifizierung
```javascript
System.checkAuth()          // Prüft Login (leitet um wenn nötig)
System.getUserInfo()        // Gibt User-Daten zurück
System.logout()            // Beendet Session
```

### Daten-Operationen
```javascript
// Formular-Daten sammeln
const data = System.collectForm('formId');

// Speichern (INSERT oder UPDATE)
const result = await System.save('formId', data);

// Laden mit Filtern
const result = await System.load('formId', {
    field: 'value',              // WHERE field = value
    orderBy: 'created_at DESC',  // Sortierung
    limit: 10,                   // Anzahl
    offset: 0                    // Pagination
});

// Löschen
const result = await System.delete('formId', id);

// Formular befüllen
System.fillForm('formId', data);
```

### Utilities
```javascript
System.formatDate(date)           // Datum formatieren
System.formatDate(date, 'YYYY-MM-DD')  // Mit Format
System.storage.set('key', value)  // LocalStorage
System.storage.get('key')         // LocalStorage lesen
System.storage.remove('key')      // LocalStorage löschen
System.enableDebug()              // API-Debug aktivieren
```

## 📋 app-config.json Referenz

```json
{
    "app_name": "App-Titel",
    "debug_mode": true,
    "database": "mysql://user:pass@host/database",
    "tables_sql": [
        "CREATE TABLE IF NOT EXISTS tabelle (...)"
    ],
    "form_mappings": {
        "formId": "tabellenname"
    },
    "auth": {
        "session_lifetime": 86400,
        "max_login_attempts": 5,
        "block_duration": 900
    }
}
```

### Wichtige Regeln:
- **form_mappings**: Verbindet HTML-Formular-IDs mit Datenbank-Tabellen
- **user_id**: Wird automatisch bei INSERT gesetzt
- **Unique Keys**: Nutze `UNIQUE KEY` für Duplikat-Vermeidung

## 🔐 Sicherheit

- ✅ Alle Queries mit Prepared Statements
- ✅ Automatische `user_id` Filterung
- ✅ Session-basierte Authentifizierung
- ✅ Brute-Force-Schutz (5 Versuche, dann 15 Min Sperre)
- ✅ HTTP-Only Cookies mit SameSite=Lax
- ✅ CSRF-Schutz durch Session-Tokens

## 🐛 Debugging

### Debug-Modus aktivieren
```json
// In app-config.json
"debug_mode": true
```

### Debug-Dashboard
Nach Login verfügbar unter: `/system/debug.php`

### Console-Debugging
```javascript
System.enableDebug();  // Aktiviert API-Logs in Console
```

## 🚀 Deployment

### 1. Hosting-Anforderungen
- PHP 7.4+
- MySQL 5.7+
- Apache/Nginx mit .htaccess Support

### 2. Upload
Alle Dateien hochladen **außer**:
- `app-config.json` (direkt auf Server erstellen)
- `generate_codes.php` (nur temporär)
- `.git/` Ordner

### 3. Live-Konfiguration
`app-config.json` auf dem Server erstellen mit echten DB-Zugangsdaten.

### 4. Setup ausführen
```
https://deine-domain.de/system/api.php?action=setup
```

## 🤖 GPT-Integration

Dieses System ist perfekt für die Entwicklung mit KI-Assistenten. Sage einfach:

> "Ich nutze den Web-App-Generator. Erstelle mir eine Todo-App mit Kategorien und Prioritäten."

Der Assistent versteht die Struktur und kann komplette Apps generieren.

## 🎨 Theme anpassen

Das mitgelieferte `css/theme.css` bietet ein modernes, responsives Design mit:
- CSS-Variablen für einfache Anpassungen
- Dark Mode Support
- Responsive Layout
- Utility-Klassen

### Farben ändern:
```css
:root {
    --primary: #007bff;     /* Deine Hauptfarbe */
    --primary-dark: #0056b3;
    --success: #28a745;
    --danger: #dc3545;
}
```

### Eigenes CSS hinzufügen:
Erstelle einfach `css/custom.css` und binde es nach theme.css ein:
```html
<link rel="stylesheet" href="css/theme.css">
<link rel="stylesheet" href="css/custom.css">
```

## 📝 Beispiel-Apps

### Todo-App
```javascript
// Tabelle: todos (id, user_id, titel, erledigt, kategorie, created_at)
// Form-Mapping: "todoForm": "todos"
```

### Ausgaben-Tracker
```javascript
// Tabelle: expenses (id, user_id, datum, betrag, kategorie, beschreibung)
// Form-Mapping: "expenseForm": "expenses"
```

### Gewohnheits-Tracker
```javascript
// Tabelle: habits (id, user_id, datum, gewohnheit, erledigt)
// Form-Mapping: "habitForm": "habits"
```

## ❓ FAQ

**Warum Vanilla JavaScript?**
- Keine Dependencies, keine Build-Tools
- Volle Kontrolle und Transparenz
- Perfekt für kleine bis mittlere Apps

**Kann ich CSS-Frameworks nutzen?**
- Klar! Bootstrap, Tailwind etc. einfach einbinden

**Wie erweitere ich die API?**
- Eigene Endpoints in `system/api.php` ergänzen
- Custom Actions mit `?action=meine_action`

**Mehrere Tabellen pro App?**
- Einfach mehrere `CREATE TABLE` in `tables_sql`
- Verschiedene `form_mappings` definieren

## 📄 Lizenz

MIT License - siehe [LICENSE](LICENSE) Datei

---

💡 **Tipp**: Starte mit dem Template und passe es Schritt für Schritt an!