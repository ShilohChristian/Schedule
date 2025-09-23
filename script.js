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
        { name: "Period 1", start: "08:15", end: "08:55" }, // 0
        { name: "Passing", start: "08:55", end: "09:01" }, // 1
        { name: "Period 2", start: "09:01", end: "09:40" }, // 2
        { name: "Chapel", start: "09:40", end: "10:30" },   // 3
        { name: "Passing", start: "10:30", end: "10:36" },  // 4
        { name: "Period 3", start: "10:36", end: "11:17" }, // 5 (should be index 4)
        { name: "Period 4", start: "11:23", end: "12:03" }, // 7 (should be index 6)
        { name: "Lunch", start: "12:03", end: "12:39" },    // 8
        { name: "Passing", start: "12:39", end: "12:45" },  // 9
        { name: "Period 5", start: "12:45", end: "13:24" }, // 10 (should be index 8)
        { name: "Passing", start: "13:24", end: "13:30" },  // 11
        { name: "Period 6", start: "13:30", end: "14:10" }, // 12 (should be index 10)
        { name: "Passing", start: "14:10", end: "14:16" },  // 13
        { name: "Period 7", start: "14:16", end: "14:55" }, // 14 (should be index 12)
        { name: "Passing", start: "14:55", end: "15:01" },  // 15
        { name: "Period 8", start: "15:01", end: "15:40" }  // 16 (should be index 14)
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
    // Bind inline handlers safely (keeps existing onclick attributes but also ensures listeners exist)
    if (typeof bindInlineHandlers === 'function') bindInlineHandlers();
    // Show one-time update notice for returning users (not shown on first visit)
    if (typeof showUpdateNoticeOnce === 'function') {
        try { showUpdateNoticeOnce(); } catch(e) { console.warn('showUpdateNoticeOnce failed', e); }
    }
});

// Migration: fix legacy '[object Object]' saved values for globalPeriodNames
// Run early so subsequent code reads a valid JSON string
(function migrateGlobalPeriodNames() {
    try {
        const raw = localStorage.getItem('globalPeriodNames');
        if (!raw) return;
        // If it's the specific broken sentinel string or it's not valid JSON, try to recover
        if (raw === '[object Object]') {
            // Try to recover from periodRenames if available
            try {
                const pr = JSON.parse(localStorage.getItem('periodRenames') || '{}');
                localStorage.setItem('globalPeriodNames', JSON.stringify(pr || {}));
                console.info('Migrated legacy globalPeriodNames from periodRenames');
                return;
            } catch (e) {
                // fallback to empty object
                localStorage.setItem('globalPeriodNames', JSON.stringify({}));
                console.info('Replaced legacy globalPeriodNames with empty object');
                return;
            }
        }

        // If not exact sentinel, check if JSON.parse fails; if so, try to coerce
        try {
            JSON.parse(raw);
        } catch (e) {
            // Attempt to coerce by checking if it looks like an object string (e.g., '[object Object]')
            if (raw.indexOf('[object') !== -1) {
                localStorage.setItem('globalPeriodNames', JSON.stringify({}));
                console.info('Normalized malformed globalPeriodNames to {}');
            } else {
                // Last resort: leave it alone — it may be a deliberate string value
            }
        }
    } catch (e) {
        console.warn('Error migrating globalPeriodNames', e);
    }
})();

