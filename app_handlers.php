<?php
/**
 * =============================
 * app_handlers.php – Die ManTrack-Logik
 * =============================
 * Enthält alle spezifischen Handler-Funktionen nur für diese eine App.
 */

// --- AUTH & USER ---
function handleLogin(BaaSConfig $baas, array $input): void {
	
    $loginIdentifier = $input['email'] ?? '';
    $password = $input['password'] ?? '';

    if (empty($loginIdentifier) || empty($password)) { 
        $baas->sendError('E-Mail/Benutzername und Passwort benötigt'); 
    }

    // --- BRUTE-FORCE-SCHUTZ ---
    $ip = $_SERVER['REMOTE_ADDR'];
    $lockout_time = 15 * 60; // 15 Minuten
    $max_attempts = 5;

    // Alte Fehlversuche löschen
    $stmt = $baas->getDb()->prepare("DELETE FROM login_attempts WHERE attempt_time < DATE_SUB(NOW(), INTERVAL ? SECOND)");
    $stmt->execute([$lockout_time]);

    // Zähler abfragen
    $stmt = $baas->getDb()->prepare("SELECT COUNT(*) as count FROM login_attempts WHERE ip_address = ?");
    $stmt->execute([$ip]);
    if ($stmt->fetchColumn() >= $max_attempts) {
        $baas->sendError("Zu viele Fehlversuche. Bitte warte 15 Minuten.", 429);
    }
    // --- LOGIN-VERSUCH (nur auf users!) ---
    $stmt = $baas->getDb()->prepare("SELECT id, username, email, password_hash FROM users WHERE email = ? OR username = ?");
    $stmt->execute([$loginIdentifier, $loginIdentifier]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        // Erfolgreich: is_pro separat aus user_profiles holen - wenn feld angelegt wurde
		$stmt = $baas->getDb()->prepare("SELECT * FROM user_profiles WHERE user_id = ?");
		$stmt->execute([$user['id']]);
		$profile = $stmt->fetch(PDO::FETCH_ASSOC);

		$is_pro = 0; // Default
		if ($profile && array_key_exists('is_pro', $profile)) {
			$is_pro = (int)$profile['is_pro'];
		}		

        // Fehlversuche für diese IP löschen
        $stmt = $baas->getDb()->prepare("DELETE FROM login_attempts WHERE ip_address = ?");
        $stmt->execute([$ip]);

        session_regenerate_id(true);
        $_SESSION['user_id']    = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['username']   = $user['username'];
        $_SESSION['is_pro']     = $is_pro;

        $baas->sendResponse([
            'success' => true,
            'message' => 'Login successful!',
            'user' => [
                'id'       => $user['id'],
                'username' => $user['username'],
                'email'    => $user['email'],
                'is_pro'   => $is_pro
            ]
        ]);
    } else {
        // Fehlversuch speichern
        $stmt = $baas->getDb()->prepare("INSERT INTO login_attempts (username, ip_address, attempt_time) VALUES (?, ?, NOW())");
        $stmt->execute([$loginIdentifier, $ip]);
        $baas->sendError('Ungültiger Benutzername oder Passwort.', 401);
    }
}
function handleLogout(BaaSConfig $baas): void {
    $_SESSION = [];
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, 
            $params["path"], $params["domain"], 
            $params["secure"], $params["httponly"]
        );
    }
    session_destroy();
    $baas->sendResponse([
        'success' => true, 
        'message' => 'Logout successful.'
    ]);
}
function handleCheckAuth(BaaSConfig $baas): void {
    if (!empty($_SESSION['user_id'])) {
        $userId = $_SESSION['user_id'];
        $isNewUser = false;

        try {
            // users-Tabelle nur für Login-relevantes!
            $stmt = $baas->getDb()->prepare("SELECT username, email, is_new FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();

            if ($user) {
                $_SESSION['username'] = $user['username'];
                $_SESSION['user_email'] = $user['email'];

                // is_pro aus user_profiles holen
                $is_pro = 0;
                $profileStmt = $baas->getDb()->prepare("SELECT is_pro FROM user_profiles WHERE user_id = ?");
                $profileStmt->execute([$userId]);
                $profile = $profileStmt->fetch();
                if ($profile && array_key_exists('is_pro', $profile)) {
                    $is_pro = (int)$profile['is_pro'];
                }
                $_SESSION['is_pro'] = $is_pro;

                if ($user['is_new'] == 1) {
                    $isNewUser = true;
                }
            }
        } catch (PDOException $e) {
            $isNewUser = false;
        }

        $baas->sendResponse([
            'isLoggedIn' => true,
            'user' => [
                'id' => $userId,
                'email' => $_SESSION['user_email'] ?? '',
                'username' => $_SESSION['username'] ?? '',
                'is_new' => $isNewUser,
                'is_pro' => $_SESSION['is_pro'] ?? 0
            ]
        ]);
    } else {
        $baas->sendResponse(['isLoggedIn' => false], 401);
    }
}
function handleRegister(BaaSConfig $baas, array $input) {
    // Dein kompletter, funktionierender handleRegister-Code hier...
}

// --- CRUD & DATEN ---
function handleGetFormData(BaaSConfig $baas, array $input): void {
    if (empty($_SESSION['user_id'])) { 
        $baas->sendError('Not authenticated', 401); 
    }

    $mappingName = $input['mappingName'] ?? null;
    $filter = $input['filter'] ?? []; // Filter ist optional

    if (!$mappingName) { 
        $baas->sendError('mappingName is required'); 
    }

    $tableName = $baas->getMapping($mappingName);
    if (!$tableName) { 
        $baas->sendError("Mapping '$mappingName' not found", 404); 
    }

    // Immer die user_id aus der Session als festen Filter hinzufügen
    $filter['user_id'] = $_SESSION['user_id'];

    $conditions = [];
    foreach (array_keys($filter) as $key) {
        $conditions[] = "`$key` = :$key";
    }

    // Für 'protokolle' absteigend nach Datum sortieren, sonst keine Sortierung
    $orderBy = ($tableName === 'protokolle') ? 'ORDER BY `datum` DESC' : '';
    $sql = "SELECT * FROM `$tableName` WHERE " . implode(' AND ', $conditions) . " $orderBy LIMIT 1";

    try {
        $stmt = $baas->getDb()->prepare($sql);
        $stmt->execute($filter); // PDO kann das Array direkt binden
        $data = $stmt->fetch();

        // Wenn kein Datensatz gefunden wird, ein leeres Objekt statt `false` zurückgeben
        $baas->sendResponse($data ?: new stdClass());
    } catch (PDOException $e) {
        $baas->sendError('Query failed: ' . $e->getMessage(), 500);
    }
}
function handleSaveFormData(BaaSConfig $baas, array $input): void {
    if (empty($_SESSION['user_id'])) { 
        $baas->sendError('Not authenticated', 401); 
    }

    $mappingName = $input['mappingName'] ?? null;
    $data = $input['data'] ?? null;

    if (!$mappingName || !$data) { 
        $baas->sendError('mappingName and data are required'); 
    }

    $tableName = $baas->getMapping($mappingName);
    if (!$tableName) { 
        $baas->sendError("Mapping '$mappingName' not found", 404); 
    }
    
    // WICHTIG: Immer die user_id aus der Session verwenden, um Datenintegrität zu sichern
    $data['user_id'] = $_SESSION['user_id'];
    
    // Leere Strings in NULL umwandeln, um DB-Defaults zu ermöglichen
    foreach ($data as &$value) { 
        if ($value === '') $value = null; 
    }

    // Sicherheitsfilter: Nur Daten zulassen, für die es auch Spalten in der DB gibt
    $schema = $baas->getSchema($tableName);
    $filteredData = array_intersect_key($data, $schema);

    if (empty($filteredData)) { 
        $baas->sendError('No valid fields to save'); 
    }

    // NEUE UPSERT-Logik (INSERT ... ON DUPLICATE KEY UPDATE)
    $fields = array_keys($filteredData);
    $fieldList = '`' . implode('`, `', $fields) . '`';
    $placeholderList = ':' . implode(', :', $fields);
    
    $updateAssignments = [];
    foreach ($fields as $field) {
        // user_id soll beim Update nicht geändert werden
        if ($field === 'user_id') continue; 
        $updateAssignments[] = "`$field` = VALUES(`$field`)";
    }
    $updateList = implode(', ', $updateAssignments);

    $sql = "INSERT INTO `$tableName` ($fieldList) VALUES ($placeholderList)
            ON DUPLICATE KEY UPDATE $updateList";

    try {
        $stmt = $baas->getDb()->prepare($sql);
        $stmt->execute($filteredData);
        
        $baas->sendResponse([
            'success' => true,
            'message' => 'Data saved successfully.',
            'affectedRows' => $stmt->rowCount()
        ]);
    } catch (PDOException $e) {
        $baas->sendError('Save operation failed: ' . $e->getMessage(), 500);
    }
}

function handleSetup(BaaSConfig $baas): void {
    $errors = []; 
    $successCount = 0;
    $db = $baas->getDb();
    $sqlCommands = $baas->getConfig()['tables_sql'] ?? [];

    foreach ($sqlCommands as $sql) {
        try {
            $db->exec($sql);
            $successCount++;
        } catch (PDOException $e) {
            $errors[] = $e->getMessage();
        }
    }
    
    if (empty($errors)) {
        $baas->sendResponse([
            'success' => true, 
            'message' => "Setup successful! $successCount statements processed."
        ]);
    } else {
        $baas->sendError('Setup failed with errors: ' . implode('; ', $errors), 500);
    }
}
/**
 * Lädt eine Historie von Protokolldaten für die Statistik-Kacheln.
 */
function handleGetHistoryData(BaaSConfig $baas, array $input): void {
    if (empty($_SESSION['user_id'])) { $baas->sendError('Not authenticated', 401); }

    $mappingName = $input['mappingName'] ?? 'protokollForm';
    $limit = $input['limit'] ?? 7;
    // NEU: Akzeptiert ein End-Datum, standardmäßig das heutige Datum
    $endDate = $input['endDate'] ?? date('Y-m-d');
    
    $tableName = $baas->getMapping($mappingName);
    if (!$tableName) { $baas->sendError("Mapping '$mappingName' not found", 404); }

    $sql = "SELECT datum, gewicht, schlafqualitaet 
            FROM `$tableName` 
            WHERE user_id = :user_id AND datum <= :endDate
            ORDER BY datum DESC 
            LIMIT :limit";
    
    try {
        $stmt = $baas->getDb()->prepare($sql);
        $stmt->bindValue(':user_id', $_SESSION['user_id'], PDO::PARAM_INT);
        $stmt->bindValue(':endDate', $endDate); 
        $stmt->bindValue(':limit', (int)$limit, PDO::PARAM_INT);
        $stmt->execute();
        $data = $stmt->fetchAll();
        $baas->sendResponse($data);
    } catch (PDOException $e) {
        $baas->sendError('History query failed: ' . $e->getMessage(), 500);
    }
}
/**
 * Generische Funktion zum Abrufen von Tabellendaten mit optionalen Filtern
 */
function handleGetTableData(BaaSConfig $baas, array $input): void {
    if (empty($_SESSION['user_id'])) { 
        $baas->sendError('Not authenticated', 401); 
    }
    
    $mappingName = $input['mappingName'] ?? '';
    $filter = $input['filter'] ?? [];
    
    // Nutze das BaaS-Mapping!
    $tableName = $baas->getMapping($mappingName);
    if (!$tableName) {
        $baas->sendError("Mapping '$mappingName' not found", 404);
    }
    
    // Basis-Query
    $sql = "SELECT * FROM `$tableName` WHERE user_id = :user_id";
    $params = [':user_id' => $_SESSION['user_id']];
    
    // Filter für Zeitraum (wenn days angegeben)
    if (!empty($filter['days'])) {
        $sql .= " AND datum >= DATE_SUB(CURDATE(), INTERVAL :days DAY)";
        $params[':days'] = (int)$filter['days'];
    }
    
    // Sortierung für Tabellen mit Datum
    $sql .= " ORDER BY " . (isset($filter['days']) ? "datum DESC" : "id DESC");
    
    try {
        $stmt = $baas->getDb()->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        $stmt->execute();
        $data = $stmt->fetchAll();
        $baas->sendResponse($data);
    } catch (PDOException $e) {
        $baas->sendError('Query failed: ' . $e->getMessage(), 500);
    }
}
function handleChangePassword(BaaSConfig $baas, array $input): void {
    if (empty($_SESSION['user_id'])) {
        $baas->sendError('Not authenticated', 401);
    }
    
    $newPassword = $input['newPassword'] ?? '';
    
    if (empty($newPassword)) {
        $baas->sendError('Neues Passwort erforderlich');
    }
    
    if (strlen($newPassword) < 6) {
        $baas->sendError('Passwort muss mindestens 6 Zeichen lang sein');
    }
    
    try {
        $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
        
        $stmt = $baas->getDb()->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
        $stmt->execute([$passwordHash, $_SESSION['user_id']]);
        
        $baas->sendResponse([
            'success' => true,
            'message' => 'Passwort erfolgreich geändert'
        ]);
    } catch (PDOException $e) {
        $baas->sendError('Passwortänderung fehlgeschlagen: ' . $e->getMessage());
    }
}
// ======================================================
// Stellt alle relevanten Daten eines Nutzers für eine KI-Analyse bereit.
// Diese Funktion wird von der GPT Action aufgerufen.
// ======================================================
function handleGptDataRequest(BaaSConfig $baas): void {
    // Die Authentifizierung würde hier später über OAuth 2.0 laufen.
    // Fürs Erste verlassen wir uns auf die bestehende Session.
    if (empty($_SESSION['user_id'])) { 
        $baas->sendError('Not authenticated', 401); 
    }
    $userId = $_SESSION['user_id'];
    $db = $baas->getDb();

    try {
        // 1. Lade das User-Profil (Stammdaten)
        $stmtProfile = $db->prepare("SELECT * FROM user_profiles WHERE user_id = ?");
        $stmtProfile->execute([$userId]);
        $profileData = $stmtProfile->fetch(PDO::FETCH_ASSOC);

        // 2. Lade die Protokolldaten der letzten 90 Tage
        $stmtProtokolle = $db->prepare(
            "SELECT * FROM protokolle WHERE user_id = ? AND datum >= DATE_SUB(NOW(), INTERVAL 90 DAY) ORDER BY datum ASC"
        );
        $stmtProtokolle->execute([$userId]);
        $protokolleData = $stmtProtokolle->fetchAll(PDO::FETCH_ASSOC);

        // 3. Kombiniere alles zu einem großen JSON-Objekt
        $baas->sendResponse([
            'user_profile' => $profileData ?: new stdClass(),
            'protokoll_history' => $protokolleData ?: []
        ]);

    } catch (PDOException $e) {
        $baas->sendError('GPT data query failed: ' . $e->getMessage(), 500);
    }
}

// ======================================================
// Löscht einen Benutzer und alle seine zugehörigen Daten sicher in einer Transaktion.
// ======================================================
function handleDeleteAccount(BaaSConfig $baas): void {
    if (empty($_SESSION['user_id'])) { 
        $baas->sendError('Not authenticated', 401); 
    }
    $userId = $_SESSION['user_id'];
    $db = $baas->getDb();

    try {
        // Starte eine Transaktion
        $db->beginTransaction();

        // Schritt 1: Lösche abhängige Daten (Kind-Tabellen zuerst)
        $db->prepare("DELETE FROM protokolle WHERE user_id = ?")->execute([$userId]);
        $db->prepare("DELETE FROM user_profiles WHERE user_id = ?")->execute([$userId]);

        // Lösche auch aus anderen Tabellen, die eine user_id haben (z.B. login_attempts)
        // Hinweis: invitation_codes werden hier nicht gelöscht, da der Code
        // auch nach Löschung des Nutzers als "verbraucht" gelten sollte.

        // Schritt 2: Lösche den Haupt-Benutzerdatensatz
        $db->prepare("DELETE FROM users WHERE id = ?")->execute([$userId]);

        // Wenn alles gut ging, bestätige die Änderungen dauerhaft
        $db->commit();

        // Schritt 3: Zerstöre die Session (logout)
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params["path"], $params["domain"], $params["secure"], $params["httponly"]);
        }
        session_destroy();

        // Sende eine Erfolgsmeldung
        $baas->sendResponse(['success' => true, 'message' => 'Account successfully deleted.']);

    } catch (PDOException $e) {
        // Wenn irgendein Schritt fehlschlägt, mache alles rückgängig
        $db->rollBack();
        $baas->sendError('Account deletion failed: ' . $e->getMessage(), 500);
    }
}
// ======================================================
// Markiert den Willkommens-Status eines Nutzers als "gesehen" (setzt is_new auf 0).
// Wird vom Willkommens-Modal im Frontend aufgerufen.
// ======================================================

