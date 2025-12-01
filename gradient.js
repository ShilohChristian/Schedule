// Defaults align to the logo gradient (#000035ff -> #c4ad62ff) with full opacity for picker compatibility.
const DEFAULT_START_COLOR = '#000035';
const DEFAULT_END_COLOR = '#c4ad62';
const toPickerColor = (color) => (color?.length === 9 ? color.slice(0, 7) : color);

class GradientManager {
    constructor() {
        if (window.gradientManager) return window.gradientManager;

        // Only two stops: start and end
        this.stops = [
            { color: DEFAULT_START_COLOR, position: 0 },
            { color: DEFAULT_END_COLOR, position: 100 }
        ];
        this.angle = 90;
        this.enabled = true;
        this.initialized = false;

        // Set color pickers to default immediately
        const startColorInput = document.getElementById('gradient-start-color');
        if (startColorInput) startColorInput.value = toPickerColor(DEFAULT_START_COLOR);
        const endColorInput = document.getElementById('gradient-end-color');
        if (endColorInput) endColorInput.value = toPickerColor(DEFAULT_END_COLOR);

        // Apply default gradient immediately if no background image
        if (!localStorage.getItem('bgImage')) {
            document.body.style.background = `linear-gradient(90deg, ${DEFAULT_START_COLOR} 0%, ${DEFAULT_END_COLOR} 100%)`;
        }

        window.gradientManager = this;
        this.loadSavedGradient();
    }

    async init() {
        try {
            // First check for extension settings via the content-script bridge
            const extensionData = await this.requestExtensionGradient();
            if (extensionData?.savedGradient) {
                const { angle, stops } = extensionData.savedGradient;
                this.stops = stops;
                this.angle = angle;
                this.enabled = true;
                await this.applyGradient();
                return;
            }

            // Only load start/end colors and angle
            const saved = localStorage.getItem('gradientSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                if (settings && settings.startColor && settings.endColor) {
                    this.stops = [
                        { color: settings.startColor, position: 0 },
                        { color: settings.endColor, position: 100 }
                    ];
                    this.angle = settings.angle || 90;
                    this.enabled = settings.enabled !== false;
                    if (this.enabled) {
                        await this.applyGradient();
                    }
                    return;
                }
            }
            // Defaults
            this.stops = [
                { color: DEFAULT_START_COLOR, position: 0 },
                { color: DEFAULT_END_COLOR, position: 100 }
            ];
            this.angle = 90;
            this.enabled = true;
            await this.applyGradient();
            this.saveSettings();
        } catch (error) {
            console.error('Error initializing gradient manager:', error);
            this.stops = [
                { color: DEFAULT_START_COLOR, position: 0 },
                { color: DEFAULT_END_COLOR, position: 100 }
            ];
            this.angle = 90;
            this.enabled = true;
            await this.applyGradient();
            this.saveSettings();
        }
    }

    requestExtensionGradient() {
        return new Promise((resolve) => {
            const requestId = `get-gradient-${Date.now()}-${Math.random().toString(16).slice(2)}`;
            const handler = (event) => {
                if (event.data?.type !== 'GRADIENT_RESPONSE') return;
                if (event.data?.requestId && event.data.requestId !== requestId) return;
                window.removeEventListener('message', handler);
                if (event.data?.success && event.data?.data) {
                    resolve(event.data.data);
                } else {
                    resolve(null);
                }
            };
            window.addEventListener('message', handler);
            try {
                window.postMessage({ type: 'GET_GRADIENT', requestId, bridge: 'shiloh-extension' }, '*');
            } catch (e) {
                console.warn('GradientManager: failed to post GET_GRADIENT', e);
                window.removeEventListener('message', handler);
                resolve(null);
            }
            setTimeout(() => {
                window.removeEventListener('message', handler);
                resolve(null);
            }, 1500);
        });
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

        // Use the correct color picker IDs
        const startColorInput = document.getElementById('gradient-start-color');
        if (startColorInput) {
            startColorInput.addEventListener('input', (e) => {
                this.stops[0].color = e.target.value;
                this.applyGradient();
                this.saveSettings();
                this.updateUI();
            });
        }
        const endColorInput = document.getElementById('gradient-end-color');
        if (endColorInput) {
            endColorInput.addEventListener('input', (e) => {
                this.stops[1].color = e.target.value;
                this.applyGradient();
                this.saveSettings();
                this.updateUI();
            });
        }
    }

    loadSettings() {
        const stored = localStorage.getItem('gradientSettings');
        if (stored) {
            try {
                const settings = JSON.parse(stored);
                if (settings && settings.startColor && settings.endColor) {
                    this.stops = [
                        { color: settings.startColor, position: 0 },
                        { color: settings.endColor, position: 100 }
                    ];
                    this.angle = settings.angle || 90;
                    this.enabled = settings.enabled !== false;
                    this.updateUI();
                    if (this.enabled) {
                        requestAnimationFrame(() => this.applyGradient());
                    }
                }
            } catch (error) {
                console.warn('Error parsing gradient settings:', error);
            }
        }
        
        this.updateGradientSettingsVisibility();
    }

    saveSettings() {
        try {
            localStorage.setItem('gradientSettings', JSON.stringify({
                enabled: this.enabled,
                angle: this.angle,
                startColor: this.stops[0].color,
                endColor: this.stops[1].color
            }));
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
                        const savedSettings = localStorage.getItem('gradientSettings');
                        if (savedSettings) {
                            const settings = JSON.parse(savedSettings);
                            if (settings.startColor) this.stops[0].color = settings.startColor;
                            if (settings.endColor) this.stops[1].color = settings.endColor;
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
            const savedSettings = localStorage.getItem('gradientSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                if (settings.startColor) this.stops[0].color = settings.startColor;
                if (settings.endColor) this.stops[1].color = settings.endColor;
                if (settings.angle) this.angle = settings.angle;
            }
            this.applyGradient();
        } else {
            document.body.style.background = 'none';
        }
        this.updateGradientSettingsVisibility();
        this.saveSettings();
        this.updatePreviewFallback();
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
        
            if (this.enabled) {
                const gradientString = `linear-gradient(${this.angle}deg, ${this.stops[0].color} 0%, ${this.stops[1].color} 100%)`;
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

    async applyGradient() {
        if (!this.enabled) return;
        try {
            // Build gradient string from current stops and angle
            const gradientString = `linear-gradient(${this.angle}deg, ${
                this.stops.map(stop => `${stop.color} ${stop.position}%`).join(', ')
            })`;
            document.body.style.background = gradientString;
            // Update preview if it exists
            const preview = document.getElementById('gradient-preview');
            if (preview) {
                preview.style.background = gradientString;
            }
            this.updatePreviewFallback();
            this.saveSettings();
        } catch (error) {
            console.error('Error applying gradient:', error);
        }
    }

    resetToDefaults() {
        this.stops = [
            { color: DEFAULT_START_COLOR, position: 0 },
            { color: DEFAULT_END_COLOR, position: 100 }
        ];
        this.angle = 90;
        this.updateUI();
        this.applyGradient();
        this.saveSettings();
    }

    updatePreviewFallback() {
        const frame = document.getElementById('bg-preview');
        if (!frame) return;
        const blur = frame.querySelector('.bg-preview-blur');
        const img = frame.querySelector('#bg-preview-img');
        if (blur) blur.style.backgroundImage = 'none';
        if (img) {
            img.src = '';
            img.style.opacity = '0';
        }
        const start = this.stops?.[0]?.color || DEFAULT_START_COLOR;
        const end = this.stops?.[1]?.color || DEFAULT_END_COLOR;
        frame.style.background = `linear-gradient(135deg, ${start}, ${end})`;
    }

    updateUI() {
        // Safely set color pickers to current stop colors, or default if missing
        const startColorInput = document.getElementById('gradient-start-color');
        const endColorInput = document.getElementById('gradient-end-color');
        let startColor = DEFAULT_START_COLOR;
        let endColor = DEFAULT_END_COLOR;

        if (Array.isArray(this.stops) && this.stops.length >= 2) {
            startColor = this.stops[0]?.color || startColor;
            endColor = this.stops[1]?.color || endColor;
        }

        if (startColorInput) startColorInput.value = toPickerColor(startColor);
        if (endColorInput) endColorInput.value = toPickerColor(endColor);

        // Hide gradient stops UI if present
        const stopsContainer = document.getElementById('gradient-stops');
        if (stopsContainer) stopsContainer.style.display = 'none';

        // Hide add-stop button if present
        const addStopBtn = document.getElementById('add-stop');
        if (addStopBtn) addStopBtn.style.display = 'none';

        const checkbox = document.getElementById('gradient-enabled');
        if (checkbox) checkbox.checked = this.enabled;
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
            // Keep the settings visible but toggle a disabled state so an overlay message
            // can be shown when gradients are turned off (or when a background image exists).
            const checkbox = document.getElementById('gradient-enabled');
            const shouldDisable = !this.enabled || (checkbox && !checkbox.checked);
            settings.style.display = 'block';
            settings.classList.toggle('disabled', shouldDisable);
            settings.setAttribute('aria-hidden', String(shouldDisable));
        }
        // Hide stops container always
        const stopsContainer = document.getElementById('gradient-stops');
        if (stopsContainer) stopsContainer.style.display = 'none';
        // Hide add-stop button if present
        const addStopBtn = document.getElementById('add-stop');
        if (addStopBtn) addStopBtn.style.display = 'none';
    }

    loadSavedGradient() {
        try {
            const saved = localStorage.getItem('gradientSettings');
            let settings;
            if (saved) {
                try {
                    settings = JSON.parse(saved);
                } catch (e) {
                    settings = null;
                }
            }
            // Only use saved settings if valid and not black
            if (
                settings &&
                settings.startColor &&
                settings.endColor &&
                settings.startColor !== '#000000' &&
                settings.endColor !== '#000000'
            ) {
                this.stops = [
                    { color: settings.startColor, position: 0 },
                    { color: settings.endColor, position: 100 }
                ];
                this.angle = settings.angle || 90;
                this.enabled = settings.enabled !== false;
            } else {
                // Always use defaults if missing or black
                this.stops = [
                    { color: DEFAULT_START_COLOR, position: 0 },
                    { color: DEFAULT_END_COLOR, position: 100 }
                ];
                this.angle = 90;
                this.enabled = true;
                // Overwrite any bad settings in localStorage
                localStorage.setItem('gradientSettings', JSON.stringify({
                    enabled: true,
                    angle: 90,
                    startColor: DEFAULT_START_COLOR,
                    endColor: DEFAULT_END_COLOR
                }));
            }
        } catch (error) {
            // Always use defaults on error
            this.stops = [
                { color: DEFAULT_START_COLOR, position: 0 },
                { color: DEFAULT_END_COLOR, position: 100 }
            ];
            this.angle = 90;
            this.enabled = true;
            localStorage.setItem('gradientSettings', JSON.stringify({
                enabled: true,
                angle: 90,
                startColor: DEFAULT_START_COLOR,
                endColor: DEFAULT_END_COLOR
            }));
        }
    }
}

// Initialize only once and ensure it's available globally
if (!window.gradientManager) {
    window.gradientManager = new GradientManager();
    // Ensure the manager wires up UI listeners and applies saved settings
    // `setupManager` waits for DOM elements if they aren't present yet.
    try { window.gradientManager.setupManager(); } catch (e) { console.debug('setupManager call failed', e); }
    try { window.gradientManager.init?.(); } catch (e) { console.debug('gradientManager.init failed', e); }
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
        preview.style.background = `linear-gradient(90deg, ${DEFAULT_START_COLOR}, ${DEFAULT_END_COLOR})`;
    }
}

// Guard clause added to applyGradient to prevent errors when settings or settings.values is undefined
GradientManager.applyGradient = function(settings) {
    if (!settings || !settings.values) {
        console.error("GradientManager.applyGradient: settings or settings.values is undefined. Using default gradient.");
        document.body.style.background = `linear-gradient(135deg, ${DEFAULT_START_COLOR} 0%, ${DEFAULT_END_COLOR} 100%)`;
        return;
    }
    // ...existing code...
    // (rest of applyGradient logic)
}
