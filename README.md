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

## 💻 Entwicklung

### HTML schreiben (index.php)
```html
<!DOCTYPE html>
<html>
<head>
    <title>Meine App</title>
    <link rel="stylesheet" href="css/theme.css">
</head>
<body>
    <header>
        <div class="container">
            <h1>Dashboard</h1>
            <div class="user-info">
                <span id="userDisplay"></span>
                <button onclick="System.logout()" class="btn btn-sm">Logout</button>
            </div>
        </div>
    </header>
    
    <main>
        <div class="container">
            <section>
                <h2>Neuer Eintrag</h2>
                <form id="meinFormular">
                    <input type="text" name="titel" required>
                    <textarea name="beschreibung"></textarea>
                    <button type="submit">Speichern</button>
                </form>
            </section>
            
            <section>
                <h2>Daten</h2>
                <div id="datenAnzeige" class="data-list"></div>
            </section>
        </div>
    </main>
    
    <!-- System-Scripts einbinden -->
    <script src="/system/system.js"></script>
    <script src="/system/auth.js"></script>
    <script src="cache.js"></script>
    <script src="app.js"></script>
</body>
</html>
```

### JavaScript schreiben (app.js)
```javascript
// Cache initialisieren
const cache = new DataCache();

document.addEventListener('DOMContentLoaded', async () => {
    // Auth prüfen
    await System.checkAuth();
    
    // Formular-Handler
    document.getElementById('meinFormular').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Daten sammeln
        const data = System.collectForm('meinFormular');
        
        // Speichern (INSERT oder UPDATE automatisch)
        const result = await System.save('meinFormular', data);
        
        if (result.success) {
            alert('Gespeichert!');
            cache.clear('meine-daten'); // Cache leeren
            await loadData();
        }
    });
    
    // Daten laden
    async function loadData() {
        // Mit Cache
        const data = await cache.get('meine-daten', async () => {
            const result = await System.load('meinFormular', {
                orderBy: 'created_at DESC'
            });
            return result.data;
        });
        
        displayData(data);
    }
    
    // Daten anzeigen
    function displayData(data) {
        document.getElementById('datenAnzeige').innerHTML = 
            data.map(item => `
                <div>
                    <h3>${item.titel}</h3>
                    <p>${item.beschreibung || ''}</p>
                    <button onclick="editItem(${item.id})">Bearbeiten</button>
                </div>
            `).join('');
    }
    
    // Initial laden
    loadData();
});
```

### Cache Manager (cache.js)
```javascript
class DataCache {
    constructor() {
        this.memory = {};
        this.ttl = 5 * 60 * 1000; // 5 Minuten
    }
    
    async get(key, loader) {
        // Memory Cache prüfen
        const cached = this.memory[key];
        if (cached && Date.now() - cached.timestamp < this.ttl) {
            return cached.data;
        }
        
        // LocalStorage Cache prüfen
        const stored = System.storage.get(`cache_${key}`);
        if (stored && Date.now() - stored.timestamp < this.ttl) {
            this.memory[key] = stored; // In Memory laden
            return stored.data;
        }
        
        // Neu laden
        const fresh = await loader();
        const cacheEntry = {
            data: fresh,
            timestamp: Date.now()
        };
        
        // Beide Caches aktualisieren
        this.memory[key] = cacheEntry;
        System.storage.set(`cache_${key}`, cacheEntry);
        
        return fresh;
    }
    
    clear(key) {
        if (key) {
            delete this.memory[key];
            System.storage.remove(`cache_${key}`);
        } else {
            // Alles leeren
            this.memory = {};
            // LocalStorage Cache leeren
            Object.keys(localStorage)
                .filter(k => k.startsWith('cache_'))
                .forEach(k => localStorage.removeItem(k));
        }
    }
}
```

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