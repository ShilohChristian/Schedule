// Global variables
let activeStop = null;
let gradientStops = [];

// Settings Management
function toggleSettingsSidebar() {
    const sidebar = document.getElementById("settings-sidebar");
    sidebar.classList.toggle("open");
    
    // Initialize panels if opening
    if (sidebar.classList.contains("open")) {
        initializeSettingsPanels();
    }
}
// Ensure function is globally accessible
window.toggleSettingsSidebar = toggleSettingsSidebar;

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

function loadSettings() {
    const fontColor = localStorage.getItem("fontColor") || "#ffffff";
    const gradientSettings = JSON.parse(localStorage.getItem('gradientSettings'));

    // Set font color if element exists
    const fontColorInput = document.getElementById("font-color");
    if (fontColorInput) {
        fontColorInput.value = fontColor;
    }

    // Clear any existing backgrounds
    clearBackgrounds();

    // Try to load background image first
    if (!loadBackground()) {
        // If no background image, try loading gradient
        if (!loadGradientSettings()) {
            // If no gradient settings, set default gradient
            setDefaultGradient();
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
}

function loadWhiteBoxSettings() {
    const whiteBoxColor = localStorage.getItem("whiteBoxColor") || "rgba(255, 255, 255, 0.9)";
    const whiteBoxTextColor = localStorage.getItem("whiteBoxTextColor") || "#000035";
    
    document.querySelector(".schedule-container").style.backgroundColor = whiteBoxColor;
    document.querySelector(".schedule-container").style.color = whiteBoxTextColor;
    document.getElementById("white-box-heading").style.color = whiteBoxTextColor;
    
    // Set input values
    document.getElementById("white-box-color").value = whiteBoxColor.includes("rgba") ? "#ffffff" : whiteBoxColor;
    document.getElementById("white-box-text-color").value = whiteBoxTextColor;
}

// UI Controls
// Simplified image handling
function handleBgImageUpload(file) {
    if (!file) {
        console.error('No file provided');
        return;
    }

    console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
    }

    // Check file type
    if (!file.type.match('image.*')) {
        alert('Only image files are allowed');
        return;
    }

    const reader = new FileReader();
    
    reader.onload = function(e) {
        console.log('File read successfully');
        const compressedImage = e.target.result;
        
        // Update UI first
        const preview = document.getElementById('bg-preview');
        if (preview) {
            preview.style.backgroundImage = `url('${compressedImage}')`;
            preview.style.backgroundSize = 'cover';
            preview.style.backgroundPosition = 'center';
            console.log('Preview updated');
        }
        
        // Apply to background
        document.body.style.backgroundImage = `url('${compressedImage}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundRepeat = 'no-repeat';
        
        // Save to localStorage
        try {
            localStorage.setItem('bgImage', compressedImage);
            console.log('Image saved to localStorage');
            
            // Reset gradient if it's enabled
            const gradientEnabled = document.getElementById('gradient-enabled');
            if (gradientEnabled) {
                gradientEnabled.checked = false;
                const settings = document.getElementById('gradient-settings');
                if (settings) settings.classList.remove('show');
            }
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            alert('Failed to save image. The file might be too large.');
        }
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

function applyImageBackground(imageUrl) {
    if (!imageUrl) return;
    
    clearBackgrounds();
    
    // Apply the background directly
    document.body.style.backgroundImage = `url('${imageUrl}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundRepeat = 'no-repeat';
    
    // Save to localStorage
    localStorage.setItem('bgImage', imageUrl);
}

function clearBackgrounds() {
    document.body.style.backgroundImage = 'none';
    document.body.style.background = 'none';
    document.body.style.opacity = 1;
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
    clearBackgrounds();
    setDefaultGradient();
    localStorage.removeItem('bgImage');
    localStorage.removeItem('gradientSettings');
    
    // Reset gradient toggle if it exists
    const gradientEnabled = document.getElementById('gradient-enabled');
    if (gradientEnabled) gradientEnabled.checked = false;
}

function updateWhiteBoxColor() {
    const whiteBoxColor = document.getElementById("white-box-color").value;
    document.querySelector(".schedule-container").style.backgroundColor = whiteBoxColor;
    localStorage.setItem("whiteBoxColor", whiteBoxColor); // Save to local storage
}

function updateWhiteBoxTextColor() {
    const whiteBoxTextColor = document.getElementById("white-box-text-color").value;
    const whiteBoxHeading = document.getElementById("white-box-heading");
    whiteBoxHeading.style.color = whiteBoxTextColor;
    document.querySelector(".schedule-container").style.color = whiteBoxTextColor; // Change text color in the white box
    localStorage.setItem("whiteBoxTextColor", whiteBoxTextColor); // Save to local storage
}

// Gradient Management
function initGradientEditor() {
    const bar = document.querySelector('.gradient-bar');
    let isDragging = false;
    let activeStop = null;

    // Initialize default start and end colors
    document.getElementById('gradient-start').value = '#000035';
    document.getElementById('gradient-end').value = '#00bfa5';
    
    // Setup drag handling
    bar.addEventListener('mousedown', handleStopDrag);
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', () => {
        isDragging = false;
        activeStop = null;
    });

    // Add stop on click (if not clicking a stop)
    bar.addEventListener('click', (e) => {
        if (e.target === bar) {
            const rect = bar.getBoundingClientRect();
            const position = (e.clientX - rect.left) / rect.width;
            addGradientStop(position * 100);
        }
    });

    updateGradient();
}

function updateGradient() {
    const enabled = document.getElementById('gradient-enabled')?.checked || false;
    const startColor = document.getElementById('gradient-start')?.value || '#000035';
    const endColor = document.getElementById('gradient-end')?.value || '#00bfa5';
    const direction = document.getElementById('gradient-direction')?.value || 'to bottom';
    const settings = document.getElementById('gradient-settings');

    // Create gradient strings
    const bodyGradient = `linear-gradient(${direction}, ${startColor}, ${endColor})`;
    const previewGradient = `linear-gradient(${direction}, ${startColor}, ${endColor})`;

    if (enabled) {
        // Clear any background image
        document.body.style.backgroundImage = '';
        localStorage.removeItem('bgImage');
        
        // Apply gradient to body
        document.body.style.background = bodyGradient;
        
        // Update preview
        const preview = document.querySelector('.gradient-preview');
        if (preview) {
            preview.style.background = previewGradient;
        }

        // Show settings
        settings?.classList.add('show');
    } else {
        // Hide settings
        settings?.classList.remove('show');
        setDefaultGradient();
    }
    
    // Save settings
    saveGradientSettings();
}

function setDefaultGradient() {
    const defaultGradient = 'linear-gradient(to bottom, #000035, #00bfa5)';
    document.body.style.background = defaultGradient;
    
    const preview = document.querySelector('.gradient-preview');
    if (preview) {
        preview.style.background = defaultGradient;
    }
}

function loadGradientSettings() {
    try {
        const savedSettings = JSON.parse(localStorage.getItem('gradientSettings'));
        if (!savedSettings) return false;

        const enabled = document.getElementById('gradient-enabled');
        const startColor = document.getElementById('gradient-start');
        const endColor = document.getElementById('gradient-end');
        const direction = document.getElementById('gradient-direction');
        
        if (enabled && startColor && endColor && direction) {
            enabled.checked = savedSettings.enabled;
            startColor.value = savedSettings.startColor || '#000035';
            endColor.value = savedSettings.endColor || '#00bfa5';
            direction.value = savedSettings.direction || 'to bottom';
            
            if (savedSettings.enabled) {
                updateGradient();
            }
        }

        return savedSettings.enabled;
    } catch (error) {
        console.error('Error loading gradient settings:', error);
        return false;
    }
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

function toggleGradientControls() {
    const content = document.querySelector('.gradient-controls');
    const toggle = document.querySelector('#gradient-section .dropdown-toggle');
    content.classList.toggle("show");
    toggle.classList.toggle("active");
}

function toggleGradientEditor() {
    const content = document.querySelector(".gradient-editor");
    if (!content) {
        console.error('Gradient editor element not found');
        return;
    }
    content.classList.toggle("show");
}

// Event Listeners
document.addEventListener("DOMContentLoaded", function() {
    console.log('DOM Content Loaded');
    
    const dropArea = document.getElementById("bg-image-drop-area");
    const bgInput = document.getElementById("bg-image");
    
    console.log('Drop area element:', dropArea);
    console.log('File input element:', bgInput);

    if (dropArea && bgInput) {
        // Handle drag events globally
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            document.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });

        // Handle drag enter/over
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.add('drag-over');
            }, false);
        });

        // Handle drag leave/drop
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.remove('drag-over');
            }, false);
        });

        // Handle drop
        dropArea.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const file = dt.files[0];
            
            if (file) {
                handleBgImageUpload(file);
            }
        }, false);

        // Handle click upload
        dropArea.addEventListener('click', () => {
            bgInput.click();
        }, false);

        bgInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleBgImageUpload(file);
            }
        }, false);
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
    const shadowSettings = JSON.parse(localStorage.getItem("timerShadowSettings"));
    if (shadowSettings && shadowSettings.enabled) {
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

    // Add gradient angle input listener
    const gradientAngle = document.getElementById('gradient-angle');
    if (gradientAngle) {
        gradientAngle.addEventListener('input', (e) => {
            updateGradient();
            const angleDisplay = document.querySelector('#gradient-angle + .range-value');
            if (angleDisplay) {
                angleDisplay.textContent = `${e.target.value}°`;
            }
        });
    }

    // Add gradient input listeners
    const startColor = document.getElementById('gradient-start');
    const endColor = document.getElementById('gradient-end');
    const direction = document.getElementById('gradient-direction');
    const enabled = document.getElementById('gradient-enabled');
    
    // Add input event listeners for real-time updates
    if (startColor) startColor.addEventListener('input', updateGradient);
    if (endColor) endColor.addEventListener('input', updateGradient);
    if (direction) direction.addEventListener('change', updateGradient);
    if (enabled) enabled.addEventListener('change', updateGradient);

    // Load saved gradient settings
    const gradientSettings = JSON.parse(localStorage.getItem('gradientSettings'));
    if (gradientSettings) {
        if (enabled) enabled.checked = gradientSettings.enabled;
        if (startColor) startColor.value = gradientSettings.startColor;
        if (endColor) endColor.value = gradientSettings.endColor;
        if (direction) direction.value = gradientSettings.direction;
        
        if (gradientSettings.enabled) {
            updateGradient();
        }
    }
    initGradientControls();
});

function setupDropdownListeners() {
    // Set up click handlers for the dropdown toggles
    document.getElementById('rename-periods-toggle')?.addEventListener('click', () => {
        toggleDropdown('rename-periods-content', 'rename-periods-toggle');
        populateRenamePeriods(); // Populate rename periods when the dropdown is opened
    });
    document.getElementById('custom-schedule-toggle')?.addEventListener('click', () => toggleDropdown('custom-schedule-content', 'custom-schedule-toggle'));
    document.getElementById('gradient-section-toggle')?.addEventListener('click', () => toggleDropdown('gradient-controls', 'gradient-section-toggle'));
    
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
    }
}

// Add new gradient functionality

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
}

// ...existing code...

function toggleGradient() {
    const enabled = document.getElementById('gradient-enabled').checked;
    const settings = document.getElementById('gradient-settings');
    const bgImage = localStorage.removeItem('bgImage');

    if (enabled && bgImage) {
        showGradientConfirmDialog();
    } else {
        settings.classList.toggle('show', enabled);
        if (enabled) {
            updateGradientPreview();
        } else {
            setDefaultGradient();
        }
    }
    
    // Save settings
    saveGradientSettings();
}

function showGradientConfirmDialog() {
    // Create dialog if it doesn't exist
    let dialog = document.querySelector('.gradient-confirm-dialog');
    if (!dialog) {
        dialog = document.createElement('div');
        dialog.className = 'gradient-confirm-dialog';
        dialog.innerHTML = `
            <p>Enabling gradient will remove the current background image. Continue?</p>
            <div class="gradient-confirm-buttons">
                <button class="confirm" onclick="handleGradientConfirm(true)">Yes, enable gradient</button>
                <button class="cancel" onclick="handleGradientConfirm(false)">Cancel</button>
            </div>
        `;
        document.body.appendChild(dialog);
    }
    
    dialog.classList.add('show');
}

function handleGradientConfirm(confirmed) {
    const dialog = document.querySelector('.gradient-confirm-dialog');
    dialog.classList.remove('show');
    
    if (confirmed) {
        document.getElementById('gradient-enabled').checked = true;
        localStorage.removeItem('bgImage');
        document.body.style.backgroundImage = 'none';
        const preview = document.getElementById('bg-preview');
        if (preview) {
            preview.style.backgroundImage = 'none';
        }
        // Use setDefaultGradient directly instead of going through the toggle flow
        setDefaultGradient();
    }
}

function initGradientControls() {
    const savedSettings = JSON.parse(localStorage.getItem('gradientSettings'));
    const startColor = document.getElementById('gradient-start');
    const endColor = document.getElementById('gradient-end');
    const direction = document.getElementById('gradient-direction');
    const enabled = document.getElementById('gradient-enabled');
    const settings = document.getElementById('gradient-settings');
    
    if (savedSettings) {
        startColor.value = savedSettings.startColor || '#000035';
        endColor.value = savedSettings.endColor || '#00bfa5';
        direction.value = savedSettings.direction || 'to bottom';
        enabled.checked = savedSettings.enabled;
        
        if (savedSettings.enabled) {
            settings.classList.add('show');
            updateGradientPreview();
        }
    }
    
    // Add input event listeners
    startColor.addEventListener('input', updateGradientPreview);
    endColor.addEventListener('input', updateGradientPreview);
    direction.addEventListener('change', updateGradientPreview);
}

// ...existing code...

// ...existing code...

// Add after the other progress bar functions
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

// Add these gradient functions
function updateGradientPreview() {
    const startColor = document.getElementById('gradient-start').value;
    const endColor = document.getElementById('gradient-end').value;
    const direction = document.getElementById('gradient-direction').value;
    
    const preview = document.querySelector('.gradient-preview');
    if (preview) {
        preview.style.background = `linear-gradient(${direction}, ${startColor}, ${endColor})`;
    }
}

function applyGradientFromPreview() {
    const preview = document.querySelector('.gradient-preview');
    if (!preview) return;
    
    const background = preview.style.background;
    document.body.style.background = background;
    
    // Save settings
    const settings = {
        enabled: true,
        startColor: document.getElementById('gradient-start').value,
        endColor: document.getElementById('gradient-end').value,
        direction: document.getElementById('gradient-direction').value
    };
    
    localStorage.setItem('gradientSettings', JSON.stringify(settings));
    
    // Update the checkbox and show settings
    const checkbox = document.getElementById('gradient-enabled');
    const settingsDiv = document.getElementById('gradient-settings');
    if (checkbox) checkbox.checked = true;
    if (settingsDiv) settingsDiv.classList.add('show');
}

function resetGradient() {
    const defaultSettings = {
        startColor: '#000035',
        endColor: '#00bfa5',
        direction: 'to bottom'
    };
    
    // Reset input values
    document.getElementById('gradient-start').value = defaultSettings.startColor;
    document.getElementById('gradient-end').value = defaultSettings.endColor;
    document.getElementById('gradient-direction').value = defaultSettings.direction;
    
    // Update preview
    updateGradientPreview();
    
    // Save default settings
    const settings = {
        ...defaultSettings,
        enabled: document.getElementById('gradient-enabled').checked
    };
    localStorage.setItem('gradientSettings', JSON.stringify(settings));
}

// Update the toggleGradient function to use the new methods
function toggleGradient() {
    const enabled = document.getElementById('gradient-enabled').checked;
    const settings = document.getElementById('gradient-settings');
    const bgImage = localStorage.getItem('bgImage');

    if (enabled) {
        if (bgImage) {
            if (confirm('Enabling gradient will remove the current background image. Continue?')) {
                localStorage.removeItem('bgImage');
                document.body.style.backgroundImage = 'none';
                settings.classList.add('show');
                updateGradientPreview();
            } else {
                document.getElementById('gradient-enabled').checked = false;
                return;
            }
        } else {
            settings.classList.add('show');
            updateGradientPreview();
        }
    } else {
        settings.classList.remove('show');
        setDefaultGradient();
    }
    
    saveGradientSettings();
}

// ...existing code...

function saveGradientSettings() {
    const settings = {
        enabled: document.getElementById('gradient-enabled')?.checked || false,
        startColor: document.getElementById('gradient-start')?.value || '#000035',
        endColor: document.getElementById('gradient-end')?.value || '#00bfa5',
        direction: document.getElementById('gradient-direction')?.value || 'to bottom'
    };
    
    localStorage.setItem('gradientSettings', JSON.stringify(settings));
    
    // Update preview if it exists
    const preview = document.querySelector('.gradient-preview');
    if (preview && settings.enabled) {
        preview.style.background = `linear-gradient(${settings.direction}, ${settings.startColor}, ${settings.endColor})`;
    }
}

// ...existing code...
