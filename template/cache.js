/**
 * DataCache - Cache Manager für den Web-App-Generator
 * 
 * Bietet Memory-Cache und LocalStorage-Cache mit TTL
 * Automatisch in jeder App verfügbar
 */
class DataCache {
    constructor(options = {}) {
        this.memory = {};
        this.ttl = options.ttl || 5 * 60 * 1000; // Standard: 5 Minuten
        this.prefix = options.prefix || 'cache_';
        this.debug = options.debug || false;
    }
    
    /**
     * Daten aus Cache holen oder neu laden
     * @param {string} key - Cache-Schlüssel
     * @param {Function} loader - Async Funktion zum Laden der Daten
     * @param {Object} options - Optionen (ttl, forceRefresh)
     * @returns {Promise<any>} - Gecachte oder frische Daten
     */
    async get(key, loader, options = {}) {
        const ttl = options.ttl || this.ttl;
        const forceRefresh = options.forceRefresh || false;
        
        if (this.debug) console.log(`[Cache] Get: ${key}`);
        
        if (!forceRefresh) {
            // Memory Cache prüfen
            const memoryCached = this._getFromMemory(key, ttl);
            if (memoryCached !== null) {
                if (this.debug) console.log(`[Cache] Memory hit: ${key}`);
                return memoryCached;
            }
            
            // LocalStorage Cache prüfen
            const storageCached = this._getFromStorage(key, ttl);
            if (storageCached !== null) {
                if (this.debug) console.log(`[Cache] Storage hit: ${key}`);
                // In Memory Cache laden für schnelleren Zugriff
                this.memory[key] = {
                    data: storageCached,
                    timestamp: Date.now()
                };
                return storageCached;
            }
        }
        
        // Neu laden
        if (this.debug) console.log(`[Cache] Loading fresh: ${key}`);
        try {
            const fresh = await loader();
            this._set(key, fresh);
            return fresh;
        } catch (error) {
            console.error(`[Cache] Error loading ${key}:`, error);
            // Bei Fehler evtl. veraltete Daten zurückgeben
            const stale = this._getFromStorage(key, Infinity);
            if (stale !== null) {
                if (this.debug) console.log(`[Cache] Returning stale data for ${key}`);
                return stale;
            }
            throw error;
        }
    }
    
    /**
     * Daten in Cache speichern
     * @param {string} key - Cache-Schlüssel
     * @param {any} data - Zu speichernde Daten
     */
    set(key, data) {
        this._set(key, data);
    }
    
    /**
     * Cache leeren
     * @param {string} key - Spezifischen Key leeren oder null für alles
     */
    clear(key = null) {
        if (key) {
            // Einzelnen Key leeren
            if (this.debug) console.log(`[Cache] Clear: ${key}`);
            delete this.memory[key];
            System.storage.remove(this.prefix + key);
        } else {
            // Kompletten Cache leeren
            if (this.debug) console.log(`[Cache] Clear all`);
            this.memory = {};
            
            // LocalStorage Cache leeren
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                if (k && k.startsWith(this.prefix)) {
                    keys.push(k);
                }
            }
            keys.forEach(k => localStorage.removeItem(k));
        }
    }
    
    /**
     * Cache-Statistiken
     * @returns {Object} - Statistiken über Cache-Nutzung
     */
    stats() {
        const memoryKeys = Object.keys(this.memory).length;
        let storageKeys = 0;
        let storageSize = 0;
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                storageKeys++;
                storageSize += localStorage.getItem(key).length;
            }
        }
        
        return {
            memory: {
                keys: memoryKeys,
                items: this.memory
            },
            storage: {
                keys: storageKeys,
                sizeKB: Math.round(storageSize / 1024)
            }
        };
    }
    
    // Private Methoden
    
    _getFromMemory(key, ttl) {
        const cached = this.memory[key];
        if (cached && Date.now() - cached.timestamp < ttl) {
            return cached.data;
        }
        return null;
    }
    
    _getFromStorage(key, ttl) {
        try {
            const stored = System.storage.get(this.prefix + key);
            if (stored && Date.now() - stored.timestamp < ttl) {
                return stored.data;
            }
        } catch (error) {
            console.error(`[Cache] Storage read error for ${key}:`, error);
        }
        return null;
    }
    
    _set(key, data) {
        const cacheEntry = {
            data: data,
            timestamp: Date.now()
        };
        
        // Memory Cache
        this.memory[key] = cacheEntry;
        
        // LocalStorage Cache
        try {
            System.storage.set(this.prefix + key, cacheEntry);
        } catch (error) {
            console.error(`[Cache] Storage write error for ${key}:`, error);
            // Bei Speicherfehler (z.B. Quote exceeded) älteste Einträge löschen
            this._cleanupStorage();
            try {
                System.storage.set(this.prefix + key, cacheEntry);
            } catch (retryError) {
                console.error(`[Cache] Storage write failed after cleanup:`, retryError);
            }
        }
    }
    
    _cleanupStorage() {
        if (this.debug) console.log(`[Cache] Cleaning up storage`);
        
        // Alle Cache-Einträge sammeln
        const entries = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                try {
                    const data = JSON.parse(localStorage.getItem(key));
                    entries.push({ key, timestamp: data.timestamp || 0 });
                } catch (e) {
                    // Korrupte Einträge löschen
                    localStorage.removeItem(key);
                }
            }
        }
        
        // Nach Alter sortieren und älteste 25% löschen
        entries.sort((a, b) => a.timestamp - b.timestamp);
        const toDelete = Math.ceil(entries.length * 0.25);
        
        for (let i = 0; i < toDelete; i++) {
            localStorage.removeItem(entries[i].key);
        }
    }
}

// Global verfügbar machen
window.DataCache = DataCache;