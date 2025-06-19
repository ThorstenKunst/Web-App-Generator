<?php
session_start();
if (!isset($_SESSION['user_id'])) {
header('Location: login.html');
exit;
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meine App</title>
    <link rel="stylesheet" href="css/theme.css">
</head>
<body>
    <!-- Header mit User-Info und Settings -->
	<header class="app-header">
		<div class="header-content">
			<!-- 'Moin' wird später über die ID 'userWelcome' per JavaScript dynamisch ersetzt -->
			<h1 id="userWelcome">Moin!</h1>
			<!-- Button-Click wird über Event Delegation mit data-action="settings" ausgewertet -->
			<button class="btn btn-setting" data-action="settings"><!-- Optional: hier könnte ein SVG-Icon rein --></button>
		</div>
	</header>	
	<main>
		<!-- Beispiel: MESSAGE -->
		<section class="section-coach">
            <span>Dein Coach sagt:</span>
            <div class="message" id="coachMessage">
                Starke Leistung gestern beim Training! Heute ist ein neuer Tag, um wieder voll durchzustarten.
            </div>
        </section>	
		
		<!-- Beispiel: DATEPICKER -->
		<div class="date-selector">
			<button class="date-nav" id="prevDay"><i class="fas fa-chevron-left"></i></button>
			<div class="current-date" id="currentDate">Heute</div>
			<button class="date-nav" id="nextDay"><i class="fas fa-chevron-right"></i></button>
		</div>	
		
		<!-- Beispiel: SEKTION with TOGGLESWITCH + RANGESLIDER -->		
		<section class="section-form">
			<div class="section-header">
				<i class="section-icon" aria-hidden="true">💧</i>
				<h2 class="section-title">Körper &amp; Geist</h2>
			</div>
			<div class="form-group">
				 <div class="toggle-group">
					<div class="toggle-item">
						<label class="toggle-switch"><input type="checkbox" name="morgenerektion" value="1"><span class="toggle-slider"></span></label>
						<label class="toggle-label">Morgenerektion</label>
					</div>
					<div class="toggle-item">
						<label class="toggle-switch"><input type="checkbox" name="wasser" id="wasser" value="1"><span class="toggle-slider"></span></label>
						<label for="wasser" class="toggle-label">3 Liter Wasser</label>
					</div>
				</div>
			</div>
			<div class="form-group">
				<label class="form-label">Libido</label>
				<div class="slider-container"><div class="slider-value" id="libidoValue" style="left: calc(20% - 7.2px);">2</div><input type="range" min="0" max="10" value="5" class="slider" name="libido" id="libido" data-initialized="true"><div class="slider-labels"><span>❄️</span><span>🔥</span></div></div>
			</div>
		</section>	
		
		<!-- Beispiel: SEKTION with TEXTBOXES -->
		<section class="section-form">
			<div class="section-header">
				<i class="section-icon" aria-hidden="true">🍎</i>
				<h2 class="section-title">Ernährung</h2>
			</div>			
			<div class="form-group">
				<label for="ernaehrung_fruehstueck" class="form-label">Frühstück</label>
				<textarea class="form-textarea" name="ernaehrung_fruehstueck" id="ernaehrung_fruehstueck" rows="2" placeholder="Was gab es?"></textarea>
			</div>
			<div class="form-group">
				<label for="ernaehrung_mittag" class="form-label">Mittagessen</label>
				<textarea class="form-textarea" name="ernaehrung_mittag" id="ernaehrung_mittag" rows="2" placeholder="Was gab es?"></textarea>
			</div>
		</section>

	</main>
	<!-- FOOTER -->
	<footer class="sticky">
		<button class="btn btn-primary" id="saveProtokoll">Tagesprotokoll speichern</button>
	</footer>	
	
	<!-- SETTINGS OVERLAY; per default: HIDDEN -->
	<div class="overlay-settings" id="settingsOverlay">
		<header class="app-header">
			<div class="header-content">
				<!-- Button-Click wird über Event Delegation mit data-action="close-settings" ausgewertet -->
				<button class="btn btn-setting-back" data-action="close-settings"><i class="fas fa-chevron-left"></i></button>
				<h1>Einstellungen</h1>
			</div>
		</header>

		<!-- Beispiel: SECTION with SUBMENU -->		
		<section class="section-settings">
			<h2 class="settings-section-title">MEIN PROFIL</h2>
			
			<div class="settings-item" id="stammdatenItem">
				<div class="settings-item-left">
					<div class="settings-icon">
						<i class="fas fa-user"></i>
					</div>
					<div class="settings-item-info">
						<div class="settings-item-title">Stammdaten</div>
						<div class="settings-item-subtitle">Größe, Gewicht, Ernährung &amp; Training</div>
					</div>
				</div>
				<i class="fas fa-chevron-right settings-item-arrow"></i>
			</div>
			
			<div class="settings-item">
				<div class="settings-item-left">
					<div class="settings-icon">
						<i class="fas fa-heart"></i>
					</div>
					<div class="settings-item-info">
						<div class="settings-item-title">Sex-Tracking anzeigen</div>
						<div class="settings-item-subtitle">Sexuelle Aktivitäten im Protokoll</div>
					</div>
				</div>
				<label class="settings-toggle">
					<input type="checkbox" id="showSexualActivitiesSettings" name="show_sexual_activities" checked="">
					<span class="settings-toggle-slider"></span>
				</label>
			</div>
		</section>
	</div>
	
	<!-- SETTINGS SUBPAGE OVERLAY; per default: HIDDEN -->
	<div class="overlay-settings-subpage" id="stammdatenSubpage">
		<header class="app-header">
			<div class="header-content">
				<!-- Button-Click wird über Event Delegation mit data-action="close-subsettings" ausgewertet -->
				<button class="btn btn-setting-back" data-action="close-subsettings"><i class="fas fa-chevron-left"></i></button>
				<h1>Stammdaten</h1>
			</div>
		</header>	
		.....
		<footer class="sticky">
			<button class="btn btn-primary" id="saveStammdaten">Stammdaten speichern</button>
		</footer>		
	</div>	
	
    <!-- System-Scripts (diese bleiben unverändert!) -->
    <script src="/system/system.js"></script>
    <script src="/system/auth.js"></script>    
    <!-- Cache Manager -->
    <script src="cache.js"></script>    
    <!-- App-Logik -->
    <script src="app.js"></script>
</body>
</html>