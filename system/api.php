<?php
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => $_SERVER['HTTP_HOST'],
    'secure' => isset($_SERVER['HTTPS']),
    'httponly' => true,
    'samesite' => 'Lax'
]);
session_start();

// --- 1. Grundeinstellungen & Fehler-Reporting ---
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

// --- 2. Konfiguration & Datenbankverbindung ---
$configPath = __DIR__ . '/../app-config.json';
if (!file_exists($configPath)) { die(json_encode(['success' => false, 'message' => 'app-config.json nicht gefunden!'])); }
$config = json_decode(file_get_contents($configPath), true);
if (json_last_error() !== JSON_ERROR_NONE) { die(json_encode(['success' => false, 'message' => 'Fehler in app-config.json: ' . json_last_error_msg()])); }

try {
    $dbUrl = parse_url($config['database']);
    $db = new mysqli($dbUrl['host'], $dbUrl['user'], $dbUrl['pass'], ltrim($dbUrl['path'], '/'));
    if ($db->connect_error) { throw new Exception('DB Verbindungsfehler: ' . $db->connect_error); }
    $db->set_charset('utf8mb4');
} catch (Exception $e) { die(json_encode(['success' => false, 'message' => $e->getMessage()])); }

// --- 3. Action-Router ---
$action = $_GET['action'] ?? 'status';
switch ($action) {
	case 'register': runRegisterAction($config, $db); break;	
    case 'login': runLoginAction($config, $db); break;
    case 'logout': runLogoutAction(); break;
    case 'checkAuth': runCheckAuth(); break;
    case 'load': runLoadAction($config, $db); break;
    case 'save': runSaveAction($config, $db); break;
	case 'setup': runSetupAction($config, $db); break;
    default: echo json_encode(['success' => true, 'message' => 'API bereit.']); break;
}

// --- 4. System-Funktionen ---

function runLoginAction($config, $db) {
    $input = json_decode(file_get_contents('php://input'), true);
    $formData = $input['formData'] ?? [];
    
    // ========== BRUTE-FORCE-SCHUTZ START ==========
    $ip = $_SERVER['REMOTE_ADDR'];
    $username = $formData['username'] ?? '';
    $lockout_time = 15 * 60; $max_attempts = 5; $attempt_window = 15 * 60;
    
    $stmt_del = $db->prepare("DELETE FROM login_attempts WHERE attempt_time < DATE_SUB(NOW(), INTERVAL ? SECOND)");
    $stmt_del->bind_param("i", $attempt_window);
    $stmt_del->execute();
    
	$stmt_check = $db->prepare("SELECT COUNT(*) FROM login_attempts WHERE ip_address = ? AND attempt_time > NOW() - INTERVAL ? SECOND");
    $stmt_check->bind_param("si", $ip, $lockout_time);
    $stmt_check->execute();
    $stmt_check->bind_result($recent_attempts);
    $stmt_check->fetch();
    $stmt_check->close();
    
    if ($recent_attempts >= $max_attempts) {
        die(json_encode(['success' => false, 'message' => "Zu viele fehlgeschlagene Versuche. Bitte warte 15 Minuten."]));
    }
    // ========== BRUTE-FORCE-SCHUTZ ENDE ==========
    
    if (empty($formData['username']) || empty($formData['password'])) {
        die(json_encode(['success' => false, 'message' => 'Benutzername oder Passwort fehlt.']));
    }
    
    $tableName = $config['form_mappings']['loginForm'] ?? 'users';
    $stmt = $db->prepare("SELECT id, username, password_hash FROM `$tableName` WHERE username = ?");
    $stmt->bind_param("s", $formData['username']);
    $stmt->execute();
    $stmt->store_result();
    
    if ($stmt->num_rows === 1) {
        $stmt->bind_result($id, $username, $password_hash);
        $stmt->fetch();
        
        if (password_verify($formData['password'], $password_hash)) {
            $stmt_del_ip = $db->prepare("DELETE FROM login_attempts WHERE ip_address = ?");
            $stmt_del_ip->bind_param("s", $ip);
            $stmt_del_ip->execute();
            
            $_SESSION['user_id'] = $id;
            $_SESSION['username'] = $username;
            
            if (!empty($formData['remember']) && $formData['remember'] === 'true') {
                $lifetime = 60 * 60 * 24 * 30;
                setcookie(session_name(), session_id(), time() + $lifetime, ...session_get_cookie_params());
            }
            
            echo json_encode(['success' => true, 'message' => 'Login erfolgreich!']);
        } else {
            $stmt_ins = $db->prepare("INSERT INTO login_attempts (ip_address, username, attempt_time) VALUES (?, ?, NOW())");
            $stmt_ins->bind_param("ss", $ip, $formData['username']);
            $stmt_ins->execute();
            echo json_encode(['success' => false, 'message' => 'Ungültiger Benutzername oder falsches Passwort.']);
        }
    } else {
        $stmt_ins = $db->prepare("INSERT INTO login_attempts (ip_address, username, attempt_time) VALUES (?, ?, NOW())");
        $stmt_ins->bind_param("ss", $ip, $formData['username']);
        $stmt_ins->execute();
        echo json_encode(['success' => false, 'message' => 'Ungültiger Benutzername oder falsches Passwort.']);
    }
    $stmt->close();
}

