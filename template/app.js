// Cache initialisieren
const cache = new DataCache({ debug: false });

// App-Initialisierung
document.addEventListener('DOMContentLoaded', async () => {
    // Auth prüfen - leitet bei fehlendem Login automatisch um
    await System.checkAuth();
    
    // User-Info anzeigen
    await updateUserDisplay();
    
    // Event-Handler einrichten
    setupEventHandlers();
    
    // Initiale Daten laden
    await loadData();
});

// User-Anzeige aktualisieren
async function updateUserDisplay() {
    try {
        const userInfo = await System.getUserInfo();
        document.getElementById('userDisplay').textContent = `Hallo ${userInfo.username}!`;
    } catch (error) {
        console.error('Fehler beim Laden der User-Info:', error);
    }
}

// Event-Handler Setup
function setupEventHandlers() {
    // Haupt-Formular
    document.getElementById('mainForm').addEventListener('submit', handleFormSubmit);
    
    // Datum auf heute setzen
    const dateInput = document.querySelector('input[name="datum"]');
    if (dateInput && !dateInput.value) {
        dateInput.value = System.formatDate(new Date(), 'YYYY-MM-DD');
    }
}

// Formular-Submit Handler
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Nachricht zurücksetzen
    showMessage('');
    
    try {
        // Daten mit System.collectForm sammeln
        const data = System.collectForm('mainForm');
        
        // Speichern mit Auto-CRUD (INSERT oder UPDATE)
        const result = await System.save('mainForm', data);
        
        if (result.success) {
            showMessage('Erfolgreich gespeichert!', 'success');
            
            // Cache leeren nach Änderung
            cache.clear('hauptdaten');
            
            // Formular zurücksetzen
            e.target.reset();
            
            // Datum wieder auf heute
            const dateInput = e.target.querySelector('input[name="datum"]');
            if (dateInput) {
                dateInput.value = System.formatDate(new Date(), 'YYYY-MM-DD');
            }
            
            // Daten neu laden
            await loadData();
        } else {
            showMessage('Fehler beim Speichern: ' + result.message, 'error');
        }
    } catch (error) {
        showMessage('Fehler: ' + error.message, 'error');
        console.error('Submit-Fehler:', error);
    }
}

// Daten laden und anzeigen
async function loadData() {
    try {
        // Mit Cache laden (5 Minuten TTL)
        const data = await cache.get('hauptdaten', async () => {
            const result = await System.load('mainForm', {
                orderBy: 'datum DESC, created_at DESC',
                limit: 20
            });
            
            if (!result.success) {
                throw new Error(result.message || 'Fehler beim Laden');
            }
            
            return result.data;
        });
        
        displayData(data);
    } catch (error) {
        console.error('Fehler beim Laden:', error);
        document.getElementById('dataDisplay').innerHTML = 
            '<div class="error">Fehler beim Laden der Daten</div>';
    }
}

// Daten anzeigen
function displayData(data) {
    const container = document.getElementById('dataDisplay');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">Noch keine Einträge vorhanden</p>';
        return;
    }
    
    // HTML für jeden Eintrag generieren
    container.innerHTML = data.map(entry => `
        <div class="data-item fade-in">
            <div class="data-item-header">
                <div class="data-item-content">
                    <strong>${entry.titel || 'Ohne Titel'}</strong>
                    <div class="text-muted">
                        ${System.formatDate(entry.datum)} 
                        ${entry.kategorie ? `• ${entry.kategorie}` : ''}
                        ${entry.wert ? `• Wert: ${entry.wert}` : ''}
                    </div>
                    ${entry.notizen ? `<p class="mt-1 mb-0">${escapeHtml(entry.notizen)}</p>` : ''}
                </div>
                <div class="data-item-actions">
                    <button onclick="editEntry(${entry.id})" class="btn btn-sm btn-secondary">Bearbeiten</button>
                    <button onclick="deleteEntry(${entry.id})" class="btn btn-sm btn-danger">Löschen</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Eintrag bearbeiten
window.editEntry = async (id) => {
    try {
        // Einzelnen Eintrag laden
        const result = await System.load('mainForm', { id: id });
        
        if (result.success && result.data[0]) {
            // Formular mit den Daten füllen
            System.fillForm('mainForm', result.data[0]);
            
            // Nach oben scrollen zum Formular
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            showMessage('Eintrag zum Bearbeiten geladen', 'success');
        }
    } catch (error) {
        showMessage('Fehler beim Laden des Eintrags', 'error');
        console.error('Edit-Fehler:', error);
    }
};

// Eintrag löschen
window.deleteEntry = async (id) => {
    if (!confirm('Diesen Eintrag wirklich löschen?')) {
        return;
    }
    
    try {
        // Löschung über API
        const result = await System.delete('mainForm', id);
        
        if (result.success) {
            showMessage('Eintrag gelöscht', 'success');
            cache.clear('hauptdaten'); // Cache leeren
            await loadData();
        } else {
            showMessage('Fehler beim Löschen', 'error');
        }
    } catch (error) {
        showMessage('Fehler beim Löschen', 'error');
        console.error('Delete-Fehler:', error);
    }
};

// Hilfsfunktion: Nachrichten anzeigen
function showMessage(text, type = '') {
    const messageBox = document.getElementById('messageBox');
    if (!text) {
        messageBox.innerHTML = '';
        return;
    }
    
    messageBox.innerHTML = `<div class="${type}">${text}</div>`;
    
    // Nach 5 Sekunden ausblenden
    if (type === 'success') {
        setTimeout(() => {
            messageBox.innerHTML = '';
        }, 5000);
    }
}

// Hilfsfunktion: HTML escapen
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Debug-Helper (nur wenn debug_mode in config aktiv)
if (window.System && System.isDebugMode) {
    console.log('Debug-Modus aktiv - Nutze System.enableDebug() für API-Logs');
}