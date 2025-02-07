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
        // If no background image, try gradient
        if (gradientSettings && gradientSettings.enabled) {
            const gradientEnabled = document.getElementById('gradient-enabled');
            const gradientStart = document.getElementById('gradient-start');
            const gradientEnd = document.getElementById('gradient-end');
            const gradientAngle = document.getElementById('gradient-angle');

            if (gradientEnabled) gradientEnabled.checked = true;
            if (gradientStart) gradientStart.value = gradientSettings.startColor || '#000035';
            if (gradientEnd) gradientEnd.value = gradientSettings.endColor || '#00bfa5';
            if (gradientAngle) {
                gradientAngle.value = gradientSettings.angle || '90';
                const angleDisplay = document.querySelector('#gradient-angle + .range-value');
                if (angleDisplay) {
                    angleDisplay.textContent = `${gradientAngle.value}°`;
                }
            }

            updateGradient();
        } else {
            // Default gradient
            document.body.style.background = 'linear-gradient(to bottom, #000035, #00bfa5)';
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
        try {
            const img = new Image();
            
            img.onload = function() {
                // Compress image if needed
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set maximum dimensions
                const MAX_WIDTH = 1920;
                const MAX_HEIGHT = 1080;
                
                let width = img.width;
                let height = img.height;
                
                // Calculate new dimensions while maintaining aspect ratio
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
                
                // Update UI first
                const preview = document.getElementById('bg-preview');
                if (preview) {
                    preview.style.backgroundImage = `url('${compressedImage}')`;
                    preview.style.backgroundSize = 'contain';
                    preview.style.backgroundPosition = 'center';
                    preview.style.backgroundRepeat = 'no-repeat';
                    preview.style.backgroundColor = '#000';
                }
                
                // Then try to save and apply
                try {
                    localStorage.setItem('bgImage', compressedImage);
                    document.body.style.backgroundImage = `url('${compressedImage}')`;
                    document.body.style.backgroundSize = 'cover';
                    document.body.style.backgroundPosition = 'center';
                    document.body.style.backgroundRepeat = 'no-repeat';
                    
                    // Reset gradient if it's enabled
                    const gradientEnabled = document.getElementById('gradient-enabled');
                    if (gradientEnabled) {
                        gradientEnabled.checked = false;
                    }
                    
                    // Show success message
                    const successMessage = document.createElement('div');
                    successMessage.className = 'upload-success';
                    successMessage.innerHTML = '<i class="fas fa-check-circle"></i> Image uploaded successfully!';
                    
                    const dropArea = document.getElementById('bg-image-drop-area');
                    if (dropArea && dropArea.parentNode) {
                        // Remove any existing success message
                        const existingMessage = dropArea.parentNode.querySelector('.upload-success');
                        if (existingMessage) {
                            existingMessage.remove();
                        }
                        
                        dropArea.parentNode.insertBefore(successMessage, dropArea.nextSibling);
                        setTimeout(() => successMessage.remove(), 3000);
                    }
                    
                } catch (storageError) {
                    console.error('Storage error:', storageError);
                    alert('Failed to save image. The file might be too large.');
                }
            };
            
            img.onerror = function() {
                console.error('Failed to load image');
                alert('Invalid image file');
            };
            
            img.src = e.target.result;
            
        } catch (error) {
            console.error('Error processing image:', error);
            alert('Error processing image');
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
    document.body.style.background = 'linear-gradient(to bottom, #000035, #00bfa5)';
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
    const enabled = document.getElementById('gradient-enabled').checked;
    const startColor = document.getElementById('gradient-start').value;
    const endColor = document.getElementById('gradient-end').value;
    const angle = document.getElementById('gradient-angle').value;

    if (enabled) {
        // Clear any background image
        document.body.style.backgroundImage = '';
        localStorage.removeItem('bgImage');
        
        // CSS gradients use a different angle system - we need to adjust it
        // CSS: 0deg points up, and rotates clockwise
        // Our input: 0deg points right, and rotates clockwise
        // So we subtract 90 and negate the value to match CSS behavior
        const cssAngle = (-angle + 90) % 360;
        
        // Apply gradient with corrected angle
        document.body.style.background = `linear-gradient(${cssAngle}deg, ${startColor}, ${endColor})`;
        
        // Save settings
        localStorage.setItem('gradientSettings', JSON.stringify({
            enabled,
            startColor,
            endColor,
            angle
        }));

        // Update the angle value display
        const angleDisplay = document.querySelector('#gradient-angle + .range-value');
        if (angleDisplay) {
            angleDisplay.textContent = `${angle}°`;
        }
    } else {
        removeBackground();
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

class GradientStop {
    constructor(color, position) {
        this.color = color;
        this.position = position;
        this.element = null;
    }
}

class GradientControls {
    constructor() {
        this.stops = [
            new GradientStop('#000035', 0),
            new GradientStop('#00bfa5', 100)
        ];
        this.activeStop = null;
        this.type = 'linear';
        this.selectedStop = null;
        this.init();
    }

    init() {
        this.initializeControls();
        this.setupEventListeners();
        this.updatePreview();
    }

    initializeControls() {
        const container = document.querySelector('.gradient-stops');
        container.innerHTML = '';
        this.stops.forEach(stop => this.createStopElement(stop));
    }

    createStopElement(stop) {
        const el = document.createElement('div');
        el.className = 'gradient-stop';
        el.style.left = `${stop.position}%`;
        el.style.backgroundColor = stop.color;
        
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectStop(stop);
        });
        
        document.querySelector('.gradient-stops').appendChild(el);
        stop.element = el;
        
        this.setupStopEvents(stop);
    }

    selectStop(stop) {
        // Remove active class from previous stop
        if (this.selectedStop) {
            this.selectedStop.element.classList.remove('active');
        }
        
        this.selectedStop = stop;
        stop.element.classList.add('active');
        
        // Update color picker and position input
        const colorPicker = document.getElementById('stop-color');
        const positionInput = document.getElementById('stop-position');
        
        colorPicker.value = stop.color;
        positionInput.value = Math.round(stop.position);
    }

    setupStopEvents(stop) {
        stop.element.addEventListener('mousedown', (e) => {
            this.activeStop = stop;
            this.updateStopPosition(e);
            document.addEventListener('mousemove', this.handleMouseMove);
            document.addEventListener('mouseup', this.handleMouseUp);
        });
    }

    handleMouseMove = (e) => {
        if (this.activeStop) {
            this.updateStopPosition(e);
        }
    }

    handleMouseUp = () => {
        this.activeStop = null;
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
    }

    updateStopPosition(e) {
        const container = document.querySelector('.gradient-bar-container');
        const rect = container.getBoundingClientRect();
        let position = ((e.clientX - rect.left) / rect.width) * 100;
        position = Math.max(0, Math.min(100, position));
        
        this.activeStop.position = position;
        this.activeStop.element.style.left = `${position}%`;
        this.updatePreview();
    }

    updatePreview() {
        const stops = this.stops
            .sort((a, b) => a.position - b.position)
            .map(stop => `${stop.color} ${stop.position}%`)
            .join(', ');

        const gradient = this.type === 'linear'
            ? `linear-gradient(to right, ${stops})`
            : `radial-gradient(circle, ${stops})`;

        document.querySelector('.gradient-preview').style.background = gradient;
        document.querySelector('.gradient-preview-bar').style.background = gradient;
        document.body.style.background = gradient;
        
        this.saveSettings();
    }

    saveSettings() {
        const settings = {
            type: this.type,
            angle: this.angle,
            centerX: this.centerX,
            centerY: this.centerY,
            stops: this.stops.map(stop => ({
                color: stop.color,
                position: stop.position
            }))
        };
        localStorage.setItem('gradientSettings', JSON.stringify(settings));
    }

    setupEventListeners() {
        // Type selector
        document.getElementById('gradient-type').addEventListener('change', (e) => {
            this.type = e.target.value;
            this.updatePreview();
        });

        // Stop color picker
        document.getElementById('stop-color').addEventListener('input', (e) => {
            if (this.selectedStop) {
                this.selectedStop.color = e.target.value;
                this.selectedStop.element.style.backgroundColor = e.target.value;
                this.updatePreview();
            }
        });

        // Stop position input
        document.getElementById('stop-position').addEventListener('input', (e) => {
            if (this.selectedStop) {
                const position = Math.min(100, Math.max(0, parseInt(e.target.value)));
                this.selectedStop.position = position;
                this.selectedStop.element.style.left = `${position}%`;
                this.updatePreview();
            }
        });

        // Delete stop button
        document.querySelector('.delete-stop').addEventListener('click', () => {
            if (this.selectedStop && this.stops.length > 2) {
                const index = this.stops.indexOf(this.selectedStop);
                if (index > -1) {
                    this.stops.splice(index, 1);
                    this.selectedStop.element.remove();
                    this.selectedStop = null;
                    this.updatePreview();
                }
            }
        });

        // Add stop button
        document.querySelector('.add-stop-btn').addEventListener('click', () => {
            const newPosition = 50;
            const newColor = '#ffffff';
            const newStop = new GradientStop(newColor, newPosition);
            this.stops.push(newStop);
            this.createStopElement(newStop);
            this.selectStop(newStop);
            this.updatePreview();
        });
    }
}

// Initialize gradient controls
document.addEventListener('DOMContentLoaded', () => {
    window.gradientControls = new GradientControls();
});

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
    const controls = document.getElementById('gradient-controls');
    const bgImage = localStorage.getItem('bgImage');
    
    if (enabled && bgImage) {
        // If there's a background image, show confirmation dialog
        showGradientConfirmDialog();
        // Uncheck the toggle until confirmed
        document.getElementById('gradient-enabled').checked = false;
        return;
    }
    
    applyGradientToggle(enabled);
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
        applyGradientToggle(true);
    }
}

function applyGradientToggle(enabled) {
    const controls = document.getElementById('gradient-controls');
    controls.classList.toggle('active', enabled);
    
    if (enabled) {
        updateGradient();
    } else {
        removeBackground();
    }
}

function updateGradient() {
    const type = document.getElementById('gradient-type').value;
    const angle = document.getElementById('gradient-angle').value;
    const stops = getGradientStops();
    
    let gradient;
    if (type === 'linear') {
        gradient = `linear-gradient(${angle}deg, ${stops})`;
    } else {
        gradient = `radial-gradient(circle at center, ${stops})`;
    }
    
    document.querySelector('.gradient-preview').style.background = gradient;
    document.querySelector('.gradient-preview-bar').style.background = gradient;
    document.body.style.background = gradient;
    
    // Save settings
    saveGradientSettings();
}

function getGradientStops() {
    return Array.from(document.querySelectorAll('.gradient-stop'))
        .sort((a, b) => parseFloat(a.style.left) - parseFloat(b.style.left))
        .map(stop => `${stop.dataset.color} ${parseFloat(stop.style.left)}%`)
        .join(', ');
}

function updateSelectedStop() {
    const activeStop = document.querySelector('.gradient-stop.active');
    if (!activeStop) return;
    
    const color = document.getElementById('stop-color').value;
    const position = document.getElementById('stop-position').value;
    
    activeStop.dataset.color = color;
    activeStop.style.backgroundColor = color;
    activeStop.style.left = `${position}%`;
    
    updateGradient();
}

function deleteSelectedStop() {
    const activeStop = document.querySelector('.gradient-stop.active');
    if (!activeStop || document.querySelectorAll('.gradient-stop').length <= 2) return;
    
    activeStop.remove();
    updateGradient();
}

function addGradientStop() {
    const container = document.querySelector('.gradient-stops');
    const stop = document.createElement('div');
    const color = '#ffffff';
    const position = 50;
    
    stop.className = 'gradient-stop';
    stop.dataset.color = color;
    stop.style.backgroundColor = color;
    stop.style.left = `${position}%`;
    
    stop.addEventListener('click', selectGradientStop);
    stop.addEventListener('mousedown', startDragging);
    
    container.appendChild(stop);
    selectGradientStop({ target: stop });
    updateGradient();
}

function selectGradientStop(e) {
    const stops = document.querySelectorAll('.gradient-stop');
    stops.forEach(s => s.classList.remove('active'));
    
    const stop = e.target;
    stop.classList.add('active');
    
    document.getElementById('stop-color').value = stop.dataset.color;
    document.getElementById('stop-position').value = parseFloat(stop.style.left);
}

// ...existing code...

function saveGradientSettings() {
    const settings = {
        type: document.getElementById('gradient-type').value,
        angle: document.getElementById('gradient-angle').value,
        stops: Array.from(document.querySelectorAll('.gradient-stop')).map(stop => ({
            color: stop.dataset.color,
            position: parseFloat(stop.style.left)
        }))
    };
    
    localStorage.setItem('gradientSettings', JSON.stringify(settings));
}

function startDragging(e) {
    e.preventDefault();
    const stop = e.target;
    const container = stop.parentElement;
    const rect = container.getBoundingClientRect();
    let isDragging = true;

    function handleDrag(moveEvent) {
        if (!isDragging) return;
        
        const x = moveEvent.clientX - rect.left;
        const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
        
        stop.style.left = `${position}%`;
        updateGradient();
    }

    function stopDragging() {
        isDragging = false;
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', stopDragging);
    }

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDragging);
}

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

// ...existing code...
 
