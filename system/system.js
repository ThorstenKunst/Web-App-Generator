const System = {
    _debug: false,
    enableDebug: function() { this._debug = true; console.log('System Debug Mode Enabled.'); },
    disableDebug: function() { this._debug = false; },
    
    async call(action, payload = {}) {
        if (this._debug) {
            console.log(`%c[System.call] -> ${action}`, 'color: #00ccff', payload);
        }
        try {
            const response = await fetch(`system/api.php?action=${action}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            
            if (this._debug) {
                if(result.success) {
                    console.log(`%c[System.call] <- ${action} SUCCESS`, 'color: #00ff00', result);
                } else {
                    console.error(`[System.call] <- ${action} FAILED`, result);
                }
            }
            return result;

        } catch (error) {
            if (this._debug) {
                console.error(`[System.call] Fatal Error on action '${action}':`, error);
            }
            return { success: false, message: error.message };
        }
    },
    save: (mappingName, formData) => System.call('save', { mappingName, formData }),
    load: (mappingName, where) => System.call('load', { mappingName, where }),
    checkAuth: () => System.call('checkAuth'),
    logout: () => System.call('logout'),

    // ===================================================================
    // UTILITY FUNCTIONS - Wiederverwendbare Helpers
    // ===================================================================
    
    /**
     * Füllt ein Formular mit Daten
     * @param {string} formId - ID des Formulars oder Container-Elements
     * @param {object} data - Daten zum Befüllen
     */
    fillForm(formId, data) {
        const container = document.getElementById(formId);
        if (!container || !data) return;
        
        Object.entries(data).forEach(([key, value]) => {
            const elements = container.querySelectorAll(`[name="${key}"]`);
            
            elements.forEach(el => {
                if (el.type === 'checkbox' || el.tagName === 'TOGGLE-SWITCH') {
                    el.checked = Boolean(value);
                } else if (el.type === 'radio') {
                    el.checked = el.value === String(value);
                } else if (el.tagName === 'SELECT') {
                    el.value = value;
                } else if (el.tagName !== 'BUTTON') {
                    el.value = value || '';
                }
                
                // Trigger change event für reactive components
                el.dispatchEvent(new Event('change', { bubbles: true }));
            });
        });
        
        if (this._debug) {
            console.log(`[System.fillForm] Filled form '${formId}' with:`, data);
        }
    },

    /**
     * Sammelt alle Formulardaten
     * @param {string} formId - ID des Formulars oder Container-Elements
     * @returns {object} - Gesammelte Formulardaten
     */
    collectForm(formId) {
        const container = document.getElementById(formId);
        if (!container) return {};
        
        const data = {};
        
        // Alle Elemente mit name-Attribut sammeln
        container.querySelectorAll('[name]').forEach(el => {
            const name = el.getAttribute('name');
            
            if (el.type === 'checkbox' || el.tagName === 'TOGGLE-SWITCH') {
                data[name] = el.checked;
            } else if (el.type === 'radio') {
                if (el.checked) data[name] = el.value;
            } else if (el.tagName === 'BUTTON-SET') {
                data[name] = el.value || el.getAttribute('value');
            } else if (el.tagName !== 'BUTTON') {
                data[name] = el.value;
            }
        });
        
        if (this._debug) {
            console.log(`[System.collectForm] Collected from '${formId}':`, data);
        }
        
        return data;
    },

    /**
     * Formatiert ein Datum
     * @param {Date|string} date - Datum
     * @param {string} format - Format: 'iso', 'de-DE', 'relative'
     * @returns {string} - Formatiertes Datum
     */
    formatDate(date, format = 'de-DE') {
        if (!date) return '';
        
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        
        switch(format) {
            case 'iso': 
                return d.toISOString().split('T')[0];
                
            case 'relative': 
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const compareDate = new Date(d);
                compareDate.setHours(0, 0, 0, 0);
                
                if (compareDate.getTime() === today.getTime()) return 'Heute';
                if (compareDate.getTime() === yesterday.getTime()) return 'Gestern';
                return d.toLocaleDateString('de-DE');
                
            case 'de-DE':
            default:
                return d.toLocaleDateString('de-DE');
        }
    },

    /**
     * Zeigt einen Lade-Zustand für ein Element
     * @param {string} elementId - ID des Elements
     * @param {string} loadingText - Text während des Ladens
     */
    showLoading(elementId, loadingText = 'Laden...') {
        const el = document.getElementById(elementId);
        if (!el) return;
        
        el.dataset.originalContent = el.innerHTML;
        el.dataset.originalDisabled = el.disabled;
        el.innerHTML = `<span class="loading">${loadingText}</span>`;
        el.disabled = true;
        
        if (el.tagName === 'BUTTON' || el.tagName === 'FORM-BUTTON') {
            el.classList.add('loading');
        }
    },

    /**
     * Versteckt den Lade-Zustand
     * @param {string} elementId - ID des Elements
     */
    hideLoading(elementId) {
        const el = document.getElementById(elementId);
        if (!el || !el.dataset.originalContent) return;
        
        el.innerHTML = el.dataset.originalContent;
        el.disabled = el.dataset.originalDisabled === 'true';
        el.classList.remove('loading');
        
        delete el.dataset.originalContent;
        delete el.dataset.originalDisabled;
    },

    /**
     * Erzeugt ein Array von Datumsobjekten zwischen Start und Ende
     * @param {Date|string} startDate - Startdatum
     * @param {Date|string} endDate - Enddatum
     * @returns {Date[]} - Array von Datumsobjekten
     */
    dateRange(startDate, endDate) {
        const dates = [];
        const current = new Date(startDate);
        const end = new Date(endDate);
        
        while (current <= end) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        
        return dates;
    },

    /**
     * Debounce-Funktion um häufige Aufrufe zu vermeiden
     * @param {function} func - Zu verzögernde Funktion
     * @param {number} wait - Wartezeit in Millisekunden
     * @returns {function} - Debounced Funktion
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Gruppiert ein Array von Objekten nach einem Schlüssel
     * @param {Array} array - Array von Objekten
     * @param {string} key - Schlüssel zum Gruppieren
     * @returns {object} - Gruppiertes Objekt
     */
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            if (!groups[group]) groups[group] = [];
            groups[group].push(item);
            return groups;
        }, {});
    },

    /**
     * Berechnet den Durchschnitt eines Feldes in einem Array
     * @param {Array} array - Array von Objekten
     * @param {string} field - Feld für Berechnung
     * @returns {number} - Durchschnittswert
     */
    calculateAverage(array, field) {
        if (!array || array.length === 0) return 0;
        
        const values = array
            .map(item => parseFloat(item[field]))
            .filter(v => !isNaN(v));
            
        if (values.length === 0) return 0;
        
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    },

    /**
     * Local Storage Wrapper mit App-Prefix
     * @param {string} key - Schlüssel
     * @param {any} value - Wert (undefined = lesen)
     * @returns {any} - Gespeicherter Wert oder boolean bei Schreiben
     */
    storage(key, value) {
        const prefixedKey = `mantrack_${key}`;
        
        if (value === undefined) {
            // Lesen
            try {
                const item = localStorage.getItem(prefixedKey);
                return item ? JSON.parse(item) : null;
            } catch (e) {
                console.error('Storage read error:', e);
                return null;
            }
        } else if (value === null) {
            // Löschen
            localStorage.removeItem(prefixedKey);
            return true;
        } else {
            // Schreiben
            try {
                localStorage.setItem(prefixedKey, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Storage write error:', e);
                return false;
            }
        }
    }
};