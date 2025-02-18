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
            
            console.log('Auth success - user data:', {
                name: this.currentUser.displayName,
                email: this.currentUser.email,
                photo: this.currentUser.photoURL
            });
        } catch (error) {
            console.error('Error handling auth success:', error);
            this.showError('Error loading user profile');
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
            headerButton.innerHTML = `
                <div class="profile-container">
                    <button class="profile-button" title="${this.currentUser.displayName}" onclick="handleAuthButton()">
                        <img src="${photoURL}" alt="Profile">
                    </button>
                    <button class="logout-button" onclick="authManager.logout()">Sign Out</button>
                </div>
            `;
        } else {
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

    checkAuthentication() {
        const token = localStorage.getItem('authToken');
        this.isAuthenticated = !!token;
        // Remove auto-show of login modal
        return this.isAuthenticated;
    }

    async logout() {
        try {
            await this.auth.signOut();
            localStorage.removeItem('authToken');
            this.isAuthenticated = false;
            
            // Use location.reload() only if not in a popup
            if (window.opener) {
                window.opener.location.reload();
                window.close();
            } else {
                window.location.reload();
            }
        } catch (error) {
            console.error('Error signing out:', error);
            // Attempt force logout
            localStorage.removeItem('authToken');
            this.isAuthenticated = false;
            window.location.reload();
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

// Add window message handler for popup communication
window.addEventListener('message', (event) => {
    if (event.data === 'auth-success') {
        window.location.reload();
    }
});

// Initialize immediately
window.authManager = new AuthManager();
