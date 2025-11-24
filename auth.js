// Remove imports and use global Firebase object
const firebaseConfig = {
    apiKey: "AIzaSyBC0zw4OfSU7ft9D_cdx1OG1cedAFemZgc",
    authDomain: "shiloh-schedule.firebaseapp.com",
    projectId: "shiloh-schedule",
    storageBucket: "shiloh-schedule.firebasestorage.app",
    messagingSenderId: "161561389660",
    appId: "1:161561389660:web:baed586fb33c4961aed499",
    measurementId: "G-YS6FHHEGFZ"
};

class AuthManager {
    constructor() {
        // Initialize Firebase first
        this.app = firebase.initializeApp(firebaseConfig);
        this.auth = firebase.auth();
        this.analytics = firebase.analytics();
        this.provider = new firebase.auth.GoogleAuthProvider();
        this.isAuthenticated = false;
        this.currentUser = null;
        
        // Make auth manager globally available immediately
        window.authManager = this;
        
        // Wait for DOM before initializing UI
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.checkAuthentication();
                this.updateUI();
                // Set up auth state listener
                this.auth.onAuthStateChanged(user => {
                    this.currentUser = user;
                    this.isAuthenticated = !!user;
                    this.updateUI();
                    if (user) {
                        // Instead of saving local settings immediately, load Firestore settings if they exist.
                        this._maybeLoadUserSettings();
                    }
                });
            });
        } else {
            this.checkAuthentication();
            this.updateUI();
            // Set up auth state listener
            this.auth.onAuthStateChanged(user => {
                this.currentUser = user;
                this.isAuthenticated = !!user;
                this.updateUI();
                if (user) {
                    // Instead of saving local settings immediately, load Firestore settings if they exist.
                    this._maybeLoadUserSettings();
                }
            });
        }
        
        // Add message listener for popup communication
        window.addEventListener('message', this.handleAuthMessage.bind(this));
    }

    // Add handler for auth messages
    handleAuthMessage(event) {
        if (event.origin !== window.location.origin) return;
        
        switch (event.data.type) {
            case 'AUTH_SUCCESS':
                this.handleAuthSuccess(event.data.credential);
                break;
            case 'AUTH_ERROR':
                this.handleAuthError(event.data.error);
                break;
        }
    }

    async handleAuthSuccess(credential) {
        try {
            // Wait for the current user to be properly set
            await this.auth.currentUser?.reload();
            this.currentUser = this.auth.currentUser;
            
            // Make sure we have the user's photo URL
            if (!this.currentUser?.photoURL) {
                console.warn('No photo URL found for user');
                // Use a default avatar if no photo is available
                this.currentUser = {
                    ...this.currentUser,
                    photoURL: 'https://www.gravatar.com/avatar/?d=mp'
                };
            }
            
            localStorage.setItem('authToken', credential.accessToken);
            this.isAuthenticated = true;
            this.hideLoginModal();
            this.updateUI();
            
            // Load or save user settings in Firestore (will load if present,
            // otherwise save current local settings). Use the existing
            // _maybeLoadUserSettings helper which handles both cases.
            await this._maybeLoadUserSettings();
            
            console.info('Auth success - user data:', {
                name: this.currentUser.displayName,
                email: this.currentUser.email,
                photo: this.currentUser.photoURL
            });
            // Refresh the page after successful login
            window.location.reload();
        } catch (error) {
            console.error('Error handling auth success:', error);
            this.showError('Error loading user profile');
        }
    }

    // New function to save ALL settings
    async saveAllUserSettings(userId) {
        try {
            const db = firebase.firestore();
            const userDocRef = db.collection("users").doc(userId);
            
            // Collect all settings
            const settings = {
                whiteBoxColor: localStorage.getItem("whiteBoxColor"),
                whiteBoxOpacity: localStorage.getItem("whiteBoxOpacity"),
                whiteBoxTextColor: localStorage.getItem("whiteBoxTextColor"),
                fontFamily: localStorage.getItem("fontFamily"),
                fontColor: localStorage.getItem("fontColor"),
                theme: localStorage.getItem("theme"),
                countdownColor: localStorage.getItem("countdownColor"),
                progressBarEnabled: localStorage.getItem("progressBarEnabled"),
                progressBarColor: localStorage.getItem("progressBarColor"),
                progressBarOpacity: localStorage.getItem("progressBarOpacity"),
                timerShadowSettings: localStorage.getItem("timerShadowSettings"),
                gradientSettings: localStorage.getItem("gradientSettings"),
                bgImage: localStorage.getItem("bgImage"),
                profileHidden: localStorage.getItem("profileHidden"),
                currentScheduleName: localStorage.getItem("currentScheduleName")
            };

            // Include period renames and global period names (as JSON)
            try {
                const renames = localStorage.getItem('periodRenames');
                if (renames) settings.periodRenames = JSON.parse(renames);
            } catch (e) {
                // if parsing fails, store raw string
                settings.periodRenames = localStorage.getItem('periodRenames');
            }
            try {
                let globalNames = localStorage.getItem('globalPeriodNames');
                if (globalNames) {
                    if (globalNames === '[object Object]') {
                        settings.globalPeriodNames = {};
                    } else {
                        try {
                            settings.globalPeriodNames = JSON.parse(globalNames);
                        } catch (e) {
                            // keep raw string if parsing fails
                            settings.globalPeriodNames = globalNames;
                        }
                    }
                }
            } catch (e) {
                settings.globalPeriodNames = localStorage.getItem('globalPeriodNames');
            }

            // Collect any custom schedules saved in localStorage (keys starting with customSchedule_)
            const customSchedules = {};
            Object.keys(localStorage).forEach(k => {
                if (k.startsWith('customSchedule_')) {
                    try {
                        customSchedules[k] = JSON.parse(localStorage.getItem(k));
                    } catch (e) {
                        customSchedules[k] = localStorage.getItem(k);
                    }
                }
            });
            if (Object.keys(customSchedules).length) {
                settings.customSchedules = customSchedules;
            }

            // Remove any null or undefined values
            Object.keys(settings).forEach(key => 
                (settings[key] === null || typeof settings[key] === 'undefined') && delete settings[key]
            );

            // Save to Firestore
            await userDocRef.set({ settings }, { merge: true });
            console.info("✅ All settings saved to Firestore");
            
            return true;
        } catch (error) {
            console.error("❌ Error saving settings:", error);
            return false;
        }
    }

    // Replace _maybeSaveUserSettings with _maybeLoadUserSettings to avoid overwriting Firestore
    async _maybeLoadUserSettings() {
        try {
            const db = firebase.firestore();
            const userDocRef = db.collection("users").doc(this.currentUser.uid);
            const doc = await userDocRef.get();
            
            if (doc.exists) {
                console.info("User settings found in Firestore, loading them.");
                // Use loadUserSettings() helper to fetch and merge into localStorage
                const settings = await loadUserSettings(); // Get the loaded settings (and mirror into localStorage)
                if (settings) {
                    // Apply visual settings without overwriting other local preferences
                    document.body.style.backgroundImage = '';
                    localStorage.removeItem('bgImage');

                    // Gradient handling
                    if (settings.gradientSettings) {
                        const gradientSettings = (typeof settings.gradientSettings === 'string')
                            ? JSON.parse(settings.gradientSettings)
                            : settings.gradientSettings;
                        if (window.gradientManager) {
                            window.gradientManager.enabled = !!gradientSettings.enabled;
                            window.gradientManager.angle = gradientSettings.angle ?? 90;
                            window.gradientManager.stops = Array.isArray(gradientSettings.stops)
                                ? gradientSettings.stops
                                : [
                                    { color: gradientSettings.startColor || '#000035', position: 0 },
                                    { color: gradientSettings.endColor || '#c4ad62', position: 100 }
                                ];
                            window.gradientManager.updateUI();
                            window.gradientManager.applyGradient();
                        }
                    }

                    // Background image
                    if (settings.bgImage) {
                        document.body.style.backgroundImage = `url('${settings.bgImage}')`;
                        if (window.gradientManager) {
                            window.gradientManager.enabled = false;
                            window.gradientManager.updateUI();
                        }
                    }

                    // Visual settings
                    if (settings.fontColor) {
                        const heading = document.getElementById('countdown-heading');
                        if (heading) heading.style.color = settings.fontColor;
                    }
                    if (settings.fontFamily) document.body.style.fontFamily = settings.fontFamily;

                    // Load settings into UI
                    if (typeof loadSettings === 'function') {
                        loadSettings();
                    }

                    console.info("✅ Settings applied successfully");
                }
            } else {
                console.info("No settings found in Firestore, saving current local settings.");
                await this.saveAllUserSettings(this.currentUser.uid);
            }
        } catch (e) {
            console.error("Error handling user settings:", e);
        }
    }

    handleAuthError(error) {
        console.error('Auth error:', error);
        this.showError(error.message || 'Authentication failed');
    }

    async initializeAuth() {
        const button = document.getElementById('google-signin');
        if (button) {
            button.innerHTML = `
                <button class="google-btn" onclick="authManager.signIn()">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google Logo">
                    Sign in with Google
                </button>
            `;
        }
        
        // Check for redirect result on page load
        await this.handleRedirectResult();
    }

    async signIn() {
        if (this.isPopupOpen) return;
        
        try {
            this.isPopupOpen = true;
            // Use signInWithPopup directly without showing modal
            const result = await this.auth.signInWithPopup(this.provider);
            
            if (result?.credential?.accessToken) {
                this.handleAuthSuccess(result.credential);
                window.location.reload();
            }
        } catch (error) {
            this.handleAuthError(error);
        } finally {
            this.isPopupOpen = false;
        }
    }

    // Add redirect result handler
    async handleRedirectResult() {
        try {
            const result = await this.auth.getRedirectResult();
            if (result?.credential?.accessToken) {
                this.handleAuthSuccess(result.credential);
                this.hideLoginModal();
                window.location.reload();
            }
        } catch (error) {
            this.handleAuthError(error);
        }
    }

    showError(message) {
        const errorElement = document.getElementById('login-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
    }

    updateUI() {
        const headerButton = document.getElementById('sign-in-button');
        if (!headerButton) return;

        if (this.isAuthenticated && this.currentUser) {
            const photoURL = this.currentUser.photoURL || 'https://www.gravatar.com/avatar/?d=mp';
            const isHidden = localStorage.getItem('profileHidden') === 'true';
            
            headerButton.style.display = 'block';
            headerButton.innerHTML = `
                <div class="profile-container" data-hidden="${isHidden}">
                    <button class="profile-button" title="${this.currentUser.displayName}" 
                        style="opacity: ${isHidden ? '0' : '1'}" 
                        disabled="${isHidden}" 
                        aria-hidden="${isHidden}"
                        tabindex="${isHidden ? '-1' : '0'}">
                        <img src="${photoURL}" alt="Profile">
                    </button>
                    <button class="logout-button" ${isHidden ? 'disabled aria-hidden="true" tabindex="-1"' : ''}>
                        Sign Out
                    </button>
                    <button class="hide-profile-button" onclick="window.authManager.toggleProfileVisibility(event)">
                        ${isHidden ? 'Show Profile' : 'Hide Profile'}
                    </button>
                </div>
            `;
            
            // Attach event listener for sign out:
            const logoutBtn = headerButton.querySelector('.logout-button');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => window.authManager.logout());
            }
            
            // Only add click handler if not hidden
            const profileButton = headerButton.querySelector('.profile-button');
            if (profileButton && !isHidden) {
                profileButton.onclick = (e) => {
                    e.stopPropagation();
                    this.handleAuthButton();
                };
            }
            // The hide-profile-button now only toggles visibility, not sign out
        } else {
            headerButton.style.display = 'block';
            headerButton.innerHTML = `
                <button class="sign-in-btn" onclick="handleAuthButton()">
                    Sign In
                </button>
            `;
        }
        
        // Update sidebar button if it exists
        const sidebarButton = document.getElementById('auth-button');
        if (sidebarButton) {
            if (this.isAuthenticated && this.currentUser) {
                const photoURL = this.currentUser.photoURL || 'https://www.gravatar.com/avatar/?d=mp';
                sidebarButton.innerHTML = `
                    <img src="${photoURL}" alt="Profile" class="profile-pic">
                    <span>Sign Out</span>
                `;
            } else {
                sidebarButton.innerHTML = `
                    <i class="fas fa-user"></i>
                    <span id="auth-button-text">Sign In</span>
                `;
            }
        }
    }

    // Add new method to handle profile visibility
    toggleProfileVisibility(e) {
        if (e) e.stopPropagation();
        
        const isCurrentlyHidden = localStorage.getItem('profileHidden') === 'true';
        const newHiddenState = !isCurrentlyHidden; // Flip the current state
        
        // Update localStorage
        localStorage.setItem('profileHidden', newHiddenState);
        
        // Update UI
        const headerButton = document.getElementById('sign-in-button');
        const settingsSwitch = document.getElementById('profile-visibility-toggle');
        
        if (headerButton) {
            headerButton.style.display = newHiddenState ? 'none' : 'block';
            if (!newHiddenState) {
                // Re-render the profile UI when showing
                this.updateUI();
            }
        }
        
        // Update settings switch if it exists
        if (settingsSwitch) {
            settingsSwitch.checked = !newHiddenState;
        }

        // Save to Firestore if authenticated
        if (this.currentUser) {
            this.saveAllUserSettings(this.currentUser.uid);
        }
    }

    checkAuthentication() {
        const token = localStorage.getItem('authToken');
        this.isAuthenticated = !!token;
        // Remove auto-show of login modal
        return this.isAuthenticated;
    }

    async logout() {
        try {
            // Call Firebase signOut and wait for completion.
            await this.auth.signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            // Immediately reload to update application state.
            window.location.href = window.location.pathname;
        }
    }

    async forceLogout() {
        try {
            // Clear auth state first
            // Remove only auth/session related keys to avoid wiping user customizations
            localStorage.removeItem('authToken');
            // Keep user's local preferences like periodRenames, custom schedules, gradients, etc.
            this.isAuthenticated = false;
            this.currentUser = null;
            
            // Reset all styles synchronously
            document.body.style.backgroundImage = 'none';
            document.body.style.background = '#000035';
            
            // Sign out of Firebase
            try {
                await this.auth.signOut();
            } catch (e) {
                console.warn('Firebase signOut error:', e);
            }
            
            // Force redirect to home page
            window.location = window.location.pathname;
            
        } catch (error) {
            console.error('Error during force logout:', error);
            // Last resort: hard reload
            window.location.reload(true);
        }
    }

    showLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            // Clear any previous errors
            const errorElement = document.getElementById('login-error');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
            
            // Add the 'show' class to trigger the fade-in animation
            modal.style.display = 'flex';
            requestAnimationFrame(() => {
                modal.classList.add('show');
            });
            
            this.initializeAuth();
            
            // Add click outside to close
            const handleClick = (e) => {
                if (e.target === modal) {
                    this.hideLoginModal();
                }
            };
            
            // Add escape key to close
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    this.hideLoginModal();
                }
            };
            
            modal.addEventListener('click', handleClick);
            document.addEventListener('keydown', handleEscape);
            
            // Store event listeners for cleanup
            modal._cleanup = () => {
                modal.removeEventListener('click', handleClick);
                document.removeEventListener('keydown', handleEscape);
            };
        }
    }

    hideLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.remove('show');
            // Clean up event listeners
            if (modal._cleanup) {
                modal._cleanup();
                delete modal._cleanup;
            }
            // Wait for animation to complete before hiding
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300); // Match this with your CSS transition duration
        }
    }

    // Remove or modify handleAuthButton to directly call signIn
    handleAuthButton() {
        if (this.isAuthenticated) {
            this.logout();
        } else {
            this.signIn(); // Directly call signIn instead of showLoginModal
        }
    }
}

