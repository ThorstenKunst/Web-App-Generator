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
    logout: () => System.call('logout')
};