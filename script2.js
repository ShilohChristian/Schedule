// Global variables
let activeStop = null;
let dropOverlay = null;

// Add this at the start of the file
function waitForAuth() {
    return new Promise((resolve) => {
        const checkAuth = () => {
            if (window.authManager) {
                resolve(window.authManager);
            } else {
                setTimeout(checkAuth, 50);
            }
        };
        checkAuth();
    });
}

// Add a check for auth manager availability
function getAuthManager() {
    return new Promise((resolve) => {
        const check = () => {
            if (window.authManager) {
                resolve(window.authManager);
            } else {
                setTimeout(check, 50);
            }
        };
        check();
    });
}

// Settings Management
function toggleSettingsSidebar() {
    const sidebar = document.getElementById("settings-sidebar");
    sidebar.classList.toggle("open");
    
    // Save settings when closing the sidebar
    if (!sidebar.classList.contains("open")) {
        saveSettings();
    }
}

// Add missing helper function
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
}

// Add these functions at the start of the file
function saveBackground(imageData) {
    try {
        // First, try to remove any existing background
        localStorage.removeItem('bgImage');
        
        // Then save the new background
        localStorage.setItem('bgImage', imageData);
        
        // Verify the save was successful
        const savedData = localStorage.getItem('bgImage');
        if (!savedData) {
            throw new Error('Background save verification failed');
        }
        
        console.log('Background saved successfully');
        return true;
    } catch (error) {
        console.error('Error saving background:', error);
        return false;
    }
}

function loadBackground() {
    try {
        const bgImage = localStorage.getItem('bgImage');
        if (!bgImage) return false;

        // Create a test image to verify the data
        const img = new Image();
        img.onload = function() {
            document.body.style.backgroundImage = `url('${bgImage}')`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundRepeat = 'no-repeat';
        };
        img.onerror = function() {
            console.error('Failed to load background image');
            localStorage.removeItem('bgImage');
            return false;
        };
        img.src = bgImage;
        
        return true;
    } catch (error) {
        console.error('Error loading background:', error);
        return false;
    }
}