function runLogoutAction() {
    $_SESSION = array();
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params["path"], $params["domain"], $params["secure"], $params["httponly"]);
    }
    session_destroy();
    echo json_encode(['success' => true, 'message' => 'Erfolgreich ausgeloggt.']);
}

function runCheckAuth() {
    if (!empty($_SESSION['user_id'])) {
        echo json_encode(['success' => true, 'loggedIn' => true, 'user' => ['id' => $_SESSION['user_id'], 'username' => $_SESSION['username']]]);
    } else {
        echo json_encode(['success' => true, 'loggedIn' => false]);
    }
}
function runLoadAction($config, $db) {
    if (empty($_SESSION['user_id'])) { die(json_encode(['success' => false, 'message' => 'Nicht eingeloggt.'])); }
    $input = json_decode(file_get_contents('php://input'), true);
    $mappingName = $input['mappingName'] ?? '';
    $whereConditions = $input['where'] ?? [];
    $tableName = $config['form_mappings'][$mappingName] ?? null;
    if (!$tableName) { die(json_encode(['success' => false, 'message' => 'Mapping nicht gefunden.'])); }

    $sql = "SELECT * FROM `$tableName` WHERE ";
    $whereParts = ['`user_id` = ?'];
    $types = 'i';
    $values = [$_SESSION['user_id']];

    foreach ($whereConditions as $key => $value) {
        if (is_array($value)) {
            $placeholders = implode(', ', array_fill(0, count($value), '?'));
            $whereParts[] = "`$key` IN ($placeholders)";
            foreach ($value as $v) { $values[] = $v; $types .= 's'; }
        } else {
            $whereParts[] = "`$key` = ?";
            $values[] = $value; $types .= 's';
        }
    }
    
    $sql .= implode(' AND ', $whereParts);
    $stmt = $db->prepare($sql);
    if (!$stmt) die(json_encode(['success' => false, 'message' => 'SQL-Fehler: ' . $db->error]));
    $stmt->bind_param($types, ...$values);
    $stmt->execute();
    $result = $stmt->get_result();
    $data = $result->fetch_all(MYSQLI_ASSOC); 
    echo json_encode(['success' => true, 'data' => $data]);
}