// Ensure single timer loop via TimerManager
if (window.TimerManager && window.TimerManager.isRunning && window.TimerManager.isRunning()) {
    // already running
} else if (window.TimerManager) {
    window.TimerManager.start();
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
            console.debug('Tuesday detected - switched to chapel schedule');
        } else if (dayOfWeek === 3) { // 3 represents Wednesday
            switchSchedule('normal');
            console.debug('Wednesday detected - switched to normal schedule');
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
    if (window.TimerManager) window.TimerManager.restart();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Schedule management functions
function getActiveSchedules() {
    return gradeLevel === 'middleSchool' ? middleSchoolSchedules : schedules;
}

// Helper: convert 'HH:MM' to seconds since midnight
function getTimeInSeconds(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 3600 + m * 60;
}

// Helper: get period renames from localStorage
function getPeriodRenames() {
    return JSON.parse(localStorage.getItem('periodRenames') || '{}');
}
function setPeriodRename(periodNum, newName) {
    const renames = getPeriodRenames();
    renames[periodNum] = newName;
    localStorage.setItem('periodRenames', JSON.stringify(renames));
}

// Helper: get global period names as an object
function getGlobalPeriodNames() {
    return JSON.parse(localStorage.getItem('globalPeriodNames') || '{}');
}

// Add periodNum to all periods in all schedules
function addPeriodNumsToSchedules() {
    [schedules, middleSchoolSchedules].forEach(schedObj => {
        Object.values(schedObj).forEach(schedule => {
            let sequentialCounter = 1;
            schedule.forEach(period => {
                // Prefer explicit "Period N" numbers embedded in the name
                const m = (period && period.name) ? period.name.match(/^Period\s+(\d+)/i) : null;
                if (m && m[1]) {
                    period.periodNum = String(m[1]);
                    // keep sequentialCounter in sync (next unused)
                    sequentialCounter = Math.max(sequentialCounter, parseInt(m[1], 10) + 1);
                } else if (period && /^Period\b/i.test(period.name)) {
                    // fallback: if name starts with "Period" but no number, assign next sequential
                    period.periodNum = String(sequentialCounter++);
                } else {
                    // not a numbered period
                    period.periodNum = undefined;
                }
            });
        });
    });
}
addPeriodNumsToSchedules();

// Central TimerManager: single main interval that updates countdowns and (optionally) progress bar.
// This avoids duplicate intervals and race conditions between countdown and progress updates.
window.TimerManager = (function() {
    let mainInterval = null;
    let progressEnabled = (localStorage.getItem('progressBarEnabled') === 'true');

    function tick() {
        try {
            if (typeof updateCountdowns === 'function') updateCountdowns();
        } catch (e) { console.warn('TimerManager: updateCountdowns failed', e); }
        try {
            if (progressEnabled && typeof updateProgressBar === 'function') updateProgressBar();
        } catch (e) { console.warn('TimerManager: updateProgressBar failed', e); }
    }

    function start() {
        if (mainInterval) return mainInterval;
        tick();
        mainInterval = setInterval(tick, 1000);
        return mainInterval;
    }

    function stop() {
        if (mainInterval) {
            clearInterval(mainInterval);
            mainInterval = null;
        }
    }

    function restart() {
        stop();
        return start();
    }

    function setProgress(flag) {
        progressEnabled = !!flag;
        localStorage.setItem('progressBarEnabled', progressEnabled ? 'true' : 'false');
        // If enabling progress ensure the main loop is running so progress updates occur
        if (progressEnabled) start();
    }

    function isRunning() { return !!mainInterval; }
    function getIntervalId() { return mainInterval; }

    return { start, stop, restart, setProgress, isRunning, getIntervalId };
})();

// Apply renames to a schedule
function applyRenamesToSchedule(schedule) {
    const renames = getPeriodRenames();
    schedule.forEach(period => {
        if (period.periodNum && renames[period.periodNum]) {
            period.name = renames[period.periodNum];
        }
    });
}

// Update switchSchedule to apply renames
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
        applyRenamesToSchedule(schedule);
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
    console.debug(`Switched to schedule: ${scheduleName}`);
            if (typeof window.refreshDevtoolsOverlay === 'function') window.refreshDevtoolsOverlay();
    } catch (error) {
        console.error('Error switching schedule:', error);
        currentSchedule = schedules[scheduleName] || schedules.normal;
    }
}

// Replace duplicate renamePeriod implementations with one authoritative function
function renamePeriod(periodNumber, newName) {
    if (!periodNumber) return;
    const periodNumStr = String(periodNumber);

    // Do NOT mutate canonical built-in schedules. Keep built-ins unchanged and
    // rely on rename maps (periodRenames/globalPeriodNames) and applyRenamesToSchedule
    // when rendering or switching schedules. This avoids side-effects that break
    // lookups that rely on original names.

    // Update custom schedules stored in localStorage
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('customSchedule_')) {
            try {
                const customSchedule = JSON.parse(localStorage.getItem(key) || '[]');
                let modified = false;
                customSchedule.forEach(period => {
                    if (String(period.periodNum) === periodNumStr) {
                        period.name = newName;
                        modified = true;
                    }
                });
                if (modified) {
                    localStorage.setItem(key, JSON.stringify(customSchedule));
                }
            } catch (e) {
                console.warn('Invalid custom schedule in localStorage for key', key);
            }
        }
    });

    // Persist rename maps
    const globalNames = getGlobalPeriodNames();
    const renames = getPeriodRenames();

    // Use the canonical default name ("Period N") as the baseline for when to remove a mapping.
    // This avoids comparing against in-memory schedules which may have already been mutated
    // earlier in this function and would therefore incorrectly equal the newName.
    const canonicalDefault = `Period ${periodNumber}`;

    if (!newName || !newName.trim() || newName.trim() === canonicalDefault) {
        delete globalNames[periodNumStr];
        delete renames[periodNumStr];
    } else {
        globalNames[periodNumStr] = newName;
        renames[periodNumStr] = newName;
    }

    localStorage.setItem('globalPeriodNames', JSON.stringify(globalNames));
    localStorage.setItem('periodRenames', JSON.stringify(renames));

    // If the current schedule is one of the built-ins, recreate a fresh copy and apply renames
    const activeSchedules = getActiveSchedules();
    if (activeSchedules[currentScheduleName]) {
        // Copy from canonical source to avoid previous in-memory mutations
        currentSchedule = JSON.parse(JSON.stringify(activeSchedules[currentScheduleName]));
        applyRenamesToSchedule(currentSchedule);
    } else {
        // If custom schedule is active, reload it from storage (if present)
        if (currentScheduleName && currentScheduleName.startsWith('customSchedule_')) {
            const saved = localStorage.getItem(currentScheduleName);
            if (saved) currentSchedule = JSON.parse(saved);
        }
        applyRenamesToSchedule(currentSchedule);
    }

    // Update inputs/UI if present
    const inputBox = document.getElementById(`period-${periodNumStr}`);
    if (inputBox) inputBox.value = newName;

    // Refresh schedule display and countdown
    updateScheduleDisplay();
    updateCountdowns();

    // Restart centralized timer loop to ensure visual consistency
    if (window.TimerManager && typeof window.TimerManager.restart === 'function') {
        window.TimerManager.restart();
    } else {
        // Fallback to legacy startCountdown if TimerManager isn't present
        if (typeof startCountdown === 'function') {
            startCountdown();
        }
    }

    // Persist the change to settings if applicable
    if (typeof saveSettings === 'function') saveSettings();

    console.debug(`Renamed period ${periodNumStr} => "${newName}"`);
    if (typeof window.refreshDevtoolsOverlay === 'function') window.refreshDevtoolsOverlay();
}
window.renamePeriod = renamePeriod; // ensure globally accessible

