<?php
session_start(); // Login-Schutz
require_once 'system/api.php'; // BaaS-Engine laden
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BaaS-Dev App</title>
	<link rel="stylesheet" href="/css/theme.css">
</head>
<body>

    <!-- Die App-Struktur wird rein deklarativ mit den Komponenten gebaut -->
	<app-header title="AppName">
		<icon-button id="btnOpenSettings" icon="⚙️" tooltip="Einstellungen"></icon-button>
	</app-header>

	<!-- Settings als Overlay (nicht Modal!) -->
	<app-overlay id="settingsOverlay">
		<app-header slot="header" title="Einstellungen" actions='[{"id": "closeOverlay", "icon": "❮", "tooltip": "Zurück"}]'></app-header>
		<div slot="body">
			<!-- Settings-Inhalte hier -->
		</div>
	</app-overlay>

	<!-- Hauptinhalt nur mit Web Components -->
	<section-box title="Dein Coach sagt:" icon="info">
		<app-message type="info">Starke Leistung gestern beim Training! Heute ist ein neuer Tag, um wieder voll durchzustarten.</app-message>
	</section-box>	
	
	<sticky-footer>
		<form-button id="btnSave" label="Speichern" type="submit"></form-button>
	</sticky-footer>

    <!--
      BEST PRACTICE:
      1. Lade zuerst alle Web Components automatisch mit dem PHP-Loader.
      2. Lade dann die System-Bibliothek.
      3. Lade ZULETZT die app.js, die die Business-Logik enthält und
         auf die zuvor geladenen Komponenten und Systeme zugreift.
    -->
    <?php include __DIR__ . '/system/loader.php'; ?>
    <script src="/system/system.js"></script>
    <script src="app.js"></script>

</body>
</html>