function runSaveAction($config, $db) {
    if (empty($_SESSION['user_id'])) { die(json_encode(['success' => false, 'message' => 'Nicht eingeloggt.'])); }
    $input = json_decode(file_get_contents('php://input'), true);
    $mappingName = $input['mappingName'] ?? '';
    $formData = $input['formData'] ?? [];
    $tableName = $config['form_mappings'][$mappingName] ?? null;
    if (!$tableName) { die(json_encode(['success' => false, 'message' => 'Mapping nicht gefunden.'])); }

    $schemaResult = $db->query("DESCRIBE `$tableName`");
    $primaryKey = ''; $validColumns = [];
    while($column = $schemaResult->fetch_assoc()) {
        $validColumns[] = $column['Field'];
        if ($column['Key'] == 'PRI') { $primaryKey = $column['Field']; }
    }
    
    $dataToSave = array_intersect_key($formData, array_flip($validColumns));
    foreach ($dataToSave as $key => &$value) { if ($value === '') $value = null; }
    
    $dataToSave['user_id'] = $_SESSION['user_id'];
    if (empty($dataToSave)) { die(json_encode(['success' => false, 'message' => 'Keine validen Daten zum Speichern.'])); }
    
    $isUpdate = !empty($formData[$primaryKey]);
    $sql = ''; $types = ''; $values = [];

    try {
        if ($isUpdate) {
            $updateId = $dataToSave[$primaryKey];
            unset($dataToSave[$primaryKey]);
            $setParts = [];
            foreach ($dataToSave as $key => $value) {
                $setParts[] = "`$key` = ?";
                $types .= 's'; $values[] = $value;
            }
            $sql = "UPDATE `$tableName` SET " . implode(', ', $setParts) . " WHERE `$primaryKey` = ? AND `user_id` = ?";
            $types .= 'si'; $values[] = $updateId; $values[] = $_SESSION['user_id'];
        } else {
            $columns = array_keys($dataToSave);
            $placeholders = implode(', ', array_fill(0, count($columns), '?'));
            $sql = "INSERT INTO `$tableName` (`" . implode('`, `', $columns) . "`) VALUES ($placeholders)";
            foreach ($columns as $col) {
                $types .= 's'; $values[] = $dataToSave[$col];
            }
        }
        $stmt = $db->prepare($sql);
        $stmt->bind_param($types, ...$values);
        $stmt->execute();
        $savedId = $isUpdate ? $updateId : $db->insert_id;
        echo json_encode(['success' => true, 'message' => 'Erfolgreich gespeichert!', 'type' => $isUpdate ? 'update' : 'insert', 'id' => $savedId]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function runSetupAction($config, $db) {
    $errors = []; $success = 0;
    foreach ($config['tables_sql'] as $sql) {
        if ($db->query($sql)) { $success++; } else { $errors[] = $db->error; }
    }
    if (empty($errors)) { echo json_encode(['success' => true, 'message' => "Setup erfolgreich! $success Tabellen verarbeitet."]); } 
    else { echo json_encode(['success' => false, 'message' => 'Setup-Fehler', 'errors' => $errors]); }
}

function runRegisterAction($config, $db) {
    $input = json_decode(file_get_contents('php://input'), true);
    $formData = $input['formData'] ?? [];
    
    if (empty($formData['invitation_code']) || empty($formData['username']) || empty($formData['email']) || empty($formData['password'])) {
        die(json_encode(['success' => false, 'message' => 'Alle Felder müssen ausgefüllt werden.']));
    }
    
    $stmt_code = $db->prepare("SELECT code FROM invitation_codes WHERE code = ? AND used_by IS NULL");
    $stmt_code->bind_param("s", $formData['invitation_code']);
    $stmt_code->execute();
    if ($stmt_code->get_result()->num_rows !== 1) { die(json_encode(['success' => false, 'message' => 'Ungültiger oder bereits verwendeter Einladungscode.'])); }
    
    $stmt_user = $db->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
    $stmt_user->bind_param("ss", $formData['username'], $formData['email']);
    $stmt_user->execute();
    if ($stmt_user->get_result()->num_rows > 0) { die(json_encode(['success' => false, 'message' => 'Benutzername oder E-Mail bereits vergeben.'])); }
    
    $db->autocommit(false);
    try {
        $password_hash = password_hash($formData['password'], PASSWORD_DEFAULT);
        $stmt_ins_user = $db->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
        $stmt_ins_user->bind_param("sss", $formData['username'], $formData['email'], $password_hash);
        $stmt_ins_user->execute();
        $user_id = $db->insert_id;
        
        $stmt_ins_profile = $db->prepare("INSERT INTO user_profiles (user_id) VALUES (?)");
        $stmt_ins_profile->bind_param("i", $user_id);
        $stmt_ins_profile->execute();
        
        $stmt_upd_code = $db->prepare("UPDATE invitation_codes SET used_by = ?, used_at = NOW() WHERE code = ?");
        $stmt_upd_code->bind_param("is", $user_id, $formData['invitation_code']);
        $stmt_upd_code->execute();
        
        $db->commit();
        echo json_encode(['success' => true, 'message' => 'Account erfolgreich erstellt! Sie können sich nun einloggen.']);
    } catch (Exception $e) {
        $db->rollback();
        echo json_encode(['success' => false, 'message' => 'Fehler beim Erstellen des Accounts: ' . $e->getMessage()]);
    }
}
?>