// Replace populateRenamePeriods implementation with one that uses periodNum keys
function populateRenamePeriods() {
    const content = document.getElementById("rename-periods-content");
    if (!content) return;
    content.innerHTML = '';

    const globalNames = getGlobalPeriodNames();
    const renames = getPeriodRenames();
    // Use the schedules for the currently selected grade level so periodNum indices match
    const activeSchedules = getActiveSchedules();
    const originalSchedule = activeSchedules[currentScheduleName] || currentSchedule || activeSchedules['normal'];

    // Iterate original schedule and add inputs for numbered periods only
    originalSchedule.forEach(origPeriod => {
        const pn = origPeriod && origPeriod.periodNum;
        if (!pn) return;

        // Skip non-user-editable types by name
        const skipIf = ['Passing', 'Lunch', 'Chapel', 'Pep Rally', 'Homeroom', 'SAINTS Advisory Time', 'Chapel Debrief'];
        if (skipIf.some(s => (origPeriod.name || '').includes(s))) return;

        const periodNumber = String(pn);
        const defaultName = `Period ${periodNumber}`;
        const globalName = globalNames[periodNumber];
        const renameName = renames[periodNumber];
        const inputValue = (globalName && globalName.trim()) ? globalName
            : (renameName && renameName.trim()) ? renameName
            : (origPeriod.name && origPeriod.name.trim()) ? origPeriod.name
            : defaultName;

        const div = document.createElement('div');
        div.className = 'rename-period';

        const label = document.createElement('label');
        label.htmlFor = `period-${periodNumber}`;
        label.textContent = `Period ${periodNumber}:`;

        const input = document.createElement('input');
        input.type = 'text';
        input.id = `period-${periodNumber}`;
        input.value = inputValue;
        input.onchange = (e) => {
            // Use global renamePeriod
            renamePeriod(periodNumber, e.target.value);
        };

        div.appendChild(label);
        div.appendChild(input);
        content.appendChild(div);
    });
}
window.populateRenamePeriods = populateRenamePeriods;