// Modify your loadSettings function
async function loadSettings() {
    await waitForAuth(); // Wait for auth
    // Try loading settings from Firestore first
    const firestoreSettings = await loadUserSettings();
    if (firestoreSettings) {
        console.log("Applying settings from Firestore");
        // Use values from firestoreSettings instead of localStorage:
        const fontColor = firestoreSettings.fontColor || "#ffffff";
        document.getElementById('font-color').value = fontColor;
        document.getElementById('countdown-heading').style.color = fontColor;
        // (Apply other settings similarly as needed)
    } else {
        console.log("No Firestore settings found. Falling back to localStorage.");
        // Fallback: load settings from localStorage
        const fontColor = localStorage.getItem("fontColor") || "#ffffff";
        document.getElementById('font-color').value = fontColor;
        document.getElementById('countdown-heading').style.color = fontColor;
    }
    
    // ...existing loading logic for background, white box, shadow, progress bar, etc.
    const storedBgImage = localStorage.getItem('bgImage');
    if (storedBgImage) {
        document.body.style.backgroundImage = `url('${storedBgImage}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        document.body.style.backgroundAttachment = 'fixed';
        
        // Update preview if it exists
        const preview = document.getElementById('bg-preview');
        if (preview) {
            preview.style.backgroundImage = `url('${storedBgImage}')`;
            preview.style.backgroundSize = 'cover';
            preview.style.backgroundPosition = 'center';
        }
        
        // Ensure gradient is disabled
        if (window.gradientManager) {
            window.gradientManager.enabled = false;
            window.gradientManager.updateUI();
        }
    }

    // Load other settings
    loadWhiteBoxSettings();
    loadShadowSettings();
    loadProgressBarSettings(); // Add this line

    // Load saved font
    const savedFont = localStorage.getItem('fontFamily');
    if (savedFont) {
        document.body.style.fontFamily = savedFont;
        const fontSelect = document.getElementById('font-family');
        if (fontSelect) {
            fontSelect.value = savedFont;
        }
    }

    // Load background image and update preview
    const bgImage = localStorage.getItem('bgImage');
    const preview = document.getElementById('bg-preview');
    
    if (bgImage && preview) {
        preview.style.backgroundImage = `url('${bgImage}')`;
        preview.style.backgroundSize = 'cover';
        preview.style.backgroundPosition = 'center';
    } else if (preview) {
        preview.style.backgroundImage = 'none';
        preview.style.background = 'linear-gradient(to bottom, #000035, #00bfa5)';
    }

    // Load and apply saved font color
    const savedFontColor = localStorage.getItem('fontColor') || '#ffffff';
    document.getElementById('font-color').value = savedFontColor;
    document.getElementById('countdown-heading').style.color = savedFontColor;

    updateAuthButtonText(); // Add this line

    // Load profile visibility state
    const isProfileHidden = localStorage.getItem('profileHidden') === 'true';
    const visibilityToggle = document.getElementById('profile-visibility-toggle');
    if (visibilityToggle) {
        visibilityToggle.checked = !isProfileHidden;
    }
}

function loadWhiteBoxSettings() {
    const savedColor = localStorage.getItem("whiteBoxColor") || "rgba(255, 255, 255, 0.9)";
    const savedOpacity = localStorage.getItem("whiteBoxOpacity") || "90";
    const whiteBoxTextColor = localStorage.getItem("whiteBoxTextColor") || "#000035";
    
    document.querySelector(".schedule-container").style.backgroundColor = savedColor;
    document.querySelector(".schedule-container").style.color = whiteBoxTextColor;
    document.getElementById("white-box-heading").style.color = whiteBoxTextColor;
    
    // Set input values
    const colorMatch = savedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (colorMatch) {
        const [r, g, b] = [colorMatch[1], colorMatch[2], colorMatch[3]].map(Number);
        document.getElementById("white-box-color").value = rgbToHex(r, g, b);
    }
    
    document.getElementById("white-box-opacity").value = savedOpacity;
    document.getElementById("white-box-text-color").value = whiteBoxTextColor;
    
    // Update opacity display
    const opacityDisplay = document.querySelector('#white-box-opacity + .range-value');
    if (opacityDisplay) {
        opacityDisplay.textContent = `${savedOpacity}%`;
    }
}

// Add helper function for RGB to Hex conversion
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// UI Controls
// Simplified image handling
function handleBgImageUpload(file) {
    if (!file) {
        console.error('No file provided');
        return;
    }

    // Reset any active states
    dropOverlay?.classList.remove('active');
    document.getElementById('bg-image-drop-area')?.classList.remove('drag-over');

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
    }

    // Disable gradient if enabled
    if (window.gradientManager) {
        const checkbox = document.getElementById('gradient-enabled');
        if (checkbox && checkbox.checked) {
            checkbox.checked = false;
            window.gradientManager.toggleGradient();
        }
    }

    // Show processing overlay
    showProcessingOverlay();

    // Process the image
    const reader = new FileReader();
    reader.onload = function(e) {
        processUploadedImage(e.target.result, file.type);
    };
    reader.onerror = function() {
        hideProcessingOverlay();
        alert('Error reading file');
    };

    try {
        reader.readAsDataURL(file);
    } catch (error) {
        hideProcessingOverlay();
        alert('Error reading file');
    }
}

// Modified processUploadedImage function to call applyAndSaveImage instead of applyUploadedImage
function processUploadedImage(dataUrl, fileType) {
    const img = new Image();
    
    img.onload = function() {
        try {
            // For GIFs and SVGs, use original file
            if (fileType === 'image/gif' || fileType === 'image/svg+xml') {
                applyAndSaveImage(dataUrl); // Replaced applyUploadedImage with applyAndSaveImage
                return;
            }

            // For other formats, compress
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            let { width, height } = calculateImageDimensions(img.width, img.height);
            canvas.width = width;
            canvas.height = height;
            
            ctx.drawImage(img, 0, 0, width, height);
            const compressedImage = canvas.toDataURL(fileType, 0.7);
            
            applyAndSaveImage(compressedImage);
        } catch (error) {
            console.error('Error processing image:', error);
            hideProcessingOverlay();
            alert('Error processing image');
        }
    };
    
    img.onerror = function() {
        hideProcessingOverlay();
        alert('Invalid image file');
    };
    
    img.src = dataUrl;
}

function applyAndSaveImage(imageData) {
    try {
        // Update preview
        const preview = document.getElementById('bg-preview');
        if (preview) {
            preview.style.backgroundImage = `url('${imageData}')`;
            preview.style.backgroundSize = 'cover';
            preview.style.backgroundPosition = 'center';
        }
        
        // Apply to body
        document.body.style.backgroundImage = `url('${imageData}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        
        // Save to localStorage
        localStorage.setItem('bgImage', imageData);
        
        // Show success message
        showSuccessMessage();
    } catch (error) {
        console.error('Error applying image:', error);
        alert('Error applying image');
    } finally {
        hideProcessingOverlay();
    }
}

function showProcessingOverlay() {
    let overlay = document.querySelector('.processing-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'processing-overlay';
        overlay.innerHTML = `
            <div class="processing-content">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Processing image...</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    overlay.classList.add('active');
}

function hideProcessingOverlay() {
    const overlay = document.querySelector('.processing-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

function showSuccessMessage() {
    const successMessage = document.createElement('div');
    successMessage.className = 'upload-success';
    successMessage.innerHTML = '<i class="fas fa-check-circle"></i> Image uploaded successfully!';
    
    const dropArea = document.getElementById('bg-image-drop-area');
    if (dropArea && dropArea.parentNode) {
        const existingMessage = dropArea.parentNode.querySelector('.upload-success');
        if (existingMessage) {
            existingMessage.remove();
        }
        dropArea.parentNode.insertBefore(successMessage, dropArea.nextSibling);
        setTimeout(() => successMessage.remove(), 3000);
    }
}

function applyImageBackground(imageUrl) {
    if (!imageUrl) return;
    
    // Set background properties
    document.body.style.backgroundImage = `url('${imageUrl}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.style.backgroundAttachment = 'fixed';
    
    // Save to localStorage
    localStorage.setItem('bgImage', imageUrl);
    
    // Update preview if it exists
    const preview = document.getElementById('bg-preview');
    if (preview) {
        preview.style.backgroundImage = `url('${imageUrl}')`;
        preview.style.backgroundSize = 'cover';
        preview.style.backgroundPosition = 'center';
    }

    // Disable gradient if it's enabled
    if (window.gradientManager) {
        window.gradientManager.enabled = false;
        window.gradientManager.updateUI();
        window.gradientManager.saveSettings();
    }
}

function clearBackgrounds() {
    // Modified to only reset backgroundImage, not the gradient
    document.body.style.backgroundImage = 'none';
}

function applyGradientBackground(settings) {
    // Clear any existing background image
    document.body.style.backgroundImage = '';
    localStorage.removeItem("bgImage");

    let gradientString = `linear-gradient(${settings.direction}, `;
    settings.stops.forEach((stop, index) => {
        gradientString += `${stop.color} ${stop.position}%`;
        if (index < settings.stops.length - 1) {
            gradientString += ', ';
        }
    });
    gradientString += ')';
    
    document.body.style.background = gradientString;
    document.body.style.opacity = settings.opacity / 100;
}

function removeBackground() {
    // First check if there's actually a background to remove
    const hasBackground = document.body.style.backgroundImage || localStorage.getItem('bgImage');
    if (!hasBackground || hasBackground === 'none') return;

    // Clear the background
    document.body.style.backgroundImage = '';
    localStorage.removeItem('bgImage');
    
    // Enable gradient with a small delay to ensure proper state update
    setTimeout(() => {
        if (window.gradientManager) {
            window.gradientManager.enabled = true;
            const checkbox = document.getElementById('gradient-enabled');
            if (checkbox) checkbox.checked = true;
            
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
    }, 50);
}

function updateWhiteBoxColor() {
    const color = document.getElementById("white-box-color").value;
    const opacity = document.getElementById("white-box-opacity").value;
    const rgb = hexToRgb(color);
    const rgba = `rgba(${rgb}, ${opacity / 100})`;
    
    document.querySelector(".schedule-container").style.backgroundColor = rgba;
    
    // Update opacity display
    const opacityDisplay = document.querySelector('#white-box-opacity + .range-value');
    if (opacityDisplay) {
        opacityDisplay.textContent = `${opacity}%`;
    }
    
    // Save both color and opacity
    localStorage.setItem("whiteBoxColor", rgba);
    localStorage.setItem("whiteBoxOpacity", opacity);
    saveSettings();
}

function updateWhiteBoxTextColor() {
    const whiteBoxTextColor = document.getElementById("white-box-text-color").value;
    const whiteBoxHeading = document.getElementById("white-box-heading");
    whiteBoxHeading.style.color = whiteBoxTextColor;
    document.querySelector(".schedule-container").style.color = whiteBoxTextColor; // Change text color in the white box
    localStorage.setItem("whiteBoxTextColor", whiteBoxTextColor); // Save to local storage
    saveSettings();
}

// Shadow System
function updateTimerShadow() {
    const checkbox = document.getElementById("timer-shadow");
    const timerElement = document.getElementById("current-period-time");
    const previewElement = document.getElementById("shadow-preview");
    const content = document.getElementById("shadow-settings-content");
    
    if (!checkbox || !timerElement || !previewElement || !content) {
        console.error('Required elements not found');
        return;
    }

    // Get all shadow settings
    const settings = {
        enabled: checkbox.checked,
        color: document.getElementById("shadow-color")?.value || "#000000",
        opacity: document.getElementById("shadow-opacity")?.value || 50,
        blur: document.getElementById("shadow-blur")?.value || 4,
        distance: document.getElementById("shadow-distance")?.value || 2,
        angle: document.getElementById("shadow-angle")?.value || 45
    };

    // Toggle content visibility
    content.classList.toggle("show", settings.enabled);

    if (!settings.enabled) {
        timerElement.style.textShadow = 'none';
        previewElement.style.textShadow = 'none';
    } else {
        // Calculate shadow
        const angleRad = (settings.angle * Math.PI) / 180;
        const x = Math.cos(angleRad) * settings.distance;
        const y = Math.sin(angleRad) * settings.distance;
        const rgba = `rgba(${hexToRgb(settings.color)}, ${settings.opacity / 100})`;
        const shadowValue = `${x}px ${y}px ${settings.blur}px ${rgba}`;
        
        // Apply shadow
        timerElement.style.textShadow = shadowValue;
        previewElement.style.textShadow = shadowValue;

        // Update range value displays
        updateRangeValues(settings);
    }

    // Save settings
    localStorage.setItem("timerShadowSettings", JSON.stringify(settings));
    saveSettings();
}

function updateRangeValues(settings) {
    const rangeLabels = {
        'shadow-opacity': ['%', settings.opacity],
        'shadow-blur': ['px', settings.blur],
        'shadow-distance': ['px', settings.distance],
        'shadow-angle': ['°', settings.angle]
    };

    for (const [id, [unit, value]] of Object.entries(rangeLabels)) {
        const rangeValue = document.querySelector(`[for="${id}"] + input + .range-value`);
        if (rangeValue) {
            rangeValue.textContent = `${value}${unit}`;
        }
    }
}

function loadShadowSettings() {
    const savedSettings = JSON.parse(localStorage.getItem("timerShadowSettings")) || {
        enabled: false,
        color: "#000000",
        opacity: 50,
        blur: 4,
        distance: 2,
        angle: 45
    };

    // Set checkbox state
    const checkbox = document.getElementById("timer-shadow");
    const content = document.getElementById("shadow-settings-content");
    const timerElement = document.getElementById("current-period-time");
    const previewElement = document.getElementById("shadow-preview");
    
    // Set all input values
    document.getElementById("shadow-color").value = savedSettings.color;
    document.getElementById("shadow-opacity").value = savedSettings.opacity;
    document.getElementById("shadow-blur").value = savedSettings.blur;
    document.getElementById("shadow-distance").value = savedSettings.distance;
    document.getElementById("shadow-angle").value = savedSettings.angle;

    // Update the range value displays
    document.querySelector('[for="shadow-opacity"] + input + .range-value').textContent = savedSettings.opacity + '%';
    document.querySelector('[for="shadow-blur"] + input + .range-value').textContent = savedSettings.blur + 'px';
    document.querySelector('[for="shadow-distance"] + input + .range-value').textContent = savedSettings.distance + 'px';
    document.querySelector('[for="shadow-angle"] + input + .range-value').textContent = savedSettings.angle + '°';

    // Set the checkbox state and show/hide settings
    checkbox.checked = savedSettings.enabled;
    if (savedSettings.enabled) {
        content.classList.add("show");
        // Calculate and apply the shadow
        const angleRad = (savedSettings.angle * Math.PI) / 180;
        const x = Math.cos(angleRad) * savedSettings.distance;
        const y = Math.sin(angleRad) * savedSettings.distance;
        const rgba = `rgba(${hexToRgb(savedSettings.color)}, ${savedSettings.opacity / 100})`;
        const shadowValue = `${x}px ${y}px ${savedSettings.blur}px ${rgba}`;
        
        timerElement.style.textShadow = shadowValue;
        previewElement.style.textShadow = shadowValue;
    } else {
        content.classList.remove("show");
        timerElement.style.textShadow = 'none';
        previewElement.style.textShadow = 'none';
    }
}

function toggleShadowSettings() {
    const content = document.getElementById("shadow-settings-content");
    if (!content) {
        console.error('Shadow settings content not found');
        return;
    }
    content.classList.toggle("show");
}

// Replace this function in script2.js
function toggleDropdown(contentId, toggleId) {
    const content = document.getElementById(contentId);
    const toggle = document.getElementById(toggleId);
    if (!content || !toggle) {
        console.error('Dropdown elements not found:', { contentId, toggleId });
        return;
    }

    // First close any other open dropdowns
    document.querySelectorAll('.dropdown-content.show').forEach(dropdown => {
        if (dropdown.id !== contentId) {
            dropdown.classList.remove('show');
            const otherToggle = document.getElementById(dropdown.id.replace('-content', '-toggle'));
            if (otherToggle) {
                otherToggle.classList.remove('active');
            }
        }
    });

    // Now toggle the clicked dropdown
    content.classList.toggle('show');
    toggle.classList.toggle('active');

    // Special handling for rename periods dropdown
    if (contentId === 'rename-periods-content' && content.classList.contains('show')) {
        populateRenamePeriods();
    }
}

function closeOtherDropdowns(exceptContent) {
    document.querySelectorAll('.dropdown-content.show').forEach(content => {
        if (content !== exceptContent) {
            content.classList.remove('show');
            const toggle = content.previousElementSibling;
            if (toggle && toggle.classList.contains('dropdown-toggle')) {
                toggle.classList.remove('active');
            }
        }
    });
}

// Event Listeners
document.addEventListener("DOMContentLoaded", function() {
    console.log('DOM Content Loaded');
    
    const dropArea = document.getElementById("bg-image-drop-area");
    const bgInput = document.getElementById("bg-image");
    
    console.log('Drop area element:', dropArea);
    console.log('File input element:', bgInput);

    if (dropArea && bgInput) {
        // Handle drag and drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Drag event:', eventName);
                
                if (eventName === 'dragenter' || eventName === 'dragover') {
                    dropArea.classList.add('drag-over');
                } else {
                    dropArea.classList.remove('drag-over');
                }
            });
        });

        // Handle drop
        dropArea.addEventListener('drop', function(e) {
            console.log('File dropped');
            const file = e.dataTransfer.files[0];
            if (file) handleBgImageUpload(file);
        });

        // Handle click upload
        dropArea.addEventListener('click', function() {
            console.log('Drop area clicked');
            bgInput.click();
        });

        bgInput.addEventListener('change', function(e) {
            console.log('File input changed');
            const file = e.target.files[0];
            if (file) handleBgImageUpload(file);
        });
    }

    loadSettings();
    loadShadowSettings();
    loadCountdownColor();
    loadGradientDirection();
    setupDropdownListeners();
    
    // Load saved background
    const savedBg = localStorage.getItem('bgImage');
    if (savedBg) {
        applyImageBackground(savedBg);
    }
    
    // Initialize shadow settings if enabled
    const savedSettings = JSON.parse(localStorage.getItem("timerShadowSettings"));
    if (savedSettings && savedSettings.enabled) {
        const content = document.getElementById("shadow-settings-content");
        if (content) {
            content.classList.add("show");
        }
    }
    
    // Add click handler for rename periods toggle
    const renamePeriodsToggle = document.getElementById('rename-periods-toggle');
    if (renamePeriodsToggle) {
        renamePeriodsToggle.addEventListener('click', function() {
            const content = document.getElementById('rename-periods-content');
            const isOpen = content.classList.contains('show');
            
            // Close all dropdowns first
            document.querySelectorAll('.dropdown-content').forEach(el => {
                el.classList.remove('show');
            });
            document.querySelectorAll('.dropdown-toggle').forEach(el => {
                el.classList.remove('active');
            });
            
            // Toggle current dropdown
            if (!isOpen) {
                content.classList.add('show');
                this.classList.add('active');
                populateRenamePeriods();
            }
        });
    }

    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.getElementById('settings-sidebar').classList.add('light-mode');
        const icon = document.querySelector('.theme-toggle i');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }

    // Add event listeners for progress bar inputs
    document.getElementById('progress-bar-color')?.addEventListener('input', updateProgressBarStyle);
    document.getElementById('progress-bar-opacity')?.addEventListener('input', updateProgressBarStyle);
    
    // Initialize progress bar if enabled
    if (localStorage.getItem('progressBarEnabled') === 'true') {
        const checkbox = document.getElementById('progress-bar');
        if (checkbox) {
            checkbox.checked = true;
            createProgressBar();
            updateProgressBarStyle();
        }
    }

    // Add drop overlay to body
    dropOverlay = document.createElement('div');
    dropOverlay.className = 'drop-overlay';
    dropOverlay.innerHTML = `
        <div class="drop-content">
            <i class="fas fa-cloud-upload-alt"></i>
            <p class="drop-text">Drop your image here</p>
            <p class="drop-subtext">Release to upload background</p>
        </div>
    `;
    document.body.appendChild(dropOverlay);

    // Handle drag and drop for the entire document
    document.addEventListener('dragenter', function(e) {
        e.preventDefault();
        if (dropOverlay && !document.getElementById('settings-sidebar').classList.contains('open')) {
            dropOverlay.classList.add('active');
        }
    });

    document.addEventListener('dragleave', function(e) {
        e.preventDefault();
        if (e.target === document.documentElement) {
            dropOverlay?.classList.remove('active');
        }
    });

    document.addEventListener('dragover', function(e) {
        e.preventDefault();
    });

    document.addEventListener('drop', function(e) {
        e.preventDefault();
        dropOverlay.classList.remove('active');
        const file = e.dataTransfer.files[0];
        if (file) handleBgImageUpload(file);
    });

    // Ensure drop overlay is only shown when settings are closed
    const settingsSidebar = document.getElementById('settings-sidebar');
    if (settingsSidebar) {
        settingsSidebar.addEventListener('transitionend', function() {
            if (!this.classList.contains('open')) {
                dropOverlay?.classList.remove('active');
            }
        });
    }

    // Setup drag and drop handling
    setupDragAndDrop();

    // Add font color change handler
    document.getElementById('font-color')?.addEventListener('input', function(e) {
        const color = e.target.value;
        document.getElementById('countdown-heading').style.color = color;
        localStorage.setItem('fontColor', color);
        saveSettings();
    });

    updateAuthButtonText();
});

