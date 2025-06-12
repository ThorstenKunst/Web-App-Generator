document.addEventListener('DOMContentLoaded', () => {
    console.log('App gestartet. Willkommen!');

    // Prüfe, ob der Benutzer eingeloggt ist und zeige seinen Namen an
    Auth.updateUserDisplay();

    // Aktiviere das API-Logging in der Konsole
    System.enableDebug();

    // Hier kommt deine Logik rein...
    // Beispiel:
    // const ladeDatenButton = document.getElementById('lade-daten');
    // ladeDatenButton.addEventListener('click', meineDatenLadeFunktion);
});

// Logout-Button binden
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        System.logout().then(() => {
            window.location.href = 'login.html';
        });
    });
}