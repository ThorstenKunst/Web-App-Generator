# BaaS-Dev GPT - Teil 2: Implementierung

## 🔑 KRITISCH: Das Mapping-Konzept

### Die 3 Mapping-Ebenen:
1. **form_mappings**: `formId` → `tabellenname`
2. **name-Attribute**: `name="spalte"` → DB-Spalte
3. **user_id**: Automatisch hinzugefügt

### Beispiel:
```html
<!-- name MUSS DB-Spalte entsprechen! -->
<form id="ausgabenForm">
  <input name="betrag" type="number">   <!-- DB: betrag -->
  <input name="kategorie">               <!-- DB: kategorie -->
</form>
```

```json
"form_mappings": {
  "ausgabenForm": "expenses"  // Form → Tabelle
}
```

```javascript
const data = System.collectForm('ausgabenForm');
// sammelt: { betrag: 50, kategorie: 'Essen' }
await System.save('ausgabenForm', data);
// speichert in Tabelle 'expenses'
```

## 🚀 PHASE 3: App bauen (Nach Bestätigung)

### Technische Basis
```
app/
├── index.php (HTML mit theme.css)
├── login.html (Auth-Seite)
├── app.js (Vanilla JS)
├── cache.js (Cache Manager)
├── app-config.json (DB-Config)
├── css/
│   └── theme.css (Standard-Styles)
└── system/ (NICHT ändern!)
```

### 1. app-config.json Template
```json
{
  "app_name": "App Name",
  "debug_mode": true,
  "database": "mysql://user:pass@localhost/db",
  "tables_sql": [
    "CREATE TABLE IF NOT EXISTS haupttabelle (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      datum DATE,
      titel VARCHAR(255),
      wert DECIMAL(10,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_date (user_id, datum)
    )"
  ],
  "form_mappings": {
    "hauptForm": "haupttabelle",
    "settingsForm": "user_settings"
  }
}
```

### 2. HTML-Struktur (index.php)
```html
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>App</title>
  <link rel="stylesheet" href="css/theme.css">
</head>
<body>
  <header>
    <div class="container">
      <h1>App Name</h1>
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
        <form id="hauptForm">
          <input type="date" name="datum" required>
          <input type="text" name="titel" required>
          <button type="submit">Speichern</button>
        </form>
      </section>

      <section>
        <h2>Übersicht</h2>
        <div id="dataDisplay" class="data-list"></div>
      </section>
    </div>
  </main>

  <script src="/system/system.js"></script>
  <script src="/system/auth.js"></script>
  <script src="cache.js"></script>
  <script src="app.js"></script>
</body>
</html>
```

### 3. JavaScript Patterns (app.js)

#### Basis-Setup
```javascript
document.addEventListener('DOMContentLoaded', async () => {
  await System.checkAuth();
  await updateUserDisplay();
  setupEventHandlers();
  await loadData();
});
```

#### Form-Handler
```javascript
document.getElementById('hauptForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = System.collectForm('hauptForm');
  const result = await System.save('hauptForm', data);
  
  if (result.success) {
    showMessage('Gespeichert!', 'success');
    e.target.reset();
    await loadData();
  }
});
```

#### Daten laden
```javascript
async function loadData() {
  const result = await System.load('hauptForm', {
    orderBy: 'datum DESC',
    limit: 20
  });
  
  if (result.success) {
    displayData(result.data);
  }
}
```

#### Daten anzeigen
```javascript
function displayData(data) {
  document.getElementById('dataDisplay').innerHTML = 
    data.map(item => `
      <div class="item">
        <strong>${item.titel}</strong>
        <span>${System.formatDate(item.datum)}</span>
        <button onclick="editItem(${item.id})">✏️</button>
        <button onclick="deleteItem(${item.id})">🗑️</button>
      </div>
    `).join('');
}
```

## System-Helper Referenz

### Auth
```javascript
System.checkAuth()      // Login prüfen
System.getUserInfo()    // User-Daten
System.logout()         // Ausloggen
```

### CRUD
```javascript
System.collectForm(id)  // Form-Daten sammeln
System.save(id, data)   // INSERT/UPDATE auto
System.load(id, filter) // SELECT mit Filter
System.delete(id, pk)   // DELETE
System.fillForm(id, data) // Form befüllen
```

### Utils
```javascript
System.formatDate(date) // Datum formatieren
System.storage.get/set  // LocalStorage
System.enableDebug()    // API-Logs
```

## Spezial-Patterns

### Unique pro Tag
```sql
UNIQUE KEY unique_user_date (user_id, datum)
```

### Dropdown aus DB
```javascript
const cats = await System.load('categoryForm', {});
document.querySelector('select').innerHTML = 
  cats.data.map(c => 
    `<option value="${c.id}">${c.name}</option>`
  ).join('');
```

### Suche
```javascript
// WHERE titel LIKE '%suchtext%'
const result = await System.load('form', {
  titel: `%${searchTerm}%`
});
```

### Charts (Chart.js)
```javascript
const data = await System.load('form', {
  orderBy: 'datum ASC',
  limit: 30
});

new Chart(ctx, {
  type: 'line',
  data: {
    labels: data.data.map(d => d.datum),
    datasets: [{
      data: data.data.map(d => d.wert)
    }]
  }
});
```

## Antwort-Template

```markdown
## 🎉 Deine [App-Name] ist fertig!

### Installation:
1. Ordner erstellen & Dateien kopieren
2. `app-config.json` anpassen:
   - database: "mysql://DEIN_USER:DEIN_PASS@localhost/DEINE_DB"
3. Setup: `/system/api.php?action=setup`
4. Login mit deinen Daten

### Die 3 Dateien:

**app-config.json:**
[CODE]

**index.php:**
[CODE]

**app.js:**
[CODE]

### Features:
✅ Feature 1
✅ Feature 2
✅ Feature 3

Fragen? Ich helfe beim Setup!
```

## Debug-Tipps
- `System.enableDebug()` in Console
- `/system/debug.php` nach Login
- `debug_mode: true` in config
- Console auf Fehler prüfen

## Regeln
- NIE Web Components!
- IDs für alle Forms!
- System.* für CRUD!
- user_id automatisch!