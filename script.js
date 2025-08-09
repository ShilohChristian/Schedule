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
        { name: "Period 1", start: "08:15", end: "09:01" },
        { name: "Passing", start: "09:01", end: "09:07" },
        { name: "Period 2", start: "09:07", end: "09:53" },
        { name: "Passing", start: "09:53", end: "09:59" },
        { name: "Period 3", start: "09:59", end: "10:45" },
        { name: "Passing", start: "10:45", end: "10:51" },
        { name: "Period 4", start: "10:51", end: "11:37" },
        { name: "Passing", start: "11:37", end: "11:43" },
        { name: "Period 5", start: "11:43", end: "12:29" },
        { name: "Lunch", start: "12:29", end: "13:04" },
        { name: "Passing", start: "13:04", end: "13:10" },
        { name: "Period 6", start: "13:10", end: "13:56" },
        { name: "Passing", start: "13:56", end: "14:02" },
        { name: "Period 7", start: "14:02", end: "14:48" },
        { name: "Passing", start: "14:48", end: "14:54" },
        { name: "Period 8", start: "14:54", end: "15:40" },
    ],
    chapel: [
        { name: "Period 1", start: "08:15", end: "08:55" },
        { name: "Passing", start: "08:55", end: "09:01" }, // +1 min
        { name: "Period 2", start: "09:01", end: "09:40" }, // +1 min
        { name: "Passing", start: "09:40", end: "09:45" },  // +1 min (added)
        { name: "Chapel", start: "09:45", end: "10:30" },   // moved after Period 2
        { name: "Passing", start: "10:30", end: "10:36" },  // +1 min (added)
        { name: "Period 3", start: "10:36", end: "11:17" }, // +1 min
        { name: "Passing", start: "11:17", end: "11:23" },  // +1 min (added)
        { name: "Period 4", start: "11:23", end: "12:03" },
        { name: "Lunch", start: "12:03", end: "12:39" },  // +1 min
        { name: "Passing", start: "12:39", end: "12:45" },  // +1 min (added)
        { name: "Period 5", start: "12:45", end: "13:24" }, // +1 min
        { name: "Passing", start: "13:24", end: "13:30" },  // +1 min (added) // +1 min (added)
        { name: "Period 6", start: "13:30", end: "14:10" }, // +1 min
        { name: "Passing", start: "14:10", end: "14:16" },  // +1 min (added)
        { name: "Period 7", start: "14:16", end: "14:55" }, // +1 min
        { name: "Passing", start: "14:55", end: "15:01" },  // +1 min (added)
        { name: "Period 8", start: "15:01", end: "15:40" }  // +1 min
    ],
    latePepRally: [
        { name: "Period 1", start: "08:15", end: "08:55" },
        { name: "Passing", start: "08:55", end: "09:01" },
        { name: "Period 2", start: "09:01", end: "09:41" },
        { name: "Passing", start: "09:41", end: "09:47" },
        { name: "Period 3", start: "09:47", end: "10:27" },
        { name: "Passing", start: "10:27", end: "10:33" },
        { name: "Period 4", start: "10:33", end: "11:13" },
        { name: "Passing", start: "11:13", end: "11:19" },
        { name: "Period 5", start: "11:19", end: "11:59" },
        { name: "Lunch", start: "11:59", end: "12:34" },
        { name: "Passing", start: "12:34", end: "12:40" },
        { name: "Period 6", start: "12:40", end: "13:21" },
        { name: "Passing", start: "13:21", end: "13:27" },
        { name: "Period 7", start: "13:27", end: "14:07" },
        { name: "Passing", start: "14:07", end: "14:13" },
        { name: "Period 8", start: "14:13", end: "14:52" },
        { name: "Passing", start: "14:52", end: "14:58" },
        { name: "Pep Rally", start: "14:58", end: "15:40" }
    ],
    earlyPepRally: [
        { name: "Period 1", start: "08:15", end: "08:58" },
        { name: "Passing", start: "08:58", end: "09:04" },
        { name: "Period 2", start: "09:04", end: "09:47" },
        { name: "Passing", start: "09:47", end: "09:53" },
        { name: "Period 3", start: "09:53", end: "10:36" },
        { name: "Passing", start: "10:36", end: "10:42" },
        { name: "Period 4", start: "10:42", end: "11:24" },
        { name: "Passing", start: "11:24", end: "11:30" },
        { name: "Period 5", start: "11:30", end: "12:12" },
        { name: "Passing", start: "12:12", end: "12:18" },
        { name: "Pep Rally", start: "12:18", end: "12:43" },
        { name: "Lunch", start: "12:43", end: "13:19" },
        { name: "Passing", start: "13:19", end: "13:25" },
        { name: "Period 6", start: "13:25", end: "14:06" },
        { name: "Passing", start: "14:06", end: "14:12" },
        { name: "Period 7", start: "14:12", end: "14:53" },
        { name: "Passing", start: "14:53", end: "14:59" },
        { name: "Period 8", start: "14:59", end: "15:40" }
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

// Add grade level and middle school schedules
let gradeLevel = localStorage.getItem('gradeLevel') || 'highSchool'; // 'highSchool' or 'middleSchool'

const middleSchoolSchedules = {
    normal: [
        { name: "Homeroom", start: "08:10", end: "08:15" },
        { name: "Passing", start: "08:15", end: "08:18" },
        { name: "Period 1", start: "08:18", end: "08:55" },
        { name: "Passing", start: "08:55", end: "09:00" },
        { name: "Period 2", start: "09:00", end: "09:40" },
        { name: "Passing", start: "09:40", end: "09:45" },
        { name: "Period 3", start: "09:45", end: "10:25" },
        { name: "Passing", start: "10:25", end: "10:30" },
        { name: "SAINTS Advisory Time", start: "10:30", end: "11:10" },
        { name: "Passing", start: "11:10", end: "11:13" },
        { name: "Lunch", start: "11:13", end: "11:43" },
        { name: "Passing", start: "11:43", end: "11:47" },
        { name: "Period 4", start: "11:47", end: "12:27" },
        { name: "Passing", start: "12:27", end: "12:31" },
        { name: "Period 5", start: "12:31", end: "13:11" },
        { name: "Passing", start: "13:11", end: "13:15" },
        { name: "Period 6", start: "13:15", end: "13:55" },
        { name: "Passing", start: "13:55", end: "13:59" },
        { name: "Period 7", start: "13:59", end: "14:39" },
        { name: "Passing", start: "14:39", end: "14:43" },
        { name: "Period 8", start: "14:43", end: "15:30" }
    ],
    chapel: [
        { name: "Homeroom", start: "08:10", end: "08:15" },
        { name: "Passing", start: "08:15", end: "08:18" },
        { name: "Period 1", start: "08:18", end: "08:55" },
        { name: "Passing", start: "08:55", end: "09:00" },
        { name: "Period 2", start: "09:00", end: "09:40" },
        { name: "Passing", start: "09:40", end: "09:45" },
        { name: "Period 3", start: "09:45", end: "10:25" },
        { name: "Passing", start: "10:25", end: "10:30" },
        { name: "Chapel", start: "10:30", end: "11:10" },
        { name: "Passing", start: "11:10", end: "11:13" },
        { name: "Lunch", start: "11:13", end: "11:43" },
        { name: "Passing", start: "11:43", end: "11:47" },
        { name: "Chapel Debrief", start: "11:47", end: "12:07" },
        { name: "Passing", start: "12:07", end: "12:10" },
        { name: "Period 4", start: "12:10", end: "12:45" },
        { name: "Passing", start: "12:45", end: "12:49" },
        { name: "Period 5", start: "12:49", end: "13:27" },
        { name: "Passing", start: "13:27", end: "13:31" },
        { name: "Period 6", start: "13:31", end: "14:07" },
        { name: "Passing", start: "14:07", end: "14:11" },
        { name: "Period 7", start: "14:11", end: "14:49" },
        { name: "Passing", start: "14:49", end: "14:53" },
        { name: "Period 8", start: "14:53", end: "15:30" }
    ]
};

// Modify your DOMContentLoaded handler
document.addEventListener("DOMContentLoaded", async function() {
    promptForGradeLevelIfFirstTime();
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

    // Grade level dropdown initialization and handler
    let gradeDropdown = document.getElementById('grade-level-dropdown');
    if (!gradeDropdown) {
        // Create dropdown if it doesn't exist
        gradeDropdown = document.createElement('select');
        gradeDropdown.id = 'grade-level-dropdown';
        const highSchoolOption = document.createElement('option');
        highSchoolOption.value = 'highSchool';
        highSchoolOption.textContent = 'High School';
        const middleSchoolOption = document.createElement('option');
        middleSchoolOption.value = 'middleSchool';
        middleSchoolOption.textContent = 'Middle School';
        gradeDropdown.appendChild(highSchoolOption);
        gradeDropdown.appendChild(middleSchoolOption);
        document.getElementById('app').prepend(gradeDropdown);
    }
    gradeDropdown.value = gradeLevel;
    gradeDropdown.addEventListener('change', function() {
        gradeLevel = this.value;
        localStorage.setItem('gradeLevel', gradeLevel); // Save selection
        updateScheduleDropdown();
        // Switch to the first schedule for the new grade
        const activeSchedules = getActiveSchedules();
        const firstSchedule = Object.keys(activeSchedules)[0];
        switchSchedule(firstSchedule);
    });

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
function getActiveSchedules() {
    return gradeLevel === 'middleSchool' ? middleSchoolSchedules : schedules;
}

function getGlobalPeriodNames() {
    return JSON.parse(localStorage.getItem('globalPeriodNames') || '{}');
}

function setGlobalPeriodName(index, newName) {
    const names = getGlobalPeriodNames();
    names[index] = newName;
    localStorage.setItem('globalPeriodNames', JSON.stringify(names));
}

// Update switchSchedule to apply global period names
function switchSchedule(scheduleName) {
    if (!scheduleName) return;
    
    try {
        let schedule;
        if (scheduleName.startsWith('customSchedule_')) {
            const savedSchedule = localStorage.getItem(scheduleName);
            if (savedSchedule) {
                schedule = JSON.parse(savedSchedule);
            } else {
                console.error(`Custom schedule ${scheduleName} not found`);
                return;
            }
        } else {
            const activeSchedules = getActiveSchedules();
            if (activeSchedules[scheduleName]) {
                schedule = JSON.parse(JSON.stringify(activeSchedules[scheduleName]));
            } else {
                console.error(`Schedule ${scheduleName} not found`);
                return;
            }
        }

        // Apply global period names for all "Period X"
        const globalNames = getGlobalPeriodNames();
        schedule.forEach((period, idx) => {
            if (period.name.startsWith("Period ")) {
                if (globalNames[idx]) {
                    period.name = globalNames[idx];
                }
            }
        });

        currentSchedule = schedule;
        currentScheduleName = scheduleName;
        localStorage.setItem('currentScheduleName', scheduleName);

        const displayName = scheduleName.startsWith('customSchedule_') 
            ? scheduleName.replace('customSchedule_', '')
            : scheduleDisplayNames[scheduleName] || scheduleName;
        
        const headingText = `${displayName} Schedule ▸ ${schedule[0].name}`;
        document.getElementById("countdown-heading").innerText = headingText;
        
        const dropdown = document.getElementById("schedule-dropdown");
        if (dropdown) dropdown.value = scheduleName;
        
        updateScheduleDisplay();
        updateCountdowns();

        console.log(`Switched to schedule: ${scheduleName}`);
    } catch (error) {
        console.error('Error switching schedule:', error);
        currentSchedule = schedules[scheduleName] || schedules.normal;
    }
}

// Update renamePeriod to set global name and apply to all schedules
function renamePeriod(index, newName) {
    if (!newName.trim()) return;

    // Only allow renaming for main period indices
    const mainIndices = getMainPeriodIndices(currentSchedule);
    if (!mainIndices.includes(index)) return;

    try {
        setGlobalPeriodName(index, newName);

        // Update all schedules (high school, middle school, custom)
        [schedules, middleSchoolSchedules].forEach(schedObj => {
            Object.values(schedObj).forEach(schedule => {
                if (schedule[index] && !schedule[index].name.includes("Passing") && !schedule[index].name.includes("Lunch") && !schedule[index].name.includes("Chapel") && !schedule[index].name.includes("Pep Rally") && !schedule[index].name.includes("Homeroom") && !schedule[index].name.includes("SAINTS Advisory Time") && !schedule[index].name.includes("Chapel Debrief")) {
                    schedule[index].name = newName;
                }
            });
        });
        // Update custom schedules in localStorage
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('customSchedule_')) {
                const customSchedule = JSON.parse(localStorage.getItem(key));
                if (customSchedule[index] && !customSchedule[index].name.includes("Passing") && !customSchedule[index].name.includes("Lunch") && !customSchedule[index].name.includes("Chapel") && !customSchedule[index].name.includes("Pep Rally") && !customSchedule[index].name.includes("Homeroom") && !customSchedule[index].name.includes("SAINTS Advisory Time") && !customSchedule[index].name.includes("Chapel Debrief")) {
                    customSchedule[index].name = newName;
                    localStorage.setItem(key, JSON.stringify(customSchedule));
                }
            }
        });

        // Update current schedule
        currentSchedule[index].name = newName;
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

        console.log(`Successfully renamed period at index ${index} to ${newName}`);
    } catch (error) {
        console.error('Error renaming period:', error);
    }
}

// Helper: get indices of main periods for current schedule
function getMainPeriodIndices(schedule) {
    // For high school: indices 0,2,4,6,8,12,14,16 (Period 1-8)
    // For middle school: find all indices where name starts with "Period" or was renamed
    const indices = [];
    schedule.forEach((period, idx) => {
        // If original or renamed period (not Passing/Lunch/etc)
        if (
            period.name.startsWith("Period ") ||
            (getGlobalPeriodNames()[idx] && !period.name.includes("Passing") && !period.name.includes("Lunch") && !period.name.includes("Chapel") && !period.name.includes("Pep Rally") && !period.name.includes("Homeroom") && !period.name.includes("SAINTS Advisory Time") && !period.name.includes("Chapel Debrief"))
        ) {
            indices.push(idx);
        }
    });
    return indices;
}

// Update populateRenamePeriods to always show inputs for main period indices
function populateRenamePeriods() {
    const content = document.getElementById("rename-periods-content");
    if (!content) return;
    
    content.innerHTML = '';
    const mainIndices = getMainPeriodIndices(currentSchedule);
    mainIndices.forEach(index => {
        const period = currentSchedule[index];
        const div = document.createElement('div');
        div.className = 'rename-period';
        const label = document.createElement('label');
        label.htmlFor = `period-${index}`;
        label.textContent = `Period ${index + 1}:`;
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `period-${index}`;
        input.value = period.name;
        input.onchange = (e) => renamePeriod(index, e.target.value);
        div.appendChild(label);
        div.appendChild(input);
        content.appendChild(div);
    });
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
    if (!dropdown) return;
    dropdown.innerHTML = "";

    const activeSchedules = getActiveSchedules();
    for (let key in activeSchedules) {
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
    // No-op: do not load or save built-in schedules from localStorage anymore
}

// Add this function near the top (after variable declarations)
function promptForGradeLevelIfFirstTime() {
    if (!localStorage.getItem('gradeLevel')) {
        localStorage.clear();

        // Create modal overlay
        const modal = document.createElement('div');
        modal.id = 'grade-level-modal';

        // Modal content (improved design, now uses CSS classes)
        modal.innerHTML = `
            <div class="grade-level-modal-box">
                <h2>Welcome!</h2>
                <p>What school level are you in?</p>
                <div class="grade-level-modal-buttons">
                    <button id="choose-highschool" class="grade-level-modal-btn">High School</button>
                    <button id="choose-middleschool" class="grade-level-modal-btn">Middle School</button>
                </div>
                <div class="grade-level-modal-info">
                    <i class="fas fa-info-circle"></i>
                    You can change your school level anytime in Settings.
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('choose-highschool').onclick = () => {
            localStorage.setItem('gradeLevel', 'highSchool');
            gradeLevel = 'highSchool';
            modal.remove();
            updateScheduleDropdown();
            switchSchedule('normal');
        };
        document.getElementById('choose-middleschool').onclick = () => {
            localStorage.setItem('gradeLevel', 'middleSchool');
            gradeLevel = 'middleSchool';
            modal.remove();
            updateScheduleDropdown();
            switchSchedule('normal');
        };
    }
}

// Add this helper function
function updateAllSchedules(oldName, newName) {
    // Update all default schedules in memory only
    Object.keys(schedules).forEach(scheduleName => {
        const schedule = schedules[scheduleName];
        let modified = false;
        schedule.forEach(period => {
            if (period.name === oldName && !period.name.includes("Passing") && !period.name.includes("Lunch")) {
                period.name = newName;
                modified = true;
            }
        });
        // No localStorage save for built-in schedules
    });

    // Update custom schedules in localStorage
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

    // Only allow renaming for main period indices
    const mainIndices = getMainPeriodIndices(currentSchedule);
    if (!mainIndices.includes(index)) return;

    try {
        setGlobalPeriodName(index, newName);

        // Update all schedules (high school, middle school, custom)
        [schedules, middleSchoolSchedules].forEach(schedObj => {
            Object.values(schedObj).forEach(schedule => {
                if (schedule[index] && !schedule[index].name.includes("Passing") && !schedule[index].name.includes("Lunch") && !schedule[index].name.includes("Chapel") && !schedule[index].name.includes("Pep Rally") && !schedule[index].name.includes("Homeroom") && !schedule[index].name.includes("SAINTS Advisory Time") && !schedule[index].name.includes("Chapel Debrief")) {
                    schedule[index].name = newName;
                }
            });
        });
        // Update custom schedules in localStorage
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('customSchedule_')) {
                const customSchedule = JSON.parse(localStorage.getItem(key));
                if (customSchedule[index] && !customSchedule[index].name.includes("Passing") && !customSchedule[index].name.includes("Lunch") && !customSchedule[index].name.includes("Chapel") && !customSchedule[index].name.includes("Pep Rally") && !customSchedule[index].name.includes("Homeroom") && !customSchedule[index].name.includes("SAINTS Advisory Time") && !customSchedule[index].name.includes("Chapel Debrief")) {
                    customSchedule[index].name = newName;
                    localStorage.setItem(key, JSON.stringify(customSchedule));
                }
            }
        });

        // Update current schedule
        currentSchedule[index].name = newName;
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

        console.log(`Successfully renamed period at index ${index} to ${newName}`);
    } catch (error) {
        console.error('Error renaming period:', error);
    }
}

// Update the populateRenamePeriods function
function populateRenamePeriods() {
    const content = document.getElementById("rename-periods-content");
    if (!content) return;
    
    content.innerHTML = ''; // Clear existing content
    
    // Get all periods except Passing, Lunch, Chapel, Pep Rally, Homeroom, SAINTS Advisory Time, Chapel Debrief
    currentSchedule.forEach((period, index) => {
        if (
            !period.name.includes("Passing") &&
            !period.name.includes("Lunch") &&
            !period.name.includes("Chapel") &&
            !period.name.includes("Pep Rally") &&
            !period.name.includes("Homeroom") &&
            !period.name.includes("SAINTS Advisory Time") &&
            !period.name.includes("Chapel Debrief")
        ) {
            const div = document.createElement('div');
            div.className = 'rename-period';
            
            // Find the original period number
            let periodNumber = '';
            if (period.name.includes("Period")) {
                periodNumber = period.name.split(" ")[1]; // Get the number after "Period"
            } else {
                // If it's been renam ed, find the corresponding period in the original schedule
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

// Remove any block like this:
//
// if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
//     chrome.runtime.sendMessage("jloifnaccjamlflmemenepkmgklmfnmc", {
//         type: 'UPDATE_GRADIENT',
//         settings: { angle: settings.angle, stops: settings.stops }
//     }, function(response) {
//         // Handle response if needed
//     });
// }  