function handleMarkWelcomeAsSeen(BaaSConfig $baas): void {
    if (empty($_SESSION['user_id'])) {
        $baas->sendError('Not authenticated', 401);
    }
    try {
        $stmt = $baas->getDb()->prepare("UPDATE users SET is_new = 0 WHERE id = ?");
        $stmt->execute([$_SESSION['user_id']]);
        $baas->sendResponse(['success' => true, 'message' => 'Welcome status updated.']);
    } catch (PDOException $e) {
        $baas->sendError('Could not update welcome flag: ' . $e->getMessage(), 500);
    }
}
// ======================================================
// ACTION-HANDLER FÜR API-TOKEN-VERWALTUNG
// ======================================================

/**
 * Generiert einen neuen, sicheren API-Token für den angemeldeten Nutzer.
 * Ein eventuell vorhandener alter Token wird überschrieben.
 */
function handleGenerateApiToken(BaaSConfig $baas): void {
    if (empty($_SESSION['user_id'])) { 
        $baas->sendError('Nicht angemeldet', 401); 
    }
    $userId = $_SESSION['user_id'];

    // Neuen, sicheren Token erstellen
    $newToken = bin2hex(random_bytes(24)); 
    // Gültigkeit auf 1 Jahr in der Zukunft setzen
    $expiresAt = date('Y-m-d H:i:s', strtotime('+1 year'));

    // UPSERT-Logik: Fügt den neuen Token ein oder aktualisiert den vorhandenen.
    $sql = "INSERT INTO oauth_tokens (user_id, access_token, expires_at) VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE access_token = VALUES(access_token), expires_at = VALUES(expires_at)";
    
    $stmt = $baas->getDb()->prepare($sql);
    $stmt->execute([$userId, $newToken, $expiresAt]);

    // Den neu generierten Token direkt an das Frontend zurückgeben
    $baas->sendResponse(['success' => true, 'token' => $newToken]);
}

