<?php
// register-process.php

// Wir brauchen die Datenbank-Zugangsdaten.
// Du kannst sie entweder direkt hier eintragen oder aus deiner app-config.json lesen.
// Lass uns die app-config.json nutzen, um Redundanz zu vermeiden.
$config = json_decode(file_get_contents('app-config.json'), true);
$dbUrl = parse_url($config['database']);
$host = $dbUrl['host'];
$dbname = ltrim($dbUrl['path'], '/');
$user = $dbUrl['user'];
$pass = $dbUrl['pass'];

// Fehler-Handling
function display_error($message) {
    // Leitet zurück zur Registrierungsseite mit einer Fehlermeldung
    header("Location: register.html?error=" . urlencode($message));
    exit();
}

// Prüfen, ob Daten per POST gesendet wurden
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    display_error("Ungültige Anfrage.");
}

// --- DEINE VALIDIERUNGS-LOGIK (leicht angepasst für POST-Daten) ---

// Pflichtfelder prüfen
$requiredFields = ['username', 'email', 'password', 'password_confirm', 'invitation_code'];
foreach ($requiredFields as $field) {
    if (empty($_POST[$field])) {
        display_error("Feld '$field' fehlt.");
    }
}

// Passwörter vergleichen
if ($_POST['password'] !== $_POST['password_confirm']) {
    display_error("Die Passwörter stimmen nicht überein.");
}

$username = trim($_POST['username']);
$email = trim($_POST['email']);
$password = $_POST['password'];
$invitationCode = trim($_POST['invitation_code']);

// Datenbankverbindung herstellen (diesmal mit mysqli, wie in deinem Beispiel)
$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    display_error("Datenbank-Verbindungsfehler: " . $conn->connect_error);
}
$conn->set_charset('utf8mb4');

// --- DEINE DATENBANK-LOGIK (leicht angepasst für mysqli) ---

// Einladungscode prüfen
$stmt = $conn->prepare("SELECT code, used_by FROM invitation_codes WHERE code = ?");
$stmt->bind_param("s", $invitationCode);
$stmt->execute();
$result = $stmt->get_result();
$codeEntry = $result->fetch_assoc();

if (!$codeEntry) {
    display_error("Ungültiger Einladungscode.");
}
if (!empty($codeEntry['used_by'])) {
    display_error("Einladungscode wurde bereits verwendet.");
}

// Existiert bereits Benutzer mit E-Mail oder Username?
$stmt = $conn->prepare("SELECT id FROM users WHERE email = ? OR username = ?");
$stmt->bind_param("ss", $email, $username);
$stmt->execute();
if ($stmt->get_result()->fetch_assoc()) {
    display_error("Benutzername oder E-Mail existiert bereits.");
}

// Passwort-Hash erzeugen
$hash = password_hash($password, PASSWORD_DEFAULT);

// Nutzer anlegen (mit is_new = 1)
$stmt = $conn->prepare("INSERT INTO users (username, email, password_hash, is_new) VALUES (?, ?, ?, 1)");
$stmt->bind_param("sss", $username, $email, $hash);
$stmt->execute();
$userId = $conn->insert_id;

// Einladungscode als verwendet markieren
$stmt = $conn->prepare("UPDATE invitation_codes SET used_by = ?, used_at = NOW() WHERE code = ?");
$stmt->bind_param("is", $userId, $invitationCode);
$stmt->execute();

$stmt->close();
$conn->close();

// Bei Erfolg zur Login-Seite weiterleiten mit einer Erfolgsmeldung
header("Location: login.html?success=1");
exit();