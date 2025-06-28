<?php
/**
 * =====================================
 *   API.PHP – MODULARER API-KERN
 * =====================================
 * 
 * 1. Initialisierung & Includes
 * 2. Basis-Helper (sendResponse, sendError, getInput, requireAuth)
 * 3. Routing ("Dispatcher") –Action → Handler
 *    - Öffentliche Aktionen (z. B. login, register, ping)
 *    - Authentifizierung für alle anderen
 *    - Handler-Funktionen in app_handlers.php
 * 
 * 4. (App-spezifische Logik in app_handlers.php)
 * 5. (Konfigurationsklasse in BaaSConfig.php)
 * 
 * Duplizierbar für jedes Projekt, easy wartbar!
 * =====================================
 */

// 1. INITIALISIERUNG
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *'); // In Produktion ggf. anpassen!
session_start();

require_once 'BaaSConfig.php';      // Konfigurations- & DB-Klasse
require_once 'app_handlers.php';    // Alle App-Handler-Funktionen

// 2. BASIS-HELPER
function sendResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function sendError($message, $code = 400) {
    sendResponse(['success' => false, 'message' => $message], $code);
}

function getInput() {
    // Ermöglicht POST-JSON und Formulardaten
    $input = json_decode(file_get_contents('php://input'), true);
    if (is_array($input)) return $input;
    return $_POST;
}

function requireAuth() {
    if (empty($_SESSION['user_id'])) {
        sendError('Nicht authentifiziert', 401);
    }
}

// 3. ROUTING ("DISPATCHER")
try {
    $baas = BaaSConfig::getInstance();
    $input = getInput();
    $action = $input['action'] ?? $_GET['action'] ?? null;

    if (!$action) {
        sendError('Action not specified', 400);
    }

    // Welche Aktionen sind ohne Login erlaubt?
    $publicActions = ['login', 'register', 'ping'];

    if (!in_array($action, $publicActions)) {
        requireAuth();
    }

    // Handler-Funktion nach Schema handleLogin, handleSaveFormData usw.
    $function = "handle" . ucfirst($action);

    if (function_exists($function)) {
        call_user_func($function, $baas, $input);
    } else {
        sendError("Unknown action: $action", 404);
    }

} catch (Exception $e) {
    sendError('Server error: ' . $e->getMessage(), 500);
}