// --- DEVTOOLS secret debug overlay ---
// Shows a small overlay only when the user types the sequence 'DEVTOOLS'.
(() => {
    const sequence = 'DEVTOOLS';
    let buffer = '';
    function showDebugOverlay() {
    if (document.getElementById('devtools-debug-overlay')) return;
    // create backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'devtools-debug-backdrop';
    backdrop.style.position = 'fixed';
    backdrop.style.inset = '0';
    backdrop.style.zIndex = 2147483646;
    backdrop.style.background = 'transparent';
    document.body.appendChild(backdrop);

    const overlay = document.createElement('div');
    overlay.id = 'devtools-debug-overlay';
    overlay.style.position = 'fixed';
        overlay.style.right = '12px';
        overlay.style.bottom = '12px';
        overlay.style.zIndex = 2147483647;
        overlay.style.background = 'rgba(0,0,0,0.85)';
        overlay.style.color = '#fff';
        overlay.style.padding = '12px';
        overlay.style.borderRadius = '8px';
        overlay.style.fontFamily = 'monospace';
        overlay.style.maxWidth = '420px';
        overlay.style.maxHeight = '60vh';
        overlay.style.overflow = 'auto';
    overlay.style.pointerEvents = 'auto';

        // Header with title and button group so buttons don't overlap the title
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.gap = '12px';
        header.style.marginBottom = '8px';

        const title = document.createElement('div');
        title.style.fontWeight = '700';
        title.textContent = 'DEVTOOLS Debug Overlay';

        const btnGroup = document.createElement('div');
        btnGroup.style.display = 'flex';
        btnGroup.style.gap = '8px';

        const cleanBtn = document.createElement('button');
        cleanBtn.textContent = 'Clean/Normalize localStorage';
        cleanBtn.style.cursor = 'pointer';
        cleanBtn.addEventListener('click', async (ev) => {
            ev.stopPropagation();
            cleanBtn.disabled = true;
            cleanBtn.textContent = 'Cleaning...';
            try {
                const report = normalizeLocalStorage();
                // wait a tick to ensure changes persisted
                setTimeout(() => {
                    refreshDebugOverlay();
                    cleanBtn.textContent = 'Cleaned';
                    setTimeout(() => { cleanBtn.textContent = 'Clean/Normalize localStorage'; cleanBtn.disabled = false; }, 1200);
                    // show brief status
                    const status = document.getElementById('devtools-clean-status');
                    if (status) status.textContent = `Fixed keys: ${report.fixedKeys.length}; details: ${report.fixedKeys.join(', ') || 'none'}`;
                }, 150);
            } catch (e) {
                console.error('Normalization failed', e);
                cleanBtn.textContent = 'Error';
                cleanBtn.disabled = false;
            }
        });
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.style.cursor = 'pointer';
        closeBtn.addEventListener('click', (ev) => { ev.stopPropagation(); overlay.remove(); const bd = document.getElementById('devtools-debug-backdrop'); if (bd) bd.remove(); });
        btnGroup.appendChild(cleanBtn);
        btnGroup.appendChild(closeBtn);

        header.appendChild(title);
        header.appendChild(btnGroup);
        overlay.appendChild(header);

    const status = document.createElement('div');
    status.id = 'devtools-clean-status';
    status.style.marginTop = '8px';
    status.style.fontSize = '12px';
    status.style.opacity = '0.9';
    overlay.appendChild(status);

    const content = document.createElement('pre');
    content.id = 'devtools-debug-content';
    content.style.whiteSpace = 'pre-wrap';
    content.style.marginTop = '12px';
    overlay.appendChild(content);

        document.body.appendChild(overlay);
        // clicking backdrop closes overlay too
        backdrop.addEventListener('click', () => { overlay.remove(); backdrop.remove(); });
        refreshDebugOverlay();
    }

    function refreshDebugOverlay() {
        const content = document.getElementById('devtools-debug-content');
        if (!content) return;
        const keys = Object.keys(localStorage).sort();
        const renames = getPeriodRenames();
        const globalNames = getGlobalPeriodNames();
        const intervals = {
            TimerManager_running: !!(window.TimerManager && window.TimerManager.isRunning && window.TimerManager.isRunning()),
            legacy_countdownInterval: !!window.countdownInterval,
            legacy_progressInterval: !!window.progressInterval
        };

        // Build a key->value map showing parsed values where possible
        const kv = {};
        keys.forEach(k => {
            const raw = localStorage.getItem(k);
            let parsed = raw;
            try {
                parsed = JSON.parse(raw);
            } catch (e) {
                // not JSON, keep raw string
                parsed = raw;
            }
            kv[k] = parsed;
        });

        const debug = {
            now: new Date().toString(),
            currentScheduleName,
            periodRenames: renames,
            globalPeriodNames: globalNames,
            localStorage: kv,
            intervals
        };
        content.textContent = JSON.stringify(debug, null, 2);
    }

    // Normalization helper: attempt to fix malformed localStorage values
    function normalizeLocalStorage() {
        const fixedKeys = [];
        try {
            Object.keys(localStorage).forEach(k => {
                try {
                    const raw = localStorage.getItem(k);
                    if (raw === null) return;

                    // Fix literal '[object Object]'
                    if (raw === '[object Object]') {
                        // For known keys, prefer sensible defaults
                        if (k === 'globalPeriodNames' || k === 'periodRenames') {
                            localStorage.setItem(k, JSON.stringify({}));
                        } else if (k.startsWith('customSchedule_')) {
                            localStorage.setItem(k, JSON.stringify([]));
                        } else {
                            localStorage.setItem(k, JSON.stringify(null));
                        }
                        fixedKeys.push(k);
                        return;
                    }

                    // For periodRenames/globalPeriodNames, ensure valid JSON
                    if (k === 'periodRenames' || k === 'globalPeriodNames') {
                        try {
                            JSON.parse(raw);
                        } catch (e) {
                            // Could be a stringified object via toString(); try best-effort fallback
                            // If there's another sensible source, copy it (e.g., periodRenames -> globalPeriodNames)
                            if (k === 'globalPeriodNames') {
                                const prRaw = localStorage.getItem('periodRenames');
                                try {
                                    const pr = prRaw ? JSON.parse(prRaw) : {};
                                    localStorage.setItem(k, JSON.stringify(pr || {}));
                                    fixedKeys.push(k);
                                    return;
                                } catch (e2) {
                                    // fallback to empty object
                                    localStorage.setItem(k, JSON.stringify({}));
                                    fixedKeys.push(k);
                                    return;
                                }
                            }
                            // For periodRenames fallback to empty object
                            localStorage.setItem(k, JSON.stringify({}));
                            fixedKeys.push(k);
                            return;
                        }
                    }

                    // For custom schedules, ensure arrays
                    if (k.startsWith('customSchedule_')) {
                        try {
                            const val = JSON.parse(raw);
                            if (!Array.isArray(val)) {
                                // coerce to array if possible
                                localStorage.setItem(k, JSON.stringify(Array.isArray(val) ? val : []));
                                fixedKeys.push(k);
                            }
                        } catch (e) {
                            // replace with empty array
                            localStorage.setItem(k, JSON.stringify([]));
                            fixedKeys.push(k);
                            return;
                        }
                    }
                } catch (e) {
                    // ignore per-key errors
                }
            });
        } catch (e) {
            console.warn('normalizeLocalStorage error', e);
        }
        return { fixedKeys };
    }

    window.normalizeLocalStorage = normalizeLocalStorage;

    // Keep a short-term undo snapshot for normalization
    let _lastNormalizationSnapshot = null;

    function takeNormalizationSnapshot() {
        _lastNormalizationSnapshot = {};
        Object.keys(localStorage).forEach(k => { _lastNormalizationSnapshot[k] = localStorage.getItem(k); });
    }

    function undoNormalization() {
        if (!_lastNormalizationSnapshot) return { restored: 0 };
        Object.keys(_lastNormalizationSnapshot).forEach(k => {
            try { localStorage.setItem(k, _lastNormalizationSnapshot[k]); } catch (e) {}
        });
        const count = Object.keys(_lastNormalizationSnapshot).length;
        _lastNormalizationSnapshot = null;
        refreshDebugOverlay();
        return { restored: count };
    }
    window.undoNormalization = undoNormalization;

    // Attach commonly used inline handlers to DOM elements (safer than relying on inline attributes only)
    function bindInlineHandlers() {
        const signInBtn = document.getElementById('sign-in-button');
        if (signInBtn && !signInBtn._bound) {
            signInBtn.addEventListener('click', () => { if (typeof handleAuthButton === 'function') handleAuthButton(); });
            signInBtn._bound = true;
        }

        const closeSettingsBtns = document.querySelectorAll('.close-settings, .settings-close, #settings-close, .close-settings');
        closeSettingsBtns.forEach(btn => {
            if (!btn._bound) {
                btn.addEventListener('click', () => { if (typeof toggleSettingsSidebar === 'function') toggleSettingsSidebar(); else location.reload(); });
                btn._bound = true;
            }
        });

        const removeBg = document.getElementById('remove-bg-button');
        if (removeBg && !removeBg._bound) {
            removeBg.addEventListener('click', () => { if (typeof removeBackground === 'function') removeBackground(); });
            removeBg._bound = true;
        }

        const progressCheckbox = document.getElementById('progress-bar');
        if (progressCheckbox && !progressCheckbox._bound) {
            progressCheckbox.addEventListener('change', () => { if (typeof toggleProgressBar === 'function') toggleProgressBar(); });
            progressCheckbox._bound = true;
        }

        const scheduleDropdown = document.getElementById('schedule-dropdown');
        if (scheduleDropdown && !scheduleDropdown._bound) {
            scheduleDropdown.addEventListener('change', (e) => { if (typeof switchSchedule === 'function') switchSchedule(e.target.value); });
            scheduleDropdown._bound = true;
        }

        // Save custom schedule button
        const saveScheduleBtn = document.getElementById('save-schedule-button');
        if (saveScheduleBtn && !saveScheduleBtn._bound) {
            saveScheduleBtn.addEventListener('click', () => { if (typeof saveCustomSchedule === 'function') saveCustomSchedule(); });
            saveScheduleBtn._bound = true;
        }

        const settingsButton = document.getElementById('settings-button');
        if (settingsButton && !settingsButton._bound) {
            settingsButton.addEventListener('click', () => { if (typeof toggleSettingsSidebar === 'function') toggleSettingsSidebar(); });
            settingsButton._bound = true;
        }

        const saveExtensionButtons = document.querySelectorAll('#saveExtensionButton');
        saveExtensionButtons.forEach(btn => {
            if (!btn._bound) {
                btn.addEventListener('click', () => { if (typeof saveExtensionGradient === 'function') saveExtensionGradient(); });
                btn._bound = true;
            }
        });
    }

    // Enhance overlay close behavior and add Undo button
    const originalShowDebugOverlay = window.refreshDevtoolsOverlay;
    // We'll override show function by adding backdrop/ESC handling when overlay is created
    const _origShow = null; // placeholder

    // Monkey-patch showDebugOverlay to add ESC/backdrop and Undo UI (we cannot directly access inner closure functions here, so rely on DOM hookups)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const overlay = document.getElementById('devtools-debug-overlay');
            const backdrop = document.getElementById('devtools-debug-backdrop');
            if (overlay) overlay.remove();
            if (backdrop) backdrop.remove();
        }
    });

    // Click outside overlay to close (also remove backdrop)
    document.addEventListener('click', (e) => {
        const overlay = document.getElementById('devtools-debug-overlay');
        if (!overlay) return;
        const isInside = overlay.contains(e.target);
        if (!isInside) {
            const backdrop = document.getElementById('devtools-debug-backdrop');
            overlay.remove();
            if (backdrop) backdrop.remove();
        }
    });

    // Add undo button wiring: add listener to overlay when present
    const observer = new MutationObserver(() => {
        const overlay = document.getElementById('devtools-debug-overlay');
        if (!overlay) return;
        if (overlay._wired) return;
        // insert Undo button near clean status
        const status = document.getElementById('devtools-clean-status');
        if (status) {
            const undoBtn = document.createElement('button');
            undoBtn.textContent = 'Undo Clean';
            undoBtn.style.marginLeft = '8px';
            undoBtn.addEventListener('click', (ev) => {
                ev.stopPropagation();
                const res = undoNormalization();
                status.textContent = `Undo restored ${res.restored} keys`;
            });
            status.appendChild(undoBtn);
        }
        overlay._wired = true;
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Keyboard listener for letter sequence
    window.addEventListener('keydown', (e) => {
        // Only accept typical printable letters
        const k = e.key && e.key.length === 1 ? e.key.toUpperCase() : null;
        if (!k) return;
        buffer += k;
        if (buffer.length > sequence.length) buffer = buffer.slice(buffer.length - sequence.length);
        if (buffer === sequence) {
            showDebugOverlay();
            buffer = '';
        }
    });

    // Expose refresh function for overlay
    window.refreshDevtoolsOverlay = refreshDebugOverlay;
})();

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

