<?php
// system/debug.php - Developer Dashboard
session_start();

// Sicherheit: Nur in Debug-Modus zugänglich
$configPath = __DIR__ . '/../app-config.json';
$config = json_decode(file_get_contents($configPath), true);

// Prüfe ob Debug-Modus aktiv und User eingeloggt
if (empty($config['debug_mode']) || !$config['debug_mode']) {
    die('Debug mode is disabled. Enable it in app-config.json');
}

if (empty($_SESSION['user_id'])) {
    header('Location: /login.html');
    exit;
}

// Datenbankverbindung
$dbUrl = parse_url($config['database']);
$db = new mysqli($dbUrl['host'], $dbUrl['user'], $dbUrl['pass'], ltrim($dbUrl['path'], '/'));
$db->set_charset('utf8mb4');
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Debug Dashboard</title>
    <style>
        body { font-family: 'Monaco', monospace; background: #1a1a1a; color: #00ff00; padding: 20px; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; }
        h1, h2 { color: #00ff00; text-shadow: 0 0 5px #00ff00; border-bottom: 1px solid #00ff00; padding-bottom: 5px; }
        .section { background: #0a0a0a; border: 1px solid #005f00; padding: 20px; margin: 20px 0; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #005f00; padding: 8px; text-align: left; }
        th { background: #003300; }
        .info { color: #00ccff; } .warning { color: #ffcc00; } .error { color: #ff3333; } .success { color: #00ff00; }
        pre { background: #000; padding: 10px; overflow-x: auto; border: 1px solid #333; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 System Debug Dashboard</h1>
        <div class="section">
            <h2>System Status</h2>
            <table>
                <tr><td>App Name</td><td class="info"><?= htmlspecialchars($config['app_name']) ?></td></tr>
                <tr><td>PHP Version</td><td class="info"><?= PHP_VERSION ?></td></tr>
                <tr><td>Session ID</td><td class="info"><?= session_id() ?></td></tr>
                <tr><td>Current User</td><td class="info">ID: <?= $_SESSION['user_id'] ?> | Username: <?= $_SESSION['username'] ?></td></tr>
                <tr><td>Database Connection</td><td><span class="success">Connected</span></td></tr>
            </table>
        </div>
        <div class="section">
            <h2>Database Tables</h2>
            <?php
            $tables = $db->query("SHOW TABLES");
            while ($table = $tables->fetch_array()) {
                $tableName = $table[0];
                $count = $db->query("SELECT COUNT(*) as count FROM `$tableName`")->fetch_assoc()['count'];
                echo "<h3>📊 $tableName ($count Records)</h3>";
            }
            ?>
        </div>
        <div class="section">
            <h2>Session Data</h2>
            <pre><?= htmlspecialchars(print_r($_SESSION, true)) ?></pre>
        </div>
        <div class="section">
            <h2>Configuration (ohne sensitive Daten)</h2>
            <?php
            $safeConfig = $config;
            if (isset($safeConfig['database'])) { $safeConfig['database'] = 'mysql://USER:****@HOST/DB'; }
            if (isset($safeConfig['api_keys'])) {
                foreach ($safeConfig['api_keys'] as $key => $value) { $safeConfig['api_keys'][$key] = '****'; }
            }
            ?>
            <pre><?= htmlspecialchars(json_encode($safeConfig, JSON_PRETTY_PRINT)) ?></pre>
        </div>
    </div>
</body>
</html>