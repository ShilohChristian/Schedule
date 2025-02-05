// Global variables
let activeStop = null;
let gradientStops = [];

// Settings Management
function toggleSettingsSidebar() {
    const sidebar = document.getElementById("settings-sidebar");
    sidebar.classList.toggle("open");
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
            const gradientDirection = document.getElementById('gradient-direction');

            if (gradientEnabled) gradientEnabled.checked = true;
            if (gradientStart) gradientStart.value = gradientSettings.startColor || '#000035';
            if (gradientEnd) gradientEnd.value = gradientSettings.endColor || '#00bfa5';
            if (gradientDirection) gradientDirection.value = gradientSettings.direction || 'to bottom';

            updateGradient();
        } else {
            // Default gradient
            document.body.style.background = 'linear-gradient(to bottom, #000035, #00bfa5)';
        }
    }

    // Load other settings
    loadWhiteBoxSettings();
    loadShadowSettings();
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
    console.group('Image Upload Debug');
    console.log('1. Starting upload process');
    
    if (!file) {
        console.error('No file provided');
        console.groupEnd();
        return;
    }

    const reader = new FileReader();
    
    reader.onload = function(e) {
        console.log('4. File loaded successfully');
        try {
            // Create an image element to verify the loaded data
            const img = new Image();
            img.onload = function() {
                console.log('5. Image validated successfully');
                
                // Create a canvas to resize the image if needed
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
                
                // Set canvas dimensions
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress the image
                ctx.drawImage(img, 0, 0, width, height);
                
                // Get compressed image data
                const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
                
                try {
                    // Apply the background
                    document.body.style.backgroundImage = `url('${compressedImage}')`;
                    document.body.style.backgroundSize = 'cover';
                    document.body.style.backgroundPosition = 'center';
                    document.body.style.backgroundRepeat = 'no-repeat';
                    
                    // Save to localStorage
                    localStorage.setItem('bgImage', compressedImage);
                    console.log('6. Compressed image saved to localStorage');
                } catch (storageError) {
                    console.error('Error saving to localStorage:', storageError);
                    alert('Error saving image. The file might still be too large.');
                }
            };
            
            img.onerror = function() {
                console.error('5. Invalid image data');
                alert('Invalid image file');
            };
            
            img.src = e.target.result;
        } catch (error) {
            console.error('Error processing image:', error);
            alert('Error processing image');
        }
        console.groupEnd();
    };

    try {
        console.log('3. Starting file read');
        reader.readAsDataURL(file);
    } catch (error) {
        console.error('Error starting file read:', error);
        alert('Error reading file');
        console.groupEnd();
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
    const direction = document.getElementById('gradient-direction').value;

    if (enabled) {
        // Clear any background image
        document.body.style.backgroundImage = '';
        localStorage.removeItem('bgImage');
        
        // Apply gradient
        document.body.style.background = `linear-gradient(${direction}, ${startColor}, ${endColor})`;
        
        // Save settings
        localStorage.setItem('gradientSettings', JSON.stringify({
            enabled,
            startColor,
            endColor,
            direction
        }));
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
    const themeButton = document.querySelector('.theme-toggle');
    const icon = themeButton.querySelector('i');
    
    sidebar.classList.toggle('light-mode');
    
    // Update icon and save preference
    if (sidebar.classList.contains('light-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        localStorage.setItem('theme', 'light');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        localStorage.setItem('theme', 'dark');
    }
}