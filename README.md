#Dynamic PHP BaaS Engine
Ein minimalistischer Backend-as-a-Service (BaaS) Generator für PHP, MySQL und Vanilla JS. Konzentriere dich auf dein Frontend und deine Business-Logik – das Backend wird zur Laufzeit für dich generiert.

Dieses System ist ideal für datengetriebene Single-Page-Applications (SPAs), Prototypen oder interne Tools, bei denen eine schnelle Entwicklung ohne aufwändiges Backend-Setup im Vordergrund steht.

##✨ Das Kernkonzept
Dieses Projekt vereinfacht die Web-Entwicklung radikal, indem es die Notwendigkeit für repetitiven Backend-Code eliminiert. Der Entwicklungsfokus liegt ausschließlich auf zwei Dingen:

Das Frontend (index.php, login.html): Die visuelle Darstellung der App (HTML & CSS).
Die Business-Logik (app.js): Die Interaktivität und die einzigartigen Funktionen der App.
Das gesamte Backend wird durch eine einzige api.php-Datei repräsentiert, die ihre Logik dynamisch aus einer zentralen Konfigurationsdatei (app-config.json) ableitet.

##🛡️ Sicherheits-Features
Das System wurde mit einem starken Fokus auf Sicherheit entwickelt und bringt wichtige Schutzmaßnahmen von Haus aus mit:

Prepared Statements: 100%ige Verwendung von Prepared Statements zum Schutz vor SQL-Injection.
Brute-Force-Schutz: Der Login-Endpunkt ist gegen Brute-Force-Angriffe geschützt. Nach 5 fehlgeschlagenen Versuchen wird die IP-Adresse für 15 Minuten gesperrt.
Sichere Session-Cookies: Cookies werden standardmäßig mit den Flags HttpOnly und SameSite=Lax gesetzt.
Automatische Daten-Trennung (Mandantenfähigkeit): Die save- und load-Funktionen erzwingen serverseitig den Filter nach der user_id des eingeloggten Benutzers. Dies stellt sicher, dass Benutzer ausschließlich auf ihre eigenen Daten zugreifen können.

##🚀 Alle Features im Überblick
Automatisches Backend: Definiere dein Datenmodell in app-config.json und das Backend passt sich an.
Einmaliges Setup: Ein einziger API-Aufruf (?action=setup) initialisiert die komplette Datenbankstruktur.
Dynamische CRUD-Logik: Die save-Funktion erkennt automatisch, ob ein Datensatz neu (INSERT) oder aktualisiert (UPDATE) werden muss.
Umfassende Benutzerverwaltung:
Einladungs-basiertes Registrierungssystem.
Sicherer Login mit "Angemeldet bleiben"-Funktion.
Einfache Frontend-Helfer: Zwei JavaScript-Bibliotheken (system.js, auth.js) für die elegante Kommunikation mit dem Backend und automatisierte Formular-Logik.
Leistungsfähige Datenabfragen: Laden von einzelnen Datensätzen oder ganzen Listen über eine einzige Funktion.
Umfassendes Debugging: Detailliertes Konsolen-Logging und ein mächtiges Debug-Dashboard.

##🛠️ Setup & Administration
Repository klonen: Lade die Dateien auf deinen PHP-fähigen Webserver.
Konfigurieren: Erstelle eine app-config.json (eine Vorlage findest du im Repository) und trage deine Datenbank-Zugangsdaten ein.
Datenbank initialisieren: Rufe die URL /system/api.php?action=setup einmalig auf. Das System erstellt alle Tabellen, die in der Konfiguration unter tables_sql definiert sind.
Einladungscodes erstellen: Nutze das mitgelieferte Skript, um erste Benutzer-Einladungen zu generieren (siehe unten).
Loslegen: Entwickle deine App in index.php und app.js.
Einladungscodes generieren
Das System verwendet ein Einladungssystem für neue Registrierungen. Um Codes zu erstellen, lege eine Datei generate_codes.php im Hauptverzeichnis an und rufe sie einmalig im Browser auf.

