// Add this at the start of the file
async function initializeAuth() {
    await new Promise((resolve) => {
        const checkAuth = () => {
            if (window.authManager) {
                resolve();
            } else {
                setTimeout(checkAuth, 50);
            }
        };
        checkAuth();
    });
}

// Declare schedules first
const schedules = {
    normal: [
        { name: "Period 1", start: "08:15", end: "09:00" },
        { name: "Passing", start: "09:00", end: "09:06" },
        { name: "Period 2", start: "09:06", end: "09:51" },
        { name: "Passing", start: "09:51", end: "09:57" },
        { name: "Period 3", start: "09:57", end: "10:42" },
        { name: "Passing", start: "10:42", end: "10:48" },
        { name: "Period 4", start: "10:48", end: "11:33" },
        { name: "Passing", start: "11:33", end: "11:39" },
        { name: "Period 5", start: "11:39", end: "12:25" },
        { name: "Lunch", start: "12:25", end: "13:07" },
        { name: "Passing", start: "13:07", end: "13:13" },
        { name: "Period 6", start: "13:13", end: "13:58" },
        { name: "Passing", start: "13:58", end: "14:04" },
        { name: "Period 7", start: "14:04", end: "14:49" },
        { name: "Passing", start: "14:49", end: "14:55" },
        { name: "Period 8", start: "14:55", end: "15:40" },
    ],
    chapel: [
        { name: "Period 1", start: "08:15", end: "08:53" },
        { name: "Period 2", start: "08:59", end: "09:38" },
        { name: "Period 3", start: "09:44", end: "10:23" },
        { name: "Chapel", start: "10:29", end: "11:14" },
        { name: "Period 4", start: "11:20", end: "12:00" },
        { name: "Period 5", start: "12:06", end: "12:46" },
        { name: "Lunch", start: "12:46", end: "13:28" },
        { name: "Period 6", start: "13:34", end: "14:12" },
        { name: "Period 7", start: "14:18", end: "14:56" },
        { name: "Period 8", start: "15:02", end: "15:40" },
    ],
    latePepRally: [
        { name: "Period 1", start: "08:15", end: "08:53" },
        { name: "Period 2", start: "08:59", end: "09:37" },
        { name: "Period 3", start: "09:43", end: "10:21" },
        { name: "Period 4", start: "10:27", end: "11:05" },
        { name: "Period 5", start: "11:11", end: "11:49" },
        { name: "Period 6", start: "11:55", end: "12:33" },
        { name: "Lunch", start: "12:33", end: "13:10" },
        { name: "Period 7", start: "13:16", end: "13:54" },
        { name: "Period 8", start: "14:00", end: "14:38" },
        { name: "Pep Rally", start: "14:45", end: "15:40" },
    ],
    earlyPepRally: [
        { name: "Period 1", start: "08:15", end: "08:55" },
        { name: "Period 2", start: "09:01", end: "09:41" },
        { name: "Period 3", start: "09:47", end: "10:27" },
        { name: "Period 4", start: "10:33", end: "11:13" },
        { name: "Period 5", start: "11:19", end: "11:59" },
        { name: "Pep Rally", start: "12:05", end: "12:30" },
        { name: "Lunch", start: "12:30", end: "13:13" },
        { name: "Period 6", start: "13:19", end: "14:02" },
        { name: "Period 7", start: "14:08", end: "14:51" },
        { name: "Period 8", start: "14:57", end: "15:40" },
    ]
};

// Then declare schedule display names
const scheduleDisplayNames = {
    normal: 'Normal',
    chapel: 'Chapel Bell',
    latePepRally: 'Late Pep Rally',
    earlyPepRally: 'Early Pep Rally'  // Fixed the display name
};

// Initialize global variables
let currentSchedule = schedules.normal;
let currentScheduleName = 'normal';

// Modify your DOMContentLoaded handler
document.addEventListener("DOMContentLoaded", async function() {
    await initializeAuth();
    // Remove the auth check that was showing the modal
    initializeApp();
    
    // Add login form handler
    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('login-error');
        const loginButton = document.getElementById('login-button');

        try {
            loginButton.disabled = true;
            loginButton.textContent = 'Signing in...';
            
            const success = await window.authManager.login(username, password);
            if (success) {
                window.authManager.hideLoginModal();
                initializeApp(); // Initialize app after successful login
            } else {
                errorElement.textContent = 'Invalid username or password';
            }
        } catch (error) {
            errorElement.textContent = 'An error occurred during sign in';
        } finally {
            loginButton.disabled = false;
            loginButton.textContent = 'Sign In';
        }
    });

    // First ensure script2.js functions are available
    if (typeof toggleSettingsSidebar === 'function') {
        initializeApp();
    } else {
        console.error('Required functions not loaded yet');
    }

    initializeSettingsPanels();
});

// Clean up old interval if it exists when loading new script
if (window.countdownInterval) {
    clearInterval(window.countdownInterval);
}

function initializeApp() {
    // Ensure DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeAppLogic();
        });
    } else {
        initializeAppLogic();
    }
}

function initializeAppLogic() {
    try {
        initializeSavedSchedules();
        
        // Handle Tuesday chapel and Wednesday normal schedule
        const today = new Date();
        const dayOfWeek = today.getDay();
        
        if (dayOfWeek === 2) { // 2 represents Tuesday
            switchSchedule('chapel');
            console.log('Tuesday detected - switched to chapel schedule');
        } else if (dayOfWeek === 3) { // 3 represents Wednesday
            switchSchedule('normal');
            console.log('Wednesday detected - switched to normal schedule');
        } else {
            // Load saved schedule for other days
            const savedScheduleName = localStorage.getItem('currentScheduleName');
            if (savedScheduleName) {
                switchSchedule(savedScheduleName);
            } else {
                switchSchedule('normal');
            }
        }

        updateScheduleDisplay();
        window.countdownInterval = startCountdown();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Schedule management functions
function switchSchedule(scheduleName) {
    if (!scheduleName) return;
    
    try {
        let schedule;
        
        // Check if it's a custom schedule
        if (scheduleName.startsWith('customSchedule_')) {
            const savedSchedule = localStorage.getItem(scheduleName);
            if (savedSchedule) {
                schedule = JSON.parse(savedSchedule);
            } else {
                console.error(`Custom schedule ${scheduleName} not found`);
                return;
            }
        } else {
            // Handle built-in schedules
            const savedSchedule = localStorage.getItem('savedSchedule_' + scheduleName);
            if (savedSchedule) {
                try {
                    schedule = JSON.parse(savedSchedule);
                } catch (e) {
                    // If parsing fails, use the default schedule
                    schedule = schedules[scheduleName];
                    // Save it properly stringified
                    localStorage.setItem('savedSchedule_' + scheduleName, JSON.stringify(schedule));
                }
            } else if (schedules[scheduleName]) {
                schedule = JSON.parse(JSON.stringify(schedules[scheduleName]));
                localStorage.setItem('savedSchedule_' + scheduleName, JSON.stringify(schedule));
            } else {
                console.error(`Schedule ${scheduleName} not found`);
                return;
            }
        }

        // Update current schedule
        currentSchedule = schedule;
        currentScheduleName = scheduleName;
        localStorage.setItem('currentScheduleName', scheduleName);
        
        // Update display name
        const displayName = scheduleName.startsWith('customSchedule_') 
            ? scheduleName.replace('customSchedule_', '')
            : scheduleDisplayNames[scheduleName] || scheduleName;
        
        const headingText = `${displayName} Schedule ▸ ${schedule[0].name}`;
        document.getElementById("countdown-heading").innerText = headingText;
        
        // Update dropdown if it exists
        const dropdown = document.getElementById("schedule-dropdown");
        if (dropdown) dropdown.value = scheduleName;
        
        updateScheduleDisplay();
        updateCountdowns();

        console.log(`Switched to schedule: ${scheduleName}`);
    } catch (error) {
        console.error('Error switching schedule:', error);
        // Fallback to default schedule
        currentSchedule = schedules[scheduleName] || schedules.normal;
    }
}

// Countdown functions
function updateCountdowns() {
    const now = new Date();
    const currentTimeInSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    
    // Add null check for font color
    const fontColor = document.getElementById("font-color")?.value || "#ffffff";

    let currentPeriod = currentSchedule.find(period => 
        currentTimeInSeconds >= getTimeInSeconds(period.start) && 
        currentTimeInSeconds < getTimeInSeconds(period.end)
    );

    // Add null checks for DOM elements
    const periodTimeElement = document.getElementById("current-period-time");
    const countdownHeadingElement = document.getElementById("countdown-heading");

    if (!periodTimeElement || !countdownHeadingElement) {
        console.warn('Required DOM elements not found');
        return;
    }

    if (currentPeriod) {
        const countdown = getTimeInSeconds(currentPeriod.end) - currentTimeInSeconds;
        const timeRemaining = formatCountdown(countdown);
        periodTimeElement.innerText = timeRemaining;
        
        const scheduleName = scheduleDisplayNames[currentScheduleName] || currentScheduleName;
        const headerText = `${scheduleName} Schedule ▸ ${currentPeriod.name}`;
        countdownHeadingElement.innerText = headerText;
        
        // Update page title
        document.title = `${currentPeriod.name} | ${timeRemaining}`;
    } else {
        let nextPeriod = currentSchedule.find(period => 
            getTimeInSeconds(period.start) > currentTimeInSeconds
        );

        if (!nextPeriod) {
            nextPeriod = currentSchedule[0];
            const countdown = getTimeInSeconds(nextPeriod.start) + (24 * 3600 - currentTimeInSeconds);
            const timeRemaining = formatCountdownHHMMSS(countdown);
            periodTimeElement.innerText = timeRemaining;
            
            const scheduleName = scheduleDisplayNames[currentScheduleName] || currentScheduleName;
            countdownHeadingElement.innerText = 
                `${scheduleName} Schedule ▸ Free`;
            
            // Update page title
            document.title = `Free | ${timeRemaining}`;
        } else {
            const countdown = getTimeInSeconds(nextPeriod.start) - currentTimeInSeconds;
            const timeRemaining = formatCountdown(countdown);
            periodTimeElement.innerText = timeRemaining;
            
            const previousPeriod = currentSchedule.find(period => 
                getTimeInSeconds(period.end) <= currentTimeInSeconds
            );
            
            const scheduleName = scheduleDisplayNames[currentScheduleName] || currentScheduleName;
            if (previousPeriod && (currentTimeInSeconds - getTimeInSeconds(previousPeriod.end)) < 360) {
                countdownHeadingElement.innerText = 
                    `${scheduleName} Schedule ▸ Passing to ${nextPeriod.name}`;
                // Update page title
                document.title = `Passing | ${timeRemaining}`;
            } else {
                countdownHeadingElement.innerText = 
                    `${scheduleName} Schedule ▸ Free until ${nextPeriod.name}`;
                // Update page title
                document.title = `Free | ${timeRemaining}`;
            }
        }
    }
    
    countdownHeadingElement.style.color = fontColor;
    localStorage.setItem("fontColor", fontColor);
}

function getTimeInSeconds(time) {
    const [hour, minute] = time.split(":").map(Number);
    return hour * 3600 + minute * 60;
}

function formatCountdown(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatCountdownHHMMSS(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function startCountdown() {
    // Run immediately once
    updateCountdowns();
    // Then set up interval
    return setInterval(updateCountdowns, 1000);
}

// Schedule display functions
function updateScheduleDisplay() {
    const scheduleContainer = document.getElementById("schedule");
    scheduleContainer.innerHTML = "";
    currentSchedule.forEach((period) => {
        if (period.name !== "Passing") {
            const periodDiv = document.createElement("div");
            periodDiv.className = "period";
            const label = document.createElement("label");
            label.innerText = `${period.name}`;
            const timer = document.createElement("span");
            timer.id = `Period_Timer`;
            periodDiv.appendChild(label);
            periodDiv.appendChild(timer);
            scheduleContainer.appendChild(periodDiv);
        }
    });
    updateCountdowns();
}

function setupCustomSchedule() {
    const numPeriods = document.getElementById("num-periods").value;
    const periodInputs = document.getElementById("period-inputs");
    const saveButton = document.getElementById("save-schedule-button");
    periodInputs.innerHTML = '';

    if (numPeriods > 0) {
        saveButton.style.display = 'block';
        for (let i = 0; i < numPeriods; i++) {
            const periodDiv = document.createElement("div");
            periodDiv.innerHTML = `
                <label for="period-start-${i}">Period ${i + 1} Start Time:</label>
                <input type="time" id="period-start-${i}" onchange="updateCustomSchedule()" required />
                <label for="period-end-${i}">End Time:</label>
                <input type="time" id="period-end-${i}" onchange="updateCustomSchedule()" required />
            `;
            periodInputs.appendChild(periodDiv);
        }
    }
}

function saveCustomSchedule() {
    const scheduleName = document.getElementById("schedule-name").value;
    const numPeriods = document.getElementById("num-periods").value;
    const newSchedule = [];

    for (let i = 0; i < numPeriods; i++) {
        const startTime = document.getElementById(`period-start-${i}`).value;
        const endTime = document.getElementById(`period-end-${i}`).value;

        if (startTime && endTime) {
            newSchedule.push({
                name: `Period ${i + 1}`,
                start: startTime,
                end: endTime
            });
        }
    }

    if (scheduleName) {
        localStorage.setItem(`customSchedule_${scheduleName}`, JSON.stringify(newSchedule));
        alert(`Schedule "${scheduleName}" saved successfully!`);
        updateScheduleDropdown();
        switchSchedule(`customSchedule_${scheduleName}`);
    } else {
        alert("Please enter a schedule name.");
    }
}

function updateScheduleDropdown() {
    const dropdown = document.getElementById("schedule-dropdown");
    dropdown.innerHTML = "";

    for (let key in schedules) {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = scheduleDisplayNames[key] || key.charAt(0).toUpperCase() + key.slice(1);
        dropdown.appendChild(option);
    }

    for (let key in localStorage) {
        if (key.startsWith("customSchedule_")) {
            const option = document.createElement("option");
            option.value = key;
            option.textContent = key.replace("customSchedule_", "");
            dropdown.appendChild(option);
        }
    }
}

// Load countdowns on page load
window.addEventListener('load', function() {
    const savedScheduleName = localStorage.getItem('currentScheduleName');
    if (savedScheduleName) {
        switchSchedule(savedScheduleName);
    }
});

// Add this to your initialization code if not already present
document.addEventListener('DOMContentLoaded', () => {
    /* ...existing code... */
    
    // Add rename periods dropdown listener
    const renameToggle = document.getElementById('rename-periods-toggle');
    if (renameToggle) {
        renameToggle.addEventListener('click', () => {
            toggleDropdown('rename-periods-content', 'rename-periods-toggle');
            populateRenamePeriods();
        });
    }
});

// Add this function to initialize saved schedules
function initializeSavedSchedules() {
    try {
        // First load any existing saved schedules
        const savedSchedules = {};
        Object.keys(schedules).forEach(scheduleName => {
            try {
                const saved = localStorage.getItem('savedSchedule_' + scheduleName);
                if (saved) {
                    savedSchedules[scheduleName] = JSON.parse(saved);
                } else {
                    // Only save default if no saved version exists
                    savedSchedules[scheduleName] = JSON.parse(JSON.stringify(schedules[scheduleName]));
                    localStorage.setItem('savedSchedule_' + scheduleName, 
                        JSON.stringify(schedules[scheduleName])
                    );
                }
            } catch (e) {
                console.warn(`Error loading schedule ${scheduleName}:`, e);
                savedSchedules[scheduleName] = schedules[scheduleName];
                localStorage.setItem('savedSchedule_' + scheduleName, 
                    JSON.stringify(schedules[scheduleName])
                );
            }
        });
        
        // Update the global schedules object with saved versions
        Object.assign(schedules, savedSchedules);
    } catch (error) {
        console.error('Error initializing saved schedules:', error);
    }
}

// Add this helper function
function updateAllSchedules(oldName, newName) {
    // Update all default schedules
    Object.keys(schedules).forEach(scheduleName => {
        const savedSchedule = JSON.parse(localStorage.getItem('savedSchedule_' + scheduleName));
        if (savedSchedule) {
            let modified = false;
            savedSchedule.forEach(period => {
                if (period.name === oldName && !period.name.includes("Passing") && !period.name.includes("Lunch")) {
                    period.name = newName;
                    modified = true;
                }
            });
            if (modified) {
                localStorage.setItem('savedSchedule_' + scheduleName, JSON.stringify(savedSchedule));
            }
        }
    });

    // Update custom schedules
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('customSchedule_')) {
            const customSchedule = JSON.parse(localStorage.getItem(key));
            let modified = false;
            customSchedule.forEach(period => {
                if (period.name === oldName && !period.name.includes("Passing") && !period.name.includes("Lunch")) {
                    period.name = newName;
                    modified = true;
                }
            });
            if (modified) {
                localStorage.setItem(key, JSON.stringify(customSchedule));
            }
        }
    });
}

// Update the renamePeriod function
function renamePeriod(index, newName) {
    if (!newName.trim()) return;
    
    const oldName = currentSchedule[index].name;
    
    // Don't rename special periods
    if (oldName.includes("Passing") || oldName.includes("Lunch") || 
        oldName.includes("Chapel") || oldName.includes("Pep Rally")) {
        return;
    }

    try {
        // Update all schedules both in memory and localStorage
        Object.keys(schedules).forEach(scheduleName => {
            const schedule = schedules[scheduleName];
            let modified = false;
            
            schedule.forEach(period => {
                if (period.name === oldName) {
                    period.name = newName;
                    modified = true;
                }
            });
            
            if (modified) {
                localStorage.setItem('savedSchedule_' + scheduleName, JSON.stringify(schedule));
                console.log(`Updated schedule: ${scheduleName}`);
            }
        });

        // Update current schedule
        currentSchedule = JSON.parse(localStorage.getItem('savedSchedule_' + currentScheduleName));

        // Update all displays
        updateScheduleDisplay();
        updateCountdowns();
        populateRenamePeriods();

        // Force refresh the schedule display
        const scheduleContainer = document.getElementById("schedule");
        if (scheduleContainer) {
            scheduleContainer.innerHTML = '';
            currentSchedule.forEach(period => {
                if (period.name !== "Passing") {
                    const periodDiv = document.createElement("div");
                    periodDiv.className = "period";
                    periodDiv.innerHTML = `<label>${period.name}</label><span id="Period_Timer"></span>`;
                    scheduleContainer.appendChild(periodDiv);
                }
            });
        }

        console.log(`Successfully renamed ${oldName} to ${newName}`);
    } catch (error) {
        console.error('Error renaming period:', error);
    }
}

// Update the populateRenamePeriods function
function populateRenamePeriods() {
    const content = document.getElementById("rename-periods-content");
    if (!content) return;
    
    content.innerHTML = ''; // Clear existing content
    
    // Get all periods except Passing and Lunch
    currentSchedule.forEach((period, index) => {
        if (!period.name.includes("Passing") && !period.name.includes("Lunch")) {
            const div = document.createElement('div');
            div.className = 'rename-period';
            
            // Find the original period number
            let periodNumber = '';
            if (period.name.includes("Period")) {
                periodNumber = period.name.split(" ")[1]; // Get the number after "Period"
            } else {
                // If it's been renamed, find the corresponding period in the original schedule
                const originalPeriod = schedules[currentScheduleName].find((p, i) => i === index);
                if (originalPeriod && originalPeriod.name.includes("Period")) {
                    periodNumber = originalPeriod.name.split(" ")[1];
                }
            }
            
            const label = document.createElement('label');
            label.htmlFor = `period-${index}`;
            label.textContent = `Period ${periodNumber}:`; // Show "Period X:"
            
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `period-${index}`;
            input.value = period.name;
            input.onchange = (e) => renamePeriod(index, e.target.value);
            
            div.appendChild(label);
            div.appendChild(input);
            content.appendChild(div);
        }
    });
}

function updateCustomSchedule() {
    const numPeriods = document.getElementById("num-periods").value;
    const saveButton = document.getElementById("save-schedule-button");
    let isValid = true;

    // Validate all periods
    for (let i = 0; i < numPeriods; i++) {
        const startTime = document.getElementById(`period-start-${i}`).value;
        const endTime = document.getElementById(`period-end-${i}`).value;
        
        if (!startTime || !endTime) {
            isValid = false;
            break;
        }
        
        // Check if end time is after start time
        if (startTime >= endTime) {
            isValid = false;
            break;
        }
    }

    // Enable/disable save button based on validation
    if (saveButton) {
        saveButton.disabled = !isValid;
    }
}

// Add a check to ensure script2.js is loaded
window.addEventListener('load', function() {
    if (typeof toggleSettingsSidebar !== 'function') {
        console.error('Required functions not loaded. Please check script loading order.');
        return;
    }
    // Continue with initialization
    initializeApp();
});

/* ...existing code... */

// Add this function at an appropriate location in the file:
function initializeSettingsPanels() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all nav items and panels
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            document.querySelectorAll('.settings-panel').forEach(panel => panel.classList.remove('active'));
            // Add active class to the clicked item
            item.classList.add('active');
            // Show the corresponding panel based on data-target attribute
            const target = item.getAttribute("data-target");
            const panel = document.getElementById(`${target}-panel`);
            if (panel) {
                panel.classList.add('active');
            }
        });
    });
}

// Wire the above function to DOMContentLoaded (ensure it's not already added)
document.addEventListener("DOMContentLoaded", () => {
    // ...existing code...
    initializeSettingsPanels();
});

// Add extension interaction code
if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage("jloifnaccjamlflmemenepkmgklmfnmc", {
        type: 'UPDATE_GRADIENT',
        settings: { angle: settings.angle, stops: settings.stops }
    }, function(response) {
        // Handle response if needed
    });
}