/**
 * Löscht (widerruft) den API-Token für den angemeldeten Nutzer.
 */
function handleDeleteApiToken(BaaSConfig $baas): void {
    if (empty($_SESSION['user_id'])) { 
        $baas->sendError('Nicht angemeldet', 401); 
    }
    $userId = $_SESSION['user_id'];

    $stmt = $baas->getDb()->prepare("DELETE FROM oauth_tokens WHERE user_id = ?");
    $stmt->execute([$userId]);

    $baas->sendResponse(['success' => true, 'message' => 'Token wurde erfolgreich widerrufen.']);
}
/**
 * Holt den aktuellen API-Token für den angemeldeten Nutzer.
 */
function handleGetApiToken(BaaSConfig $baas): void {
    if (empty($_SESSION['user_id'])) { 
        $baas->sendError('Nicht angemeldet', 401); 
    }
    $userId = $_SESSION['user_id'];

    try {
        $stmt = $baas->getDb()->prepare("SELECT access_token FROM oauth_tokens WHERE user_id = ? LIMIT 1");
        $stmt->execute([$userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        // Schickt den Token zurück, oder `null` wenn keiner existiert.
        $baas->sendResponse(['token' => $result ? $result['access_token'] : null]);

    } catch (PDOException $e) {
        $baas->sendError('Token-Abfrage fehlgeschlagen: ' . $e->getMessage(), 500);
    }
}