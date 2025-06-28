# Web-App-Generator –Modularer Stack

Ein schlankes, modulares Baukastensystem für datengetriebene Web-Apps. Jetzt mit klarer Trennung von API-Motor, Business-Logik und Konfiguration.  
Ideal für eigene Projekte, KI-gestützte Entwicklung und maximale Wartbarkeit.

---

## 🚀 Was ist das?

Ein Generator, der dir alles außer der Business-Logik abnimmt:

- **Automatisiertes Datenbank-Setup** per JSON-Definition
- **Generische CRUD-API**: Create, Read, Update, Delete für beliebige Tabellen
- **Sichere Authentifizierung** (Login, Registrierung, Session)
- **Modulare, leicht erweiterbare Architektur**
- **Frontend und Backend klar getrennt:**  
  Keine Logik im HTML, keine UI im Backend.

---

## 🏗️ Architektur & Datei-Struktur

```text
my-app/
│
├── index.php           # Deine HTML-Oberfläche
├── login.html          # Login-Page
├── app.js              # Deine App-Logik (nur Frontend!)
├── theme.css
├── app-config.json     # Deine DB- und Mapping-Konfiguration
│   api.php             # (1) API-Motor/Dispatcher –nur Routing!
│   BaaSConfig.php      # (2) Gehirn: DB-Verbindung & Settings
│   app_handlers.php    # (3) Business-Logik: alle Handler-Funktionen
└── ...
````

* **Frontend: index.php, login.html, app.js
* **Backend: api.php, BaaSConfig.php, app_handlers.php

---

## 🧠 **Architekturprinzipien**

* **Motor-Logik:**
  `system/api.php` ist ein minimaler Dispatcher. Er nimmt Anfragen entgegen, prüft Auth, und ruft passende Handler auf.
* **Konfig & DB:**
  `system/BaaSConfig.php` kapselt alle DB- und Konfig-Zugriffe (Singleton-Prinzip, einfache Anbindung).
* **Business-Logik:**
  `system/app_handlers.php` enthält alle Handler-Funktionen (z.B. handleLogin, handleSaveFormData, handleGetApiToken…).
* **Frontend-Logik:**
  In `app.js` –UI, EventListener, Rendering, Aufrufe an die API, keine Backend-Logik.
* **Alles andere (CRUD, Auth, Rechte)**:
  Wird automatisch generiert oder über Helper in Handlern geregelt.

---

## 🎯 Datenfluss

```
UI (HTML/JS) → API-Call an system/api.php → Handler in app_handlers.php → DB (BaaSConfig.php)
```

* **API-Requests:** Immer über fetch/AJAX, nie klassisch per Form-Submit.
* **Antwort immer JSON:** Einheitlich, z.B. `{ success: true, data: {...} }` oder `{ isLoggedIn: true, user: {...} }`

---

## 🏃♂️ Schnellstart

1. **Klonen**

   ```bash
   git clone https://github.com/ThorstenKunst/Web-App-Generator.git
   cd Web-App-Generator
   ```
2. **Kopieren & konfigurieren**

   ```bash
   cp -r template/ my-app/
   cd my-app/
   ```
3. **Datenbank & Mapping einstellen**
   Bearbeite `app-config.json`
4. **Setup im Browser aufrufen**

   ```
   http://localhost/my-app/system/api.php?action=setup
   ```
5. **App bauen:**  
   - HTML-Frontend (index.php, login.html, etc.)
   - JavaScript/App-Logik (app.js)
   - **Deine individuellen Endpunkte und Features in app_handlers.php**

---

## 🔧 Die 3 Kern-Dateien

### 1. `system/api.php` (Dispatcher/Motor)

* Keine Logik, nur Routing.
* Prüft Auth, ruft Handler in `app_handlers.php` auf.
* Immer wiederverwendbar für neue Projekte.

### 2. `system/BaaSConfig.php` (Gehirn)

* Singleton-Klasse für DB-Verbindung, Settings, Helper.
* Kapselt alle direkten DB/Config-Aufrufe.

### 3. `system/app_handlers.php` (Business-Logik)

* Enthält **alle** Handler-Funktionen für Aktionen wie login, logout, checkAuth, saveFormData etc.
* **Hier passiert alles, was individuell ist!**
* Klar nach Aktionen strukturiert: `function handleLogin(...)`, `function handleSaveFormData(...)` usw.

---

## 📝 Beispiel: Neue Action ergänzen

1. Schreibe eine Funktion in `app_handlers.php`:

   ```php
   function handleGetProfile(BaaSConfig $baas, array $input) {
       // ...Logik...
   }
   ```
2. Sende einen API-Call im Frontend:

   ```js
   const profile = await System.call('getProfile');
   ```

---

## 🛠️ System-Helper API

### Authentifizierung

```js
System.checkAuth()        // Prüft Login (leitet um, wenn nötig)
System.logout()           // Beendet Session
```

### Daten-Operationen

```js
System.save('formId', data)    // Speichern
System.load('formId', filter)  // Laden mit Filter/Sortierung
System.delete('formId', id)    // Löschen
System.fillForm('formId', data) // Formular befüllen
```

### Utilities

```js
System.formatDate(date, 'YYYY-MM-DD')
System.storage.set('key', value)
System.enableDebug()
```

---

## 🧩 Beispiel für ein app\_handlers.php-Snippet

```php
<?php
// system/app_handlers.php

function handleLogin(BaaSConfig $baas, array $input) { /* ... */ }
function handleLogout(BaaSConfig $baas, array $input) { /* ... */ }
function handleCheckAuth(BaaSConfig $baas, array $input) { /* ... */ }
function handleSaveFormData(BaaSConfig $baas, array $input) { /* ... */ }
function handleGetHistoryData(BaaSConfig $baas, array $input) { /* ... */ }
// ...usw.
?>
```

---

## 📋 app-config.json Referenz

**(wie gehabt, jetzt noch klarer dokumentiert)**

---

## 🔐 Sicherheit

* Prepared Statements überall
* user\_id-Filter immer serverseitig
* Session-Auth, Brute-Force-Protection
* Debug-Modus abschaltbar

---

## 🚀 FAQ

* **Wie baue ich eine neue App?**

  1. Verzeichnis kopieren
  2. app-config.json anpassen
  3. `system/app_handlers.php` neu schreiben
  4. `index.php` + `app.js` bauen

* **Wie erweitere ich die API?**
  Einfach neue Handler-Funktion in `app_handlers.php` schreiben!

* **Kann ich React/Vue als Frontend nehmen?**
  Ja –das Backend bleibt identisch!

---

## 📄 Lizenz

MIT License

---

💡 **Tipp:**
Starte mit dem Template, halte das Backend minimal – alles, was speziell ist, kommt in `app_handlers.php`.
**So bleibst du schnell, flexibel und jederzeit „KI-ready“!**

```

---

**Feedback, Anpassungen oder spezielle Wünsche? Sag einfach Bescheid!**  
**Das ist jetzt eine zukunftssichere, KI-kompatible und menschlich wartbare Stack-Struktur.**
```
