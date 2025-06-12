<?php
session_start();
// Wenn der Benutzer nicht eingeloggt ist, leite ihn zur Login-Seite um.
if (empty($_SESSION['user_id'])) {
    header('Location: login.html');
    exit;
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Meine App</title>
    </head>
<body>

    <header>
        <h1 id="userWelcome">Willkommen!</h1>
        <nav>
            <a href="/system/debug.php" target="_blank">Debug Dashboard</a>
            <a href="#" id="logoutButton">Logout</a>
        </nav>
    </header>

    <main id="app">
        <h2>Dashboard</h2>
        <p>Du bist erfolgreich eingeloggt.</p>
    </main>

    <script src="/system/system.js"></script>
    <script src="/system/auth.js"></script>
    <script src="app.js"></script>
</body>
</html>