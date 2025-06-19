# Template-Struktur

Das vereinfachte Boilerplate sollte folgende Struktur haben:

```
Web-App-Generator/
├── README.md                    # Die neue README
├── LICENSE
├── .gitignore
├── system/                      # Generator-Kern (unverändert)
│   ├── api.php
│   ├── auth.js
│   ├── system.js
│   ├── debug.php
│   ├── generate_codes.php
│   └── setup_tables.php
├── template/                    # Neues Template mit Cache & CSS
│   ├── index.php               # HTML-Oberfläche
│   ├── login.html              # Login/Registrierung
│   ├── app.js                  # App-Logik
│   ├── cache.js                # Cache Manager
│   ├── app-config.json         # Konfiguration
│   ├── .htaccess               # Apache-Config
│   └── css/                    # Styles
│       └── theme.css           # Standard-Theme
└── docs/
    ├── migration-guide.md      # Anleitung für Umstieg
    └── examples/               # Beispiel-Apps
        ├── todo-app/
        ├── expense-tracker/
        └── diary-app/
```

## Was entfällt:

❌ Web Components - keine Custom Elements mehr
❌ `system/loader.php` - wird nicht benötigt
❌ `system/ComponentHelper.js` - entfällt
❌ Alle Component-Definitionen

## Was bleibt/wird hinzugefügt:

✅ `system/` Ordner bleibt komplett unverändert
✅ Einfaches HTML in `index.php`
✅ Vanilla JavaScript in `app.js`
✅ Cache Manager in `cache.js`
✅ Gleiche `app-config.json` Struktur
✅ Neue, klarere Dokumentation

## Migration vom alten System:

1. **HTML anpassen**: Ersetze `<app-header>`, `<section-box>` etc. durch normale HTML-Elemente
2. **IDs vergeben**: Jedes Formular braucht eine ID für `System.collectForm()`
3. **JavaScript umschreiben**: Event-Handler direkt in `app.js` statt in Components
4. **System-Helper nutzen**: Alle `System.*` Funktionen bleiben identisch

## Deployment-Checkliste:

- [ ] Template-Ordner mit allen Dateien kopieren:
  - [ ] index.php
  - [ ] login.html  
  - [ ] app.js
  - [ ] cache.js
  - [ ] app-config.json
  - [ ] .htaccess
  - [ ] css/theme.css
- [ ] `app-config.json` mit DB-Zugangsdaten erstellen
- [ ] Alle Dateien hochladen (außer Config und generate_codes.php)
- [ ] Setup ausführen: `/system/api.php?action=setup`
- [ ] Einladungscodes generieren (falls benötigt)
- [ ] Login testen
- [ ] Debug-Modus in Production deaktivieren