function setupDropdownListeners() {
    // Set up click handlers for the dropdown toggles
    document.getElementById('rename-periods-toggle')?.addEventListener('click', () => {
        toggleDropdown('rename-periods-content', 'rename-periods-toggle');
        populateRenamePeriods(); // Populate rename periods when the dropdown is opened
    });
    document.getElementById('custom-schedule-toggle')?.addEventListener('click', () => toggleDropdown('custom-schedule-content', 'custom-schedule-toggle'));
    
    // Remove the old event listeners first
    const timerShadowCheckbox = document.getElementById('timer-shadow');
    if (timerShadowCheckbox) {
        timerShadowCheckbox.removeEventListener('change', toggleShadowSettings);
        timerShadowCheckbox.addEventListener('change', function() {
            toggleShadowSettings();
            updateTimerShadow();
        });
    }
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Add this new function
function loadCountdownColor() {
    const countdownColor = localStorage.getItem("countdownColor") || "#ffffff";
    const countdownElement = document.getElementById("current-period-time");
    if (countdownElement) {
        countdownElement.style.color = countdownColor;
    }
    
    const colorInput = document.getElementById("countdown-color");
    if (colorInput) {
        colorInput.value = countdownColor;
    }
}

// Add this new function
function updateCountdownColor() {
    const color = document.getElementById("countdown-color").value;
    document.getElementById("current-period-time").style.color = color;
    localStorage.setItem("countdownColor", color);
    saveSettings();
}

// Also add this new function since it's referenced but missing
function loadGradientDirection() {
    const direction = localStorage.getItem("gradientDirection") || "to bottom";
    const directionSelect = document.getElementById("gradient-direction");
    if (directionSelect) {
        directionSelect.value = direction;
    }
}

function populateRenamePeriods() {
    const renamePeriodsContent = document.getElementById("rename-periods-content");
    if (!renamePeriodsContent) {
        console.error('Rename periods content not found');
        return;
    }
    
    renamePeriodsContent.innerHTML = ''; // Clear existing content

    currentSchedule.forEach((period, index) => {
        if (period.name !== "Passing" && period.name !== "Lunch") {
            const periodDiv = document.createElement("div");
            periodDiv.className = "rename-period";
            periodDiv.innerHTML = `
                <label for="rename-period-${index}">Rename ${period.name}:</label>
                <input type="text" id="rename-period-${index}" value="${period.name}" onchange="renamePeriod(${index}, this.value)">
            `;
            renamePeriodsContent.appendChild(periodDiv);
        }
    });
}

function renamePeriod(index, newName) {
    if (index >= 0 && index < currentSchedule.length) {
        currentSchedule[index].name = newName;
        updateScheduleDisplay();
        updateCountdowns();
        localStorage.setItem('currentSchedule', JSON.stringify(currentSchedule)); // Save renamed periods
        saveSettings();
    }
}

// Add new gradient functionality

// Remove all gradient-related functions
/* Remove these functions:
- updateGradient()
- setDefaultGradient()
- initGradientEditor()
- toggleGradientControls()
- toggleGradientEditor()
- showGradientConfirmDialog()
- handleGradientConfirm()
- initGradientControls()
- applyGradientToggle()
- GradientControls class
*/

// Progress Bar Functions
function toggleProgressBar() {
    const checkbox = document.getElementById('progress-bar');
    const settings = document.getElementById('progress-bar-settings');
    
    if (checkbox.checked) {
        settings.style.display = 'block';
        createProgressBar();
        updateProgressBarStyle();
    } else {
        settings.style.display = 'none';
        removeProgressBar();
    }
    
    // Save preference
    localStorage.setItem('progressBarEnabled', checkbox.checked);
    saveSettings();
}

function createProgressBar() {
    removeProgressBar(); // Remove any existing progress bar first
    
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-overlay';
    document.body.insertBefore(progressBar, document.body.firstChild);
    
    const color = document.getElementById('progress-bar-color')?.value || '#00bfa5';
    const opacity = document.getElementById('progress-bar-opacity')?.value || '20';
    
    progressBar.style.backgroundColor = `rgba(${hexToRgb(color)}, ${opacity / 100})`;
    
    // Start the update loop
    updateProgressBar();
    
    // Update progress bar when switching periods
    if (window.progressInterval) {
        clearInterval(window.progressInterval);
    }
    window.progressInterval = setInterval(updateProgressBar, 1000);
}

function updateProgressBarStyle() {
    const progressBar = document.querySelector('.progress-overlay');
    if (!progressBar) return;
    
    const color = document.getElementById('progress-bar-color').value;
    const opacity = document.getElementById('progress-bar-opacity').value;
    
    progressBar.style.backgroundColor = `rgba(${hexToRgb(color)}, ${opacity / 100})`;
    
    // Update opacity display
    const opacityDisplay = document.querySelector('#progress-bar-opacity + .range-value');
    if (opacityDisplay) {
        opacityDisplay.textContent = `${opacity}%`;
    }
    
    // Save settings
    localStorage.setItem('progressBarColor', color);
    localStorage.setItem('progressBarOpacity', opacity);
    saveSettings();
}

function updateProgressBar() {
    const progressBar = document.querySelector('.progress-overlay');
    if (!progressBar) return;
    
    const now = new Date();
    const currentTimeInSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    
    // Find current period
    let currentPeriod = currentSchedule.find(period => {
        const startTime = getTimeInSeconds(period.start);
        const endTime = getTimeInSeconds(period.end);
        return currentTimeInSeconds >= startTime && currentTimeInSeconds < endTime;
    });

    if (currentPeriod) {
        // We're in a period
        const startTime = getTimeInSeconds(currentPeriod.start);
        const endTime = getTimeInSeconds(currentPeriod.end);
        const totalDuration = endTime - startTime;
        const elapsed = currentTimeInSeconds - startTime;
        const progress = (elapsed / totalDuration) * 100;
        progressBar.style.width = `${progress}%`;
        return;
    }

    // Find the next period
    let nextPeriod = currentSchedule.find(period => 
        getTimeInSeconds(period.start) > currentTimeInSeconds
    );

    // If there's no next period, we've reached the end of the day
    if (!nextPeriod) {
        // Use the first period of tomorrow
        nextPeriod = currentSchedule[0];
        
        // Calculate progress through the overnight period
        const lastPeriodEnd = getTimeInSeconds(currentSchedule[currentSchedule.length - 1].end);
        const nextDayStart = getTimeInSeconds(nextPeriod.start) + (24 * 3600);
        const totalDuration = nextDayStart - lastPeriodEnd;
        const elapsed = currentTimeInSeconds - lastPeriodEnd;
        const progress = (elapsed / totalDuration) * 100;
        
        progressBar.style.width = `${progress}%`;
        return;
    }

    // We're in between periods
    const previousPeriod = [...currentSchedule]
        .reverse()
        .find(period => getTimeInSeconds(period.end) <= currentTimeInSeconds);

    if (previousPeriod) {
        const freeStart = getTimeInSeconds(previousPeriod.end);
        const freeEnd = getTimeInSeconds(nextPeriod.start);
        const totalDuration = freeEnd - freeStart;
        const elapsed = currentTimeInSeconds - freeStart;
        const progress = (elapsed / totalDuration) * 100;
        progressBar.style.width = `${progress}%`;
    } else {
        // Before first period of the day
        const firstPeriodStart = getTimeInSeconds(nextPeriod.start);
        const totalDuration = firstPeriodStart;
        const elapsed = currentTimeInSeconds;
        const progress = (elapsed / totalDuration) * 100;
        progressBar.style.width = `${progress}%`;
    }
}

// Add to the loadSettings function
function loadProgressBarSettings() {
    const enabled = localStorage.getItem('progressBarEnabled') === 'true';
    const color = localStorage.getItem('progressBarColor') || '#000000'; // Changed default to black
    const opacity = localStorage.getItem('progressBarOpacity') || '20';
    
    const checkbox = document.getElementById('progress-bar');
    const colorInput = document.getElementById('progress-bar-color');
    const opacityInput = document.getElementById('progress-bar-opacity');
    const settings = document.getElementById('progress-bar-settings');
    
    if (checkbox && colorInput && opacityInput) {
        checkbox.checked = enabled;
        colorInput.value = color;
        opacityInput.value = opacity;
        settings.style.display = enabled ? 'block' : 'none';
        
        if (enabled) {
            createProgressBar();
            updateProgressBarStyle();
        }
    }
}

// Modify the existing startCountdown function to include progress bar updates
function startCountdown() {
    updateCountdowns();
    updateProgressBar(); // Add this line
    return setInterval(() => {
        updateCountdowns();
        updateProgressBar(); // Add this line
    }, 1000);
}

function updateFont() {
    const fontFamily = document.getElementById('font-family').value;
    document.body.style.fontFamily = fontFamily;
    localStorage.setItem('fontFamily', fontFamily);
    saveSettings();
}

// ...existing code...

// ...existing code...

function toggleTheme() {
    const sidebar = document.getElementById('settings-sidebar');
    const icon = document.querySelector('.theme-toggle i');
    const text = document.querySelector('.theme-toggle-text');
    
    sidebar.classList.toggle('light-mode');
    
    // Update icon, text and save preference
    if (sidebar.classList.contains('light-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        text.textContent = 'Light Mode';
        localStorage.setItem('theme', 'light');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        text.textContent = 'Dark Mode';
        localStorage.setItem('theme', 'dark');
    }

    // Add smooth transition effect
    icon.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        icon.style.transform = '';
    }, 300);
}

// Add the new navigation functionality
function initializeSettingsPanels() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items and panels
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            document.querySelectorAll('.settings-panel').forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked item and corresponding panel
            item.classList.add('active');
            const targetPanel = document.getElementById(`${item.dataset.target}-panel`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
}

// Update the theme loading code
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const sidebar = document.getElementById('settings-sidebar');
    const icon = document.querySelector('.theme-toggle i');
    const text = document.querySelector('.theme-toggle-text');
    
    if (savedTheme === 'light') {
        sidebar.classList.add('light-mode');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        text.textContent = 'Light Mode';
    }
});

// ...existing code...

window.addEventListener('beforeunload', function (e) {
    // Save settings before closing the tab
    if (typeof window.gradientControls !== 'undefined') {
        window.gradientControls.saveSettings();
    }
    
    // You can add other settings to save here as well
    // For example, save white box settings
    const whiteBoxColor = document.querySelector(".schedule-container").style.backgroundColor;

    const whiteBoxTextColor = document.getElementById("white-box-heading").style.color;
    localStorage.setItem("whiteBoxColor", whiteBoxColor);
    localStorage.setItem("whiteBoxTextColor", whiteBoxTextColor);
});

// ...existing code...

function removeProgressBar() {
    const progressBar = document.querySelector('.progress-overlay');
    if (progressBar) {
        progressBar.remove();
    }
    
    // Clear any existing update interval
    if (window.progressInterval) {
        clearInterval(window.progressInterval);
        window.progressInterval = null;
    }
}

/* ...existing code... */

function setupDragAndDrop() {
    // Create drop overlay if it doesn't exist
    if (!dropOverlay) {
        dropOverlay = document.createElement('div');
        dropOverlay.className = 'drop-overlay';
        dropOverlay.innerHTML = `
            <div class="drop-content">
                <i class="fas fa-cloud-upload-alt"></i>
                <p class="drop-text">Drop your image here</p>
                <p class="drop-subtext">Release to upload background</p>
            </div>
        `;
        document.body.appendChild(dropOverlay);
    }

    // Create settings overlay
    const settingsOverlay = dropOverlay.cloneNode(true);
    settingsOverlay.classList.add('settings-overlay');
    document.querySelector('.settings-sidebar')?.appendChild(settingsOverlay);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const isSettingsSidebarOpen = document.getElementById('settings-sidebar').classList.contains('open');
        if (isSettingsSidebarOpen) {
            settingsOverlay.classList.add('active');
        } else {
            dropOverlay.classList.add('active');
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        if (e.target === document.documentElement || e.relatedTarget === null) {
            dropOverlay.classList.remove('active');
            settingsOverlay.classList.remove('active');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        dropOverlay.classList.remove('active');
        settingsOverlay.classList.remove('active');
        
        const file = e.dataTransfer.files[0];
        if (file) handleBgImageUpload(file);
    };

    // Add event listeners
    ['dragenter', 'dragover'].forEach(event => {
        document.addEventListener(event, handleDrag);
    });

    document.addEventListener('dragleave', handleDragLeave);
    document.addEventListener('drop', handleDrop);

    // Setup the drop area in settings panel
    const dropArea = document.getElementById('bg-image-drop-area');
    const fileInput = document.getElementById('bg-image');

    if (dropArea && fileInput) {
        dropArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            if (e.target.files[0]) handleBgImageUpload(e.target.files[0]);
        });
        fileInput.accept = "image/jpeg,image/png,image/gif,image/webp,image/avif,image/bmp,image/tiff,image/svg+xml";
    }
}

// Update the handleBgImageUpload function to show better feedback
function handleBgImageUpload(file) {
    if (!file) {
        console.error('No file provided');
        return;
    }

    // Reset any active states
    dropOverlay?.classList.remove('active');
    document.getElementById('bg-image-drop-area')?.classList.remove('drag-over');

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
    }

    // Updated file type check
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/avif',
        'image/bmp',
        'image/tiff',
        'image/svg+xml'
    ];

    if (!allowedTypes.includes(file.type)) {
        alert('Supported formats: JPG, PNG, GIF, WebP, AVIF, BMP, TIFF, SVG');
        return;
    }

    // Disable gradient if enabled
    if (window.gradientManager) {
        const checkbox = document.getElementById('gradient-enabled');
        if (checkbox && checkbox.checked) {
            checkbox.checked = false;
            window.gradientManager.toggleGradient();
        }
    }

    // Show loading state
    const dropArea = document.getElementById('bg-image-drop-area');
    if (dropArea) {
        dropArea.style.opacity = '0.5';
        dropArea.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    }

    // Process the image
    const reader = new FileReader();
    reader.onload = function(e) {
        processUploadedImage(e.target.result, dropArea, file.type);
    };
    reader.onerror = function(error) {
        console.error('FileReader error:', error);
        alert('Error reading file');
    };

    try {
        reader.readAsDataURL(file);
    } catch (error) {
        console.error('Error starting file read:', error);
        alert('Error reading file');
    }
}

function processUploadedImage(dataUrl, dropArea, fileType) {
    const img = new Image();
    img.onload = function() {
        // For GIFs and SVGs, use original file to preserve animation/vectors
        if (fileType === 'image/gif' || fileType === 'image/svg+xml') {
            applyUploadedImage(dataUrl, dropArea);
            return;
        }

        // For other formats, compress if needed
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        let { width, height } = calculateImageDimensions(img.width, img.height);
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Use original format if possible, fallback to JPEG
        let outputType = fileType;
        if (!['image/webp', 'image/avif', 'image/png'].includes(fileType)) {
            outputType = 'image/jpeg';
        }
        
        const compressedImage = canvas.toDataURL(outputType, 0.7);
        applyUploadedImage(compressedImage, dropArea);
    };
    
    img.onerror = function() {
        console.error('Image loading error');
        resetDropArea(dropArea);
        alert('Invalid image file');
    };
    
    img.src = dataUrl;
}

function calculateImageDimensions(width, height) {
    const MAX_WIDTH = 1920;
    const MAX_HEIGHT = 1080;
    
    if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
    }
    if (height > MAX_HEIGHT) {
        width *= MAX_HEIGHT / height;
        height = MAX_HEIGHT;
    }
    
    return { width, height };
}

function resetDropArea(dropArea) {
    if (dropArea) {
        dropArea.style.opacity = '1';
        dropArea.innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <div class="upload-text">
                <p class="main-text">Drop image here or click to upload</p>
                <p class="sub-text">Supports JPG, PNG • Max 5MB</p>
            </div>
        `;
    }
}

// Fix for the first error: Missing gradient-stops container
function initializeGradientControls() {
    const container = document.querySelector('.gradient-controls');
    if (!container) return;

    // Create gradient-stops container if it doesn't exist
    let stopsContainer = container.querySelector('.gradient-stops');
    if (!stopsContainer) {
        stopsContainer = document.createElement('div');
        stopsContainer.className = 'gradient-stops';
        container.appendChild(stopsContainer);
    }

    // Initialize default stops
    stopsContainer.innerHTML = ''; // Clear existing stops
    const defaultStops = [
        { color: '#000035', position: 0 },
        { color: '#00bfa5', position: 100 }
    ];

    defaultStops.forEach(stop => {
        const stopElement = document.createElement('div');
        stopElement.className = 'gradient-stop';
        stopElement.style.left = `${stop.position}%`;
        stopElement.style.backgroundColor = stop.color;
        stopElement.dataset.color = stop.color;
        stopElement.dataset.position = stop.position;
        stopsContainer.appendChild(stopElement);
    });
}

// Fix for the second error: Add missing applyUploadedImage function
function applyUploadedImage(imageData, dropArea) {
    try {
        // Update preview
        const preview = document.getElementById('bg-preview');
        if (preview) {
            preview.style.backgroundImage = `url('${imageData}')`;
            preview.style.backgroundSize = 'cover';
            preview.style.backgroundPosition = 'center';
        }
        
        // Apply to body
        document.body.style.backgroundImage = `url('${imageData}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        
        // Save to localStorage
        localStorage.setItem('bgImage', imageData);
        
        // Reset gradient if enabled
        const gradientEnabled = document.getElementById('gradient-enabled');
        if (gradientEnabled) {
            gradientEnabled.checked = false;
            const gradientControls = document.getElementById('gradient-controls');
            if (gradientControls) {
                gradientControls.classList.remove('active');
            }
        }
        
        // Reset drop area
        resetDropArea(dropArea);
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'upload-success';
        successMessage.innerHTML = '<i class="fas fa-check-circle"></i> Image uploaded successfully!';
        dropArea.parentNode.insertBefore(successMessage, dropArea.nextSibling);
        
        // Remove success message after 3 seconds
        setTimeout(() => successMessage.remove(), 3000);
        
    } catch (error) {
        console.error('Error applying image:', error);
        alert('Error applying image');
        resetDropArea(dropArea);
    }
}

// Update the GradientControls class initialization
document.addEventListener('DOMContentLoaded', () => {
    initializeGradientControls();
    // Initialize other components...
});

// ...existing code...

window.addEventListener('beforeunload', function (e) {
    // Save settings before closing the tab
    if (typeof window.gradientControls !== 'undefined') {
        window.gradientControls.saveSettings();
    }
    
    // You can add other settings to save here as well
    // For example, save white box settings
    const whiteBoxColor = document.querySelector(".schedule-container").style.backgroundColor;

    const whiteBoxTextColor = document.getElementById("white-box-heading").style.color;
    localStorage.setItem("whiteBoxColor", whiteBoxColor);
    localStorage.setItem("whiteBoxTextColor", whiteBoxTextColor);
});

// ...existing code...

// Simplified gradient management
function updateGradient(save = true) {
    const enabled = document.getElementById('gradient-enabled')?.checked || false;
    const startColor = document.getElementById('gradient-start')?.value || '#000035';
    const endColor = document.getElementById('gradient-end')?.value || '#00bfa5';
    const angle = document.getElementById('gradient-angle')?.value || '90';

    if (enabled) {
        // Clear any background image
        document.body.style.backgroundImage = '';
        localStorage.removeItem('bgImage');
        
        // Apply gradient
        const gradientString = `linear-gradient(${angle}deg, ${startColor}, ${endColor})`;
        document.body.style.background = gradientString;
        
        // Update preview if it exists
        const preview = document.querySelector('.gradient-preview');
        if (preview) {
            preview.style.background = gradientString;
        }
        
        // Save settings only if requested
        if (save) {
            const settings = {
                enabled,
                startColor,
                endColor,
                angle
            };
            localStorage.setItem('gradientSettings', JSON.stringify(settings));
        }
    }
}

function loadGradientSettings() {
    const savedSettings = JSON.parse(localStorage.getItem('gradientSettings')) || {
        enabled: true,
        startColor: '#000035',
        endColor: '#00bfa5',
        angle: '90'
    };

    // Set the controls
    const gradientEnabled = document.getElementById('gradient-enabled');
    const gradientStart = document.getElementById('gradient-start');
    const gradientEnd = document.getElementById('gradient-end');
    const gradientAngle = document.getElementById('gradient-angle');
    const gradientControls = document.querySelector('.gradient-controls');

    if (gradientEnabled) gradientEnabled.checked = savedSettings.enabled;
    if (gradientStart) gradientStart.value = savedSettings.startColor;
    if (gradientEnd) gradientEnd.value = savedSettings.endColor;
    if (gradientAngle) gradientAngle.value = savedSettings.angle;
    
    // Show controls if enabled
    if (gradientControls && savedSettings.enabled) {
        gradientControls.classList.add('active');
    }

    // Apply the gradient without saving
    updateGradient(false);
}

// Add this to your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    loadGradientSettings();
    
    // Set up gradient control listeners
    document.getElementById('gradient-enabled')?.addEventListener('change', () => updateGradient(true));
    document.getElementById('gradient-start')?.addEventListener('input', () => updateGradient(true));
    document.getElementById('gradient-end')?.addEventListener('input', () => updateGradient(true));
    document.getElementById('gradient-angle')?.addEventListener('input', (e) => {
        updateGradient(true);
        const angleDisplay = document.querySelector('#gradient-angle + .range-value');
        if (angleDisplay) {
            angleDisplay.textContent = `${e.target.value}°`;
        }
    });
});

// ...existing code...

async function handleAuthButton() {
    const auth = await getAuthManager();
    if (auth.isAuthenticated) {
        auth.logout();
    } else {
        auth.signIn(); // Directly call signIn instead of showLoginModal
    }
}

// Modify your updateAuthButtonText function
async function updateAuthButtonText() {
    const auth = await getAuthManager();
    const buttonText = document.getElementById('auth-button-text');
    const headerButtonText = document.getElementById('header-auth-text');
    
    if (buttonText) {
        buttonText.textContent = auth.isAuthenticated ? 'Sign Out' : 'Sign In';
    }
    if (headerButtonText) {
        headerButtonText.textContent = auth.isAuthenticated ? 'Sign Out' : 'Sign In';
    }
}

// Add this to your initialization code or DOM content loaded event
document.addEventListener('DOMContentLoaded', () => {
    updateAuthButtonText();
});

// ...existing code...

// New function: Update Firestore settings on settings close
async function updateFirestoreSettings() {
    if (window.authManager && window.authManager.currentUser) {
        await window.authManager.saveAllUserSettings(window.authManager.currentUser.uid);
        console.log("Firestore settings updated on settings close.");
    }
}

// Add this function to handle saving settings
async function saveSettings() {
    // Only save to Firestore if user is authenticated
    if (window.authManager?.currentUser) {
        await window.authManager.saveAllUserSettings(window.authManager.currentUser.uid);
    }
}

// ...existing code...
