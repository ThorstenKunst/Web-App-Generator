// system/auth.js - Gehört zum Generator-System
window.Auth = {
    // Login-Handler
    async handleLogin(formElement) {
        const formData = new FormData(formElement);
        const loginData = Object.fromEntries(formData);
        
        try {
            const response = await fetch('system/api.php?action=login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ formData: loginData })
            });
            
            const result = await response.json();
            
            if (result.success) {
                window.location.href = 'index.php';
            }
            
            return result;
        } catch (error) {
            return { 
                success: false, 
                message: 'Verbindungsfehler. Bitte versuche es später erneut.' 
            };
        }
    },
    
    // Register-Handler
    async handleRegister(formElement) {
        const formData = new FormData(formElement);
        
        // Client-seitige Validierung
        if (formData.get('password') !== formData.get('password_confirm')) {
            return { 
                success: false, 
                message: 'Die Passwörter stimmen nicht überein!' 
            };
        }
        
        // Passwort-Bestätigung nicht ans Backend senden
        formData.delete('password_confirm');
        const registerData = Object.fromEntries(formData);
        
        try {
            const response = await fetch('system/api.php?action=register', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ formData: registerData })
            });
            
            return await response.json();
        } catch (error) {
            return { 
                success: false, 
                message: 'Verbindungsfehler. Bitte versuche es später erneut.' 
            };
        }
    },
    
    // User-Display updaten
    async updateUserDisplay() {
        const authResult = await System.checkAuth();
        
        if (authResult.success && authResult.loggedIn) {
            const welcomeElement = document.getElementById('userWelcome');
            if (welcomeElement) {
                welcomeElement.innerHTML = `Moin ${authResult.user.username}!`;
            }
        }
        
        return authResult;
    },
    
    // Formular automatisch binden (Helper)
    bindForm(formId, successCallback) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        const action = formId === 'loginForm' ? 'handleLogin' : 
                      formId === 'registerForm' ? 'handleRegister' : null;
        
        if (!action) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const button = form.querySelector('button[type="submit"]');
            
            // Loading state
            if (button) {
                button.disabled = true;
            }
            
            const result = await this[action](form);
            
            // Reset loading state
            if (button) {
                button.disabled = false;
            }
            
            // Handle result
            if (result.success && successCallback) {
                successCallback(result);
            } else if (!result.success) {
                // Error display
                const errorFunc = window[`show${formId.charAt(0).toUpperCase() + formId.slice(1).replace('Form', '')}Error`];
                if (errorFunc) {
                    errorFunc(result.message);
                } else {
                    alert(result.message);
                }
            }
        });
    }
};