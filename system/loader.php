<?php
/**
 * loader.php
 *
 * Dieser automatische Loader scannt das /system/components/ Verzeichnis
 * und bindet jede gefundene JavaScript-Datei als Modul ein.
 *
 * Best Practice: Das sorgt dafür, dass neue Komponenten automatisch
 * verfügbar sind, ohne die index.php manuell anpassen zu müssen.
 */

$components_directory = __DIR__ . '/components';

// Prüfen, ob das Verzeichnis existiert
if (is_dir($components_directory)) {
    // Alle Dateien im Verzeichnis auflisten
    $files = scandir($components_directory);

    foreach ($files as $file) {
        // Nur Dateien mit der Endung .js berücksichtigen
        if (pathinfo($file, PATHINFO_EXTENSION) === 'js') {
            // Ein Script-Tag für jede Komponente ausgeben
            echo "<script type="module" src=\"/system/components/{$file}\"></script>\n";
        }
    }
}
?>
