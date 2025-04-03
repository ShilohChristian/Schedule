class GradientManager {
    constructor() {
        // Prevent multiple instances
        if (window.gradientManager) {
            return window.gradientManager;
        }

        // Initialize properties
        this.stops = [
            { color: '#000035', position: 0 },
            { color: '#00bfa5', position: 100 }
        ];
        this.angle = 90;
        this.enabled = true;
        this.selectedStop = null;

        // Apply default gradient immediately
        document.body.style.background = 'linear-gradient(to bottom, #000035, #00bfa5)';
        
        window.gradientManager = this;
        this.loadSavedGradient();
    }

    // Add the missing method
    initializeDefaultStops() {
        this.stops = [
            { color: '#000035', position: 0 },
            { color: '#00bfa5', position: 100 }
        ];
        this.angle = 90;
        this.enabled = true;
    }

    init() {
        // Wait for both DOM and other scripts
        if (document.readyState !== 'complete') {
            window.addEventListener('load', () => this.setupManager());
        } else {
            this.setupManager();
        }
    }

    setupManager() {
        if (this.initialized) return;
        
        // Wait for required elements
        const requiredElements = [
            'gradient-stops',
            'gradient-enabled',
            'gradient-angle',
            'add-stop',
            'gradient-settings'
        ];

        if (!requiredElements.every(id => document.getElementById(id))) {
            setTimeout(() => this.setupManager(), 100);
            return;
        }

        // Load settings first before any other initialization
        this.loadSettings();

        // Check for background image after settings are loaded
        const hasBackgroundImage = localStorage.getItem('bgImage');
        if (hasBackgroundImage) {
            this.enabled = false;
            document.body.style.backgroundImage = `url('${hasBackgroundImage}')`;
        } else {
            // Only apply gradient if no background image exists
            this.enabled = true;
            this.applyGradient();
        }

        this.initializeEventListeners();
        this.initialized = true;
        this.updateGradientSettingsVisibility();
    }

    initializeEventListeners() {
        document.getElementById('gradient-enabled')?.addEventListener('change', () => this.toggleGradient());
        document.getElementById('gradient-angle')?.addEventListener('input', (e) => this.updateAngle(e.target.value));
        document.getElementById('add-stop')?.addEventListener('click', () => this.addStop());
    }

    loadSettings() {
        const stored = localStorage.getItem('gradientSettings');
        if (stored) {
            try {
                const settings = JSON.parse(stored);
                if (settings) {
                    // Always load stops and angle, even if gradient is disabled
                    if (Array.isArray(settings.stops)) {
                        this.stops = settings.stops;
                        this.angle = settings.angle || 90;
                        this.stops.sort((a, b) => a.position - b.position);
                    }
                    
                    // Check if background image exists - if so, don't enable gradient
                    const hasBackgroundImage = localStorage.getItem('bgImage');
                    this.enabled = hasBackgroundImage ? false : settings.enabled;
                    
                    // Update UI with loaded settings
                    this.updateUI();
                    
                    // Apply gradient only if enabled and no background image
                    if (this.enabled && !hasBackgroundImage) {
                        requestAnimationFrame(() => this.applyGradient());
                    }
                }
            } catch (error) {
                console.warn('Error parsing gradient settings:', error);
            }
        }
        
        // Always show/hide gradient settings based on enabled state
        this.updateGradientSettingsVisibility();
    }

    saveSettings() {
        try {
            const currentStops = Array.from(this.stops.entries()).map(([id, stop]) => ({
                id,
                color: stop.color,
                position: stop.position
            }));

            const settings = {
                enabled: document.getElementById('gradient-enabled')?.checked || false,
                stops: currentStops
            };

            localStorage.setItem('gradientSettings', JSON.stringify(settings));
        } catch (error) {
            console.error('Error saving gradient settings:', error);
        }
    }

    // Updated popup method: set the popup text color inline for better contrast
    showBgRemovalPopup(callback) {
        const overlay = document.createElement('div');
        overlay.className = 'popup-overlay';
        overlay.innerHTML = `
            <div class="popup-box">
                <p style="color: #000;">Enabling gradient will remove the background image. Do you want to proceed?</p>
                <div class="popup-buttons">
                    <button id="popup-no" class="popup-btn cancel">Cancel</button>
                    <button id="popup-yes" class="popup-btn confirm">Yes, remove image</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('#popup-yes').addEventListener('click', () => {
            callback(true);
            document.body.removeChild(overlay);
        });
        overlay.querySelector('#popup-no').addEventListener('click', () => {
            callback(false);
            document.body.removeChild(overlay);
        });
    }

    // In toggleGradient we now ensure the gradient settings are saved after confirming.
    toggleGradient() {
        const checkbox = document.getElementById('gradient-enabled');
        if (!checkbox) return;

        if (checkbox.checked) {
            // When enabling gradient, show confirmation if there's a background
            const bgImage = document.body.style.backgroundImage || localStorage.getItem('bgImage');
            if (bgImage && bgImage !== 'none') {
                this.showBgRemovalPopup((proceed) => {
                    if (proceed) {
                        document.body.style.backgroundImage = '';
                        localStorage.removeItem('bgImage');
                        this.enabled = true;
                        // Load saved gradient settings before applying
                        const savedSettings = localStorage.getItem('gradientSettings');
                        if (savedSettings) {
                            const settings = JSON.parse(savedSettings);
                            if (settings.stops) this.stops = settings.stops;
                            if (settings.angle) this.angle = settings.angle;
                        }
                        this.applyGradient();
                    } else {
                        checkbox.checked = false;
                        this.enabled = false;
                    }
                    this.updateGradientSettingsVisibility();
                    this.saveSettings();
                });
                return;
            }
        }
        
        this.enabled = checkbox.checked;
        if (this.enabled) {
            document.body.style.backgroundImage = '';
            // Load saved settings when enabling
            const savedSettings = localStorage.getItem('gradientSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                if (settings.stops) this.stops = settings.stops;
                if (settings.angle) this.angle = settings.angle;
            }
            this.applyGradient();
        } else {
            document.body.style.background = 'none';
        }
        this.updateGradientSettingsVisibility();
        this.saveSettings();
    }

    // Optional helper extracted for clarity
    loadSavedGradientSettings() {
        const savedSettings = JSON.parse(localStorage.getItem('gradientSettings'));
        if (savedSettings && Array.isArray(savedSettings.stops)) {
            this.stops = savedSettings.stops;
            this.angle = savedSettings.angle || 90;
        }
    }

    updateAngle(value) {
        // Debounce rapid changes to the angle input: clear previous timeout
        clearTimeout(this._updateAngleDebounce);
        this._updateAngleDebounce = setTimeout(() => {
            const newAngle = parseInt(value);
            if (isNaN(newAngle)) {
                console.warn('Invalid angle value:', value);
                return;
            }
            this.angle = newAngle;
            document.querySelector('#gradient-angle + .range-value').textContent = `${newAngle}°`;
        
            if (this.enabled && Array.isArray(this.stops) && this.stops.length >= 2) {
                // Use a sorted copy without mutating the stored stops
                const sortedStops = this.stops.slice().sort((a, b) => a.position - b.position);
                const gradientString = `linear-gradient(${this.angle}deg, ${sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ')})`;
                document.body.style.backgroundImage = gradientString;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundAttachment = 'fixed';
                const preview = document.getElementById('gradient-preview');
                if (preview) {
                    preview.style.background = gradientString;
                }
            }
            this.saveSettings();
            this.updateUI();
        }, 50); // 50ms debounce delay
    }

    updateDirection(value) {
        const angle = parseInt(value);
        if (!isNaN(angle)) {
            this.angle = angle;
            document.getElementById('gradient-angle').value = angle;
            document.querySelector('#gradient-angle + .range-value').textContent = `${angle}°`;
            this.applyGradient();
            this.saveSettings();
        }
    }

    addStop() {
        // Add a new stop with a default color
        this.stops.push({ color: '#ffffff', position: 0 });
        // Recalculate positions evenly across all stops
        const totalStops = this.stops.length;
        this.stops = this.stops.map((stop, index) => ({
            ...stop,
            position: Math.round((index / (totalStops - 1)) * 100)
        }));
        this.updateUI();
        this.applyGradient();
        this.saveSettings();
    }

    removeStop(index) {
        if (this.stops.length > 2) {
            this.stops.splice(index, 1);
            this.updateUI();
            this.applyGradient();
            this.saveSettings();
        }
    }

    updateStop(index, color, position) {
        let pos = parseInt(position);
        // Ensure the new stop's position has at least a 1% gap from its neighbors
        if (index > 0 && pos <= this.stops[index - 1].position) {
            pos = this.stops[index - 1].position + 1;
        }
        if (index < this.stops.length - 1 && pos >= this.stops[index + 1].position) {
            pos = this.stops[index + 1].position - 1;
        }
        this.stops[index].color = color;
        this.stops[index].position = pos;

        // Immediately sort the stored stops array
        this.stops.sort((a, b) => a.position - b.position);
        
        this.updateUI();
        this.applyGradient();
        this.saveSettings();
    }

    // Modify applyGradient to use a sorted copy rather than sorting in–place
    applyGradient() {
        if (!this.enabled) return;
        try {
            // Ensure stops is an array (convert if needed)
            if (!Array.isArray(this.stops)) {
                this.stops = Array.isArray(this.stops.values)
                    ? Array.from(this.stops.values())
                    : Array.from(this.stops);
            }
            if (!Array.isArray(this.stops) || this.stops.length < 2) {
                throw new Error('Invalid gradient stops');
            }
            // Use a sorted copy without mutating the stored stops
            const sortedStops = this.stops.slice().sort((a, b) => a.position - b.position);
            const gradientString = `linear-gradient(${this.angle}deg, ${sortedStops.map(stop => `${stop.color} ${stop.position}%`).join(', ')})`;
            
            const preview = document.getElementById('gradient-preview');
            if (preview) { preview.style.background = gradientString; }
            if (this.enabled) {
                document.body.style.backgroundImage = gradientString;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundAttachment = 'fixed';
            }
            
            // Send updated gradient to extension
            this.sendToExtensionWithRetry({
                type: 'UPDATE_GRADIENT',
                settings: { angle: this.angle, stops: this.stops }
            });
            
            this.saveSettings();
        } catch (error) {
            console.error('Error applying gradient:', error);
        }
    }

    async sendToExtensionWithRetry(message, attempts = 0) {
        const MAX_ATTEMPTS = 5;
        const DELAY = 1000;
        const EXTENSION_ID = 'oemfbiadnodoedigdccmifdljakjmcph';

        try {
            if (!chrome?.runtime?.sendMessage) {
                return;
            }

            await new Promise((resolve, reject) => {
                chrome.runtime.sendMessage(EXTENSION_ID, {
                    type: 'UPDATE_GRADIENT',
                    settings: message.settings
                }, response => {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return;
                    }
                    resolve(response);
                });
            });
        } catch (error) {
            if (attempts < MAX_ATTEMPTS) {
                await new Promise(resolve => setTimeout(resolve, DELAY));
                return this.sendToExtensionWithRetry(message, attempts + 1);
            }
        }
    }

    resetToDefaults() {
        this.stops = [
            { color: '#000035', position: 0 },
            { color: '#00bfa5', position: 100 }
        ];
        this.angle = 90;
        this.updateUI();
        this.applyGradient();
        this.saveSettings();
    }

    updateUI() {
        const container = document.getElementById('gradient-stops');
        if (!container) {
            console.warn('Gradient stops container not found');
            return;
        }

        // Ensure this.stops exists and is an array
        if (!Array.isArray(this.stops)) {
            console.warn('Stops array is invalid, resetting to defaults');
            this.stops = [
                { color: '#000035', position: 0 },
                { color: '#00bfa5', position: 100 }
            ];
        }

        container.innerHTML = this.stops.map((stop, index) => `
            <div class="gradient-stop">
                <input type="color" value="${stop.color}" 
                    onchange="gradientManager.updateStop(${index}, this.value, this.nextElementSibling.value)">
                <input type="number" min="0" max="100" value="${stop.position}" 
                    onchange="gradientManager.updateStop(${index}, this.previousElementSibling.value, this.value)">
                ${this.stops.length > 2 ? `
                    <button class="remove-stop" onclick="gradientManager.removeStop(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
            </div>
        `).join('');

        // Update enabled state with null check
        const checkbox = document.getElementById('gradient-enabled');
        if (checkbox) checkbox.checked = this.enabled;

        // Update angle with null check
        const angleInput = document.getElementById('gradient-angle');
        if (angleInput) {
            angleInput.value = this.angle;
            const angleDisplay = document.querySelector('#gradient-angle + .range-value');
            if (angleDisplay) angleDisplay.textContent = `${this.angle}°`;
        }
    }

    updateGradientSettingsVisibility() {
        const settings = document.getElementById('gradient-settings');
        if (settings) {
            settings.style.display = this.enabled ? 'block' : 'none';
        }
    }

    loadSavedGradient() {
        try {
            const saved = localStorage.getItem('gradientSettings');
            if (!saved) return;

            let settings;
            try {
                settings = JSON.parse(saved);
            } catch (e) {
                console.warn('Invalid gradient settings, resetting to defaults');
                this.initializeDefaultStops();
                return;
            }

            if (settings && settings.stops) {
                // Ensure stops is an array
                if (Array.isArray(settings.stops)) {
                    this.stops = new Map(settings.stops.map(s => [
                        s.id || `stop_${Date.now()}_${Math.random()}`,
                        { color: s.color, position: s.position, element: null }
                    ]));
                } else {
                    this.initializeDefaultStops();
                }
            }

            // ...rest of the function...
        } catch (error) {
            console.error('Error loading gradient:', error);
            this.initializeDefaultStops();
        }
    }
}

// Initialize only once and ensure it's available globally
if (!window.gradientManager) {
    window.gradientManager = new GradientManager();
}

// Update handleBgImageUpload in script2.js to properly handle gradient toggle
function handleBgImageUpload(file) {
    // ...existing code...
    if (window.gradientManager) {
        window.gradientManager.enabled = false;
        window.gradientManager.updateUI();
        window.gradientManager.updateGradientSettingsVisibility();
        window.gradientManager.saveSettings();
    }
    // ...existing code...
}

// Update removeBackground in script2.js
function removeBackground() {
    document.body.style.backgroundImage = '';
    localStorage.removeItem('bgImage');
    
    // Enable gradient when background is removed
    if (window.gradientManager) {
        window.gradientManager.enabled = true;
        const checkbox = document.getElementById('gradient-enabled');
        if (checkbox) {
            checkbox.checked = true;
        }
        window.gradientManager.updateUI();
        window.gradientManager.applyGradient();
        window.gradientManager.saveSettings();
    }
    
    // Update preview
    const preview = document.getElementById('bg-preview');
    if (preview) {
        preview.style.backgroundImage = 'none';
        preview.style.background = 'linear-gradient(90deg, #000035, #00bfa5)';
    }
}