// Add helper functions for saving and fetching user settings
function saveUserSettings(userId, settings) {
    const db = firebase.firestore();
    db.collection("users").doc(userId).set(settings, { merge: true })
    .then(() => {
    console.info("✅ User settings saved successfully!");
    })
    .catch((error) => {
        console.error("❌ Error saving settings: ", error);
    });
}

function getUserSettings(userId) {
    const db = firebase.firestore();
    db.collection("users").doc(userId).get()
    .then((doc) => {
        if (doc.exists) {
            console.info("✅ Retrieved settings:", doc.data());
        } else {
            console.info("⚠️ No settings found for this user.");
        }
    })
    .catch((error) => {
        console.error("❌ Error fetching settings:", error);
    });
}

// Add window message handler for popup communication
window.addEventListener('message', (event) => {
    if (event.data === 'auth-success') {
        window.location.reload();
    }
});

// New helper function to load user settings from Firestore
async function loadUserSettings() {
    if (!window.authManager || !window.authManager.currentUser) return null;
    try {
        const db = firebase.firestore();
        const userDoc = await db.collection("users").doc(window.authManager.currentUser.uid).get();
        if (userDoc.exists) {
            const settings = userDoc.data().settings;
            console.info("✅ Loaded settings from Firestore:", settings);
            // Update localStorage to mirror Firestore settings (merge safely)
            Object.keys(settings).forEach(key => {
                const val = settings[key];
                if (val === null || typeof val === 'undefined') return;

                try {
                    if (key === 'gradientSettings' && typeof val === 'object') {
                        localStorage.setItem(key, JSON.stringify(val));
                    } else if (key === 'periodRenames' || key === 'globalPeriodNames') {
                        // Ensure JSON string storage
                        if (typeof val === 'object') {
                            localStorage.setItem(key, JSON.stringify(val));
                        } else {
                            // Could be string: try to parse or store raw
                            try { JSON.parse(val); localStorage.setItem(key, val); }
                            catch (e) { localStorage.setItem(key, JSON.stringify(val)); }
                        }
                    } else if (key === 'customSchedules' && typeof val === 'object') {
                        // customSchedules is an object mapping keys to schedule arrays
                        Object.keys(val).forEach(k => {
                            try {
                                localStorage.setItem(k, JSON.stringify(val[k]));
                            } catch (e) {
                                localStorage.setItem(k, String(val[k]));
                            }
                        });
                    } else {
                        // Default: store primitive or stringify object
                        if (typeof val === 'object') localStorage.setItem(key, JSON.stringify(val));
                        else localStorage.setItem(key, String(val));
                    }
                } catch (e) {
                    console.warn('Could not mirror setting', key, e);
                }
            });
            return settings;
        }
    } catch (error) {
        console.error("❌ Error loading settings from Firestore:", error);
    }
    return null;
}

// Initialize immediately
window.authManager = new AuthManager();