```PHP

// generate_codes.php
<?php
$numberOfCodes = 20; // Wie viele Codes sollen generiert werden?

// Lade die Konfiguration, um die DB-Verbindung zu bekommen
$configPath = __DIR__ . '/app-config.json';
if (!file_exists($configPath)) { die('app-config.json nicht gefunden!'); }
$config = json_decode(file_get_contents($configPath), true);

// Stelle eine Verbindung zur Datenbank her
try {
    $dbUrl = parse_url($config['database']);
    $db = new mysqli($dbUrl['host'], $dbUrl['user'], $dbUrl['pass'], ltrim($dbUrl['path'], '/'));
    if ($db->connect_error) { throw new Exception('DB Verbindungsfehler: ' . $db->connect_error); }
} catch (Exception $e) {
    die('Fehler bei der DB-Verbindung: ' . $e->getMessage());
}

// Bereite die SQL-Anweisung vor
$stmt = $db->prepare("INSERT INTO invitation_codes (code) VALUES (?)");
$generatedCodes = [];
for ($i = 0; $i < $numberOfCodes; $i++) {
    $code = bin2hex(random_bytes(16)); // 32-Zeichen String
    $stmt->bind_param("s", $code);
    if ($stmt->execute()) { $generatedCodes[] = $code; }
}
$stmt->close();
$db->close();

echo "<pre>Erfolgreich generierte Codes:\n------------------------------\n";
echo implode("\n", $generatedCodes);
echo "</pre>";
?>
```
Warnung: Lösche oder schütze diese Datei nach der Benutzung, um zu verhindern, dass beliebige Personen neue Codes erstellen können!

##👨‍💻 Frontend-Helfer (system.js & auth.js)
Um die Frontend-Entwicklung zu beschleunigen, bringt das System zwei globale JavaScript-Objekte mit.

Das System-Objekt (system.js)
Dies ist die primäre Schnittstelle zur API für Datenoperationen.

System.checkAuth(): Prüft, ob ein Benutzer eingeloggt ist.
System.logout(): Beendet die aktuelle Session.
System.save(mappingName, dataObject): Speichert einen Datensatz.
System.load(mappingName, whereObject): Lädt Daten. Kann einzelne Datensätze oder ganze Listen abrufen.
```JavaScript

// Beispiel: Lade alle Protokolle der letzten 7 Tage mit EINEM Aufruf
const lastSevenDays = ['2025-06-12', '2025-06-11', ...];
const result = await System.load('dailyForm', { datum: lastSevenDays });
// result.data enthält nun ein Array mit allen passenden Datensätzen`
```
Das Auth-Objekt (auth.js)
Diese Helfer automatisieren Login- und Registrierungs-Formulare.

Auth.handleLogin(formElement): Verarbeitet ein Login-Formular.
Auth.handleRegister(formElement): Verarbeitet ein Registrierungs-Formular inkl. Passwort-Abgleich.
Auth.updateUserDisplay(): Aktualisiert einen Willkommens-Text (z.B. "Moin User!").
Auth.bindForm(formId, successCallback): Die empfohlene Methode! Bindet die Logik automatisch an ein Formular, inkl. Lade-Indikator für den Button und Fehleranzeige.
```JavaScript

// Auf der login.html
// Dies bindet die komplette Login-Logik an das Formular mit der ID "loginForm"
Auth.bindForm('loginForm');

// Auf der register.html
// Nach erfolgreicher Registrierung wird eine Nachricht angezeigt und zur Login-Seite geleitet
Auth.bindForm('registerForm', (result) => {
    alert(result.message);
    window.location.href = 'login.html';
});
```

##🐞 Umfassende Debugging-Werkzeuge
Konsolen-Logging
Aktivieren Sie detailliertes Logging aller API-Anfragen und -Antworten in der Browser-Konsole.

JavaScript

// Am Anfang von app.js aufrufen:
System.enableDebug();

###Das Debug Dashboard (system/debug.php)
Das System enthält ein mächtiges, passwortgeschütztes Dashboard für Entwickler.

###Aktivierung:

*Setze "debug_mode": true in app-config.json.
*Logge dich in deine App ein.
*Rufe die URL /system/debug.php im Browser auf.
*Tipp: Füge einen Screenshot deines Dashboards hier ein! Es ist ein beeindruckendes Feature.

###Das Dashboard zeigt:

*System Status: PHP-Version, App-Name, Session-Details und Datenbank-Status.
*Datenbank-Tabellen: Eine Liste aller Tabellen mit Datensatz-Anzahl, Größe und kompletter Struktur.
*Form-Mappings: Eine Übersicht deiner Mappings aus der Konfiguration mit einer Prüfung, ob die Zieltabelle existiert.
*Aktuelle Session-Daten: Eine Live-Ansicht des $_SESSION-Inhalts.
*Letzte Login-Versuche: Zeigt die letzten 20 fehlgeschlagenen Login-Versuche an.
*Konfigurations-Übersicht: Zeigt deine app-config.json an, wobei sensitive Daten wie Passwörter und API-Keys automatisch zensiert werden.