function updateScheduleDisplay() {
    const scheduleContainer = document.getElementById("schedule");
    if (!scheduleContainer) return;
    scheduleContainer.innerHTML = "";
    const globalNames = getGlobalPeriodNames();
    const renames = getPeriodRenames();
    // Ensure originalSchedule matches the active grade level (high vs middle school)
    const activeSchedules = getActiveSchedules();
    const originalSchedule = activeSchedules[currentScheduleName] || currentSchedule;
    currentSchedule.forEach((period, idx) => {
        if (period.name !== "Passing") {
            // Find the canonical original period by periodNum first (more robust),
            // otherwise fall back to the schedule index.
            let origPeriod = null;
            let displayName = period.name;
            if (period && period.periodNum) {
                origPeriod = originalSchedule.find(p => String(p.periodNum) === String(period.periodNum));
            }
            if (!origPeriod) {
                origPeriod = originalSchedule[idx];
            }
            if (origPeriod && origPeriod.periodNum) {
                const periodNum = origPeriod.periodNum;
                const globalName = globalNames[periodNum];
                const renameName = renames[periodNum];
                if (globalName && globalName.trim()) {
                    displayName = globalName;
                } else if (renameName && renameName.trim()) {
                    displayName = renameName;
                } else {
                    displayName = origPeriod.name;
                }
            }
            const periodDiv = document.createElement("div");
            periodDiv.className = "period";
            const label = document.createElement("label");
            label.innerText = `${displayName}`;
            const timer = document.createElement("span");
            timer.id = `Period_Timer`;
            periodDiv.appendChild(label);
            periodDiv.appendChild(timer);
            scheduleContainer.appendChild(periodDiv);
        }
    });
    updateCountdowns();
}

// Update the browser tab title with current period and remaining time
function updateTabTitle(periodDisplayName, timeText) {
    try {
        if (!periodDisplayName || !timeText) return;
        document.title = `${periodDisplayName} | ${timeText}`;
    } catch (e) {
        // silent
    }
}


function updateCountdowns() {
    // Get current time in seconds
    const now = new Date();
    const currentTimeInSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    let currentPeriod = null;
    let periodIndex = -1;
    // Find current period (including Lunch and Passing)
    for (let i = 0; i < currentSchedule.length; i++) {
        const period = currentSchedule[i];
        if (!period || !period.start || !period.end) continue; // skip undefined or malformed
        const start = getTimeInSeconds(period.start);
        const end = getTimeInSeconds(period.end);
        if (currentTimeInSeconds >= start && currentTimeInSeconds < end) {
            currentPeriod = period;
            periodIndex = i;
            break;
        }
    }
    const timerElement = document.getElementById("current-period-time");
    const headingElement = document.getElementById("countdown-heading");
    if (!timerElement || !headingElement) return;
    let scheduleName = currentScheduleName || "normal";
    const displayNames = {
        normal: "Normal Schedule",
        chapel: "Chapel Bell Schedule",
        latePepRally: "Late Pep Rally Schedule",
        earlyPepRally: "Early Pep Rally Schedule"
    };
    let headerName;
    if (scheduleName.startsWith('customSchedule_')) {
        headerName = scheduleName.replace('customSchedule_', '') + ' Schedule';
    } else {
        headerName = displayNames[scheduleName] || (scheduleName.charAt(0).toUpperCase() + scheduleName.slice(1) + ' Schedule');
    }
    const renames = getPeriodRenames();
    let periodDisplayName = currentPeriod ? currentPeriod.name : '';
    if (currentPeriod && currentPeriod.name.startsWith('Period ')) {
        const periodNum = currentPeriod.name.split(' ')[1];
        if (renames[periodNum]) {
            periodDisplayName = renames[periodNum];
        }
    }
    if (currentPeriod) {
        headingElement.textContent = `${headerName} \u25B8 ${periodDisplayName}`;
        const end = getTimeInSeconds(currentPeriod.end);
        let secondsLeft = end - currentTimeInSeconds;
        if (secondsLeft < 0) secondsLeft = 0;
        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;
        const timeText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timerElement.textContent = timeText;
        if (typeof updateTabTitle === 'function') updateTabTitle(periodDisplayName, timeText);
    } else {
        // Always show countdown to next school day's Period 1 after last period ends
        let nextDay = new Date();
        nextDay.setHours(0,0,0,0);
        do {
            nextDay.setDate(nextDay.getDate() + 1);
        } while (nextDay.getDay() === 0 || nextDay.getDay() === 6); // 0=Sun, 6=Sat
        // Get start time of Period 1 for next school day
        let nextScheduleName = 'normal';
        if (nextDay.getDay() === 2) nextScheduleName = 'chapel'; // Tuesday
        // You can add more logic for other days if needed
        let nextSchedules = getActiveSchedules();
        let nextSchedule = nextSchedules[nextScheduleName] || nextSchedules['normal'];
        // Prefer finding by periodNum (more robust when names are renamed), fall back to name search
        let period1 = nextSchedule.find(p => p && String(p.periodNum) === '1');
        if (!period1) {
            period1 = nextSchedule.find(p => p && p.name && p.name.startsWith('Period 1'));
        }
        if (!period1 || !period1.start) {
            headingElement.textContent = `${headerName} \u25B8 No Period`;
            timerElement.textContent = "00:00";
            return;
        }
        let [h, m] = period1.start.split(':').map(Number);
        let nextPeriod1Date = new Date(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate(), h, m, 0);
        let nowDate = new Date();
        let secondsLeft = Math.floor((nextPeriod1Date - nowDate) / 1000);
        if (secondsLeft < 0) secondsLeft = 0;
        const hours = Math.floor(secondsLeft / 3600);
        const minutes = Math.floor((secondsLeft % 3600) / 60);
        const seconds = secondsLeft % 60;
    headingElement.textContent = `${headerName} \u25B8 Free`;
        const timeText = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timerElement.textContent = timeText;
    if (typeof updateTabTitle === 'function') updateTabTitle('Free', timeText);
    }
}

// Refresh page when 'x' button is clicked
const closeButton = document.getElementById('close-button');
if (closeButton) {
    closeButton.addEventListener('click', () => {
        location.reload();
    });
}

// Refresh page when the settings sidebar close button (x) is clicked
const settingsCloseButton = document.querySelector('.settings-close, #settings-close');
if (settingsCloseButton) {
    settingsCloseButton.addEventListener('click', () => {
        location.reload();
    });
}

// Refresh page when the settings sidebar close button (x) is clicked
document.addEventListener('DOMContentLoaded', () => {
    // ...existing code...
    // Refresh page when the settings sidebar close button (x) is clicked
    const sidebar = document.querySelector('.settings-sidebar, #settings-sidebar');
    if (sidebar) {
        sidebar.addEventListener('click', function(e) {
            const target = e.target;
            // Check for button, span, div, or svg with 'x' or '×' or aria-label='Close'
            if (
                (target.innerText && (target.innerText.trim() === '×' || target.innerText.trim().toLowerCase() === 'x')) ||
                target.getAttribute('aria-label') === 'Close' ||
                target.classList.contains('settings-close') ||
                target.id === 'settings-close'
            ) {
                location.reload();
            }
        });
    }
    // ...existing code...
});

// Add this helper to populate the schedule dropdown based on selected grade level
function updateScheduleDropdown() {
    const dropdown = document.getElementById('schedule-dropdown');
    if (!dropdown) return;

    // Remove existing options
    dropdown.innerHTML = '';

    const activeSchedules = getActiveSchedules();
    Object.keys(activeSchedules).forEach(key => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = scheduleDisplayNames[key] || key;
        dropdown.appendChild(opt);
    });

    // Try to keep the previously selected schedule
    const selected = localStorage.getItem('currentScheduleName') || currentScheduleName || 'normal';
    if (activeSchedules[selected]) {
        dropdown.value = selected;
    } else {
        dropdown.value = Object.keys(activeSchedules)[0] || 'normal';
    }
}

// No-op initializer for saved schedules to satisfy callers that expect it
function initializeSavedSchedules() {
    // Intentionally minimal: custom schedule migration/loading is handled elsewhere.
    // Kept as a defined function so initializeAppLogic() doesn't throw.
    return;
}

// Prompt user for grade level on first run (minimal, DOM-safe)
function promptForGradeLevelIfFirstTime() {
    if (localStorage.getItem('gradeLevel')) return;

    // Don't block if DOM not ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', promptForGradeLevelIfFirstTime);
        return;
    }

    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'grade-level-modal';
    modal.style.position = 'fixed';
    modal.style.inset = '0';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.background = 'rgba(0,0,0,0.6)';
    modal.style.zIndex = '11000';

    modal.innerHTML = `
        <div class="grade-level-modal-box" style="background:#fff;color:#222;padding:24px;border-radius:12px;min-width:280px;text-align:center;">
            <h2 style="margin:0 0 12px 0;color:#00bfa5;">Welcome!</h2>
            <p style="margin:0 0 16px 0;">What school level are you in?</p>
            <div style="display:flex;gap:12px;justify-content:center;margin-bottom:12px;">
                <button id="choose-highschool" style="padding:10px 16px;border-radius:8px;border:none;background:#00bfa5;color:#fff;cursor:pointer;">High School</button>
                <button id="choose-middleschool" style="padding:10px 16px;border-radius:8px;border:none;background:#393E46;color:#fff;cursor:pointer;">Middle School</button>
            </div>
            <div style="font-size:12px;color:#666;">You can change this anytime in Settings.</div>
        </div>
    `;

    document.body.appendChild(modal);

    const chooseHigh = document.getElementById('choose-highschool');
    const chooseMiddle = document.getElementById('choose-middleschool');

    const cleanup = () => {
        if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
        updateScheduleDropdown();
    };

    if (chooseHigh) {
        chooseHigh.addEventListener('click', () => {
            localStorage.setItem('gradeLevel', 'highSchool');
            gradeLevel = 'highSchool';
            cleanup();
            // ensure schedule list updates and switch to normal
            updateScheduleDropdown();
            try { switchSchedule('normal'); } catch(e){/* safe fallback */ }
        });
    }
    if (chooseMiddle) {
        chooseMiddle.addEventListener('click', () => {
            localStorage.setItem('gradeLevel', 'middleSchool');
            gradeLevel = 'middleSchool';
            cleanup();
            updateScheduleDropdown();
            try { switchSchedule('normal'); } catch(e){/* safe fallback */ }
        });
    }
}

// One-time update notice: explains that period names may be wrong after a recent update
function showUpdateNoticeOnce() {
    try {
        // Don't show on first visit (when gradeLevel is not set)
        if (!localStorage.getItem('gradeLevel')) return;
        // If user already saw the notice, skip
        if (localStorage.getItem('sawUpdateNotice') === 'true') return;

        // Create modal elements
        const backdrop = document.createElement('div');
        backdrop.id = 'update-notice-backdrop';
        backdrop.className = 'update-notice-backdrop';

        const dialog = document.createElement('div');
        dialog.id = 'update-notice-dialog';
        dialog.className = 'update-notice-dialog';
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        dialog.setAttribute('aria-labelledby', 'update-notice-title');

        dialog.innerHTML = `
            <button class="update-notice-close" aria-label="Close">×</button>
            <h2 id="update-notice-title">Heads up — small update</h2>
            <p>Due to a recent update, some period names may appear incorrect. All you need to do is rename the affected periods to restore the correct names.</p>
            <div class="update-notice-actions">
                <button class="btn btn-primary update-notice-ok">Got it</button>
            </div>
        `;

        backdrop.appendChild(dialog);
        document.body.appendChild(backdrop);

        // Focus management
    const closeBtn = dialog.querySelector('.update-notice-close');
    const okBtn = dialog.querySelector('.update-notice-ok');

        function closeAndRemember() {
            try { localStorage.setItem('sawUpdateNotice', 'true'); } catch (e) {}
            if (backdrop && backdrop.parentNode) backdrop.parentNode.removeChild(backdrop);
        }

        closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeAndRemember(); });
        okBtn.addEventListener('click', (e) => { e.stopPropagation(); closeAndRemember(); });
        // (Removed "Open Rename Settings" button per request)

        // Close when clicking outside dialog
        backdrop.addEventListener('click', (ev) => {
            if (ev.target === backdrop) closeAndRemember();
        });

        // Close on ESC
        function escHandler(e) {
            if (e.key === 'Escape') {
                closeAndRemember();
                document.removeEventListener('keydown', escHandler);
            }
        }
        document.addEventListener('keydown', escHandler);

        // Prevent tab trapping issues: ensure dialog is focusable
        dialog.tabIndex = -1;
        dialog.focus();

    } catch (e) {
        console.warn('showUpdateNoticeOnce error', e);
    }
}


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

// { 
// 	// Removed duplicate implementations of renamePeriod(...) and populateRenamePeriods(...)
// 	// The authoritative implementations are defined earlier in this file and exported to window:
// 	//   window.renamePeriod and window.populateRenamePeriods
// 	// Replace the duplicated blocks with safe delegates to avoid clobbering or runtime errors.

// 	// Compatibility wrapper: if legacy callers call the global functions before the authoritative ones exist,
// 	// delegate to the authoritative implementations when available.
// 	if (!window.renamePeriod) {
// 		window.renamePeriod = function(periodNumber, newName) {
// 			console.warn('renamePeriod called before initialization. Ignoring.');
// 		};
// 	}
// 	if (!window.populateRenamePeriods) {
// 		window.populateRenamePeriods = function() {
// 			console.warn('populateRenamePeriods called before initialization. Ignoring.');
// 		};
// 	}

// 	// Provide an index-to-periodNum helper for any callers that still pass an index.
// 	// This does not overwrite the authoritative renamePeriod.
// 	if (!window.renamePeriodIndexSafe) {
// 		window.renamePeriodIndexSafe = function(indexOrPeriodNum, newName) {
// 			let periodNum = indexOrPeriodNum;
// 			// If passed an index, try map to periodNum from original schedules or currentSchedule
// 			if (!/^\d+$/.test(String(periodNum))) {
// 				const idx = parseInt(indexOrPeriodNum, 10);
// 				if (!isNaN(idx)) {
// 					// Prefer currentSchedule mapping, fallback to original schedule mapping
// 					const candidate = (Array.isArray(currentSchedule) && currentSchedule[idx]) ? currentSchedule[idx] : (schedules[currentScheduleName] || schedules.normal)[idx];
// 					periodNum = candidate?.periodNum || (candidate?.name && candidate.name.split(' ')[1]);
// 				}
// 			}
// 			if (!periodNum) {
// 				console.warn('renamePeriodIndexSafe: cannot determine period number for', indexOrPeriodNum);
// 				return;
// 			}
// 			if (typeof window.renamePeriod === 'function') {
// 				return window.renamePeriod(String(periodNum), newName);
// 			}
// 		};
// 	}
// }
