document.addEventListener('DOMContentLoaded', function() {
  const gradientDisplay = document.getElementById('gradientDisplay');
  const periodName = document.getElementById('periodName');
  const timeRemaining = document.getElementById('timeRemaining');
  
  // Load gradient from sync storage
  chrome.storage.sync.get(['gradientGrabber'], function(result) {
    console.log('Loaded from storage:', result.gradientGrabber);
    
    if (chrome.runtime.lastError) {
      console.error('Error fetching gradient:', chrome.runtime.lastError);
      return;
    }

    try {
      if (result.gradientGrabber?.savedGradient) {
        const gradient = result.gradientGrabber.savedGradient;
        
        // Handle both string and object formats
        if (typeof gradient === 'string') {
          // Direct gradient string
          gradientDisplay.style.background = gradient;
          console.log('Applied gradient string:', gradient);
        } else if (gradient.angle !== undefined && Array.isArray(gradient.stops) && gradient.stops.length >= 2) {
          // Object format with angle and stops
          const gradientString = `linear-gradient(${gradient.angle}deg, ${
            gradient.stops.map(stop => `${stop.color} ${stop.position}%`).join(', ')
          })`;
          gradientDisplay.style.background = gradientString;
          console.log('Applied constructed gradient:', gradientString);
        } else {
          throw new Error('Invalid gradient format');
        }
      } else {
        // Apply default gradient if nothing is stored
        gradientDisplay.style.background = 'linear-gradient(90deg, #000035, #00bfa5)';
        console.log('Applied default gradient');
      }
    } catch (error) {
      console.error('Error applying gradient:', error);
      // Apply default gradient on error
      gradientDisplay.style.background = 'linear-gradient(90deg, #000035, #00bfa5)';
    }
  });

  // Also update the real-time message handler
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'GRADIENT_UPDATED' && gradientDisplay) {
        const gradient = message.gradient;
        if (typeof gradient === 'string') {
            gradientDisplay.style.background = gradient;
        } else if (gradient.stops && gradient.angle) {
            const gradientString = `linear-gradient(${gradient.angle}deg, ${
                gradient.stops.map(stop => `${stop.color} ${stop.position}%`).join(', ')
            })`;
            gradientDisplay.style.background = gradientString;
        }
        console.log('Updated gradient:', gradient);
    }
  });

  // Add direction handling
  function updateGradientDirection(angle) {
    chrome.storage.sync.get(['gradientGrabber'], function(result) {
      if (result.gradientGrabber?.savedGradient) {
        const gradient = result.gradientGrabber.savedGradient;
        if (gradient.stops && gradient.angle !== undefined) {
          const gradientString = `linear-gradient(${angle}deg, ${
            gradient.stops.map(stop => `${stop.color} ${stop.position}%`).join(', ')
          })`;
          gradientDisplay.style.background = gradientString;
          
          // Update stored gradient
          chrome.storage.sync.set({
            gradientGrabber: {
              savedGradient: {
                ...gradient,
                angle: parseInt(angle)
              },
              timestamp: Date.now()
            }
          });
        }
      }
    });
  }

  // Expose function globally
  window.updateGradientDirection = updateGradientDirection;

  // Load and set initial direction
  chrome.storage.sync.get(['gradientGrabber'], function(result) {
    if (result.gradientGrabber?.savedGradient?.angle) {
      const directionSelect = document.getElementById('gradientDirection');
      directionSelect.value = result.gradientGrabber.savedGradient.angle;
    }
  });

  // All schedules from main site
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
      { name: "Period 8", start: "14:55", end: "15:40" }
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
      { name: "Period 8", start: "15:02", end: "15:40" }
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
      { name: "Pep Rally", start: "14:45", end: "15:40" }
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
      { name: "Period 8", start: "14:57", end: "15:40" }
    ]
  };

  let currentSchedule = schedules.normal;

  function getTimeInSeconds(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 3600 + minutes * 60;
  }

  function formatTime(seconds) {
    if (seconds < 0) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function debugLog(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`, data || '');
  }

  function getCurrentPeriod(currentSeconds) {
    try {
        if (typeof currentSeconds !== 'number') {
            throw new Error('Invalid current seconds');
        }

        // Get first period start time for tomorrow if needed
        const firstPeriodStart = getTimeInSeconds(currentSchedule[0].start);
        const lastPeriodEnd = getTimeInSeconds(currentSchedule[currentSchedule.length - 1].end);
        
        // If current time is after last period, calculate time until tomorrow's first period
        if (currentSeconds > lastPeriodEnd) {
            const secondsUntilMidnight = 24 * 3600 - currentSeconds;
            const secondsFromMidnight = firstPeriodStart;
            const timeUntilNext = secondsUntilMidnight + secondsFromMidnight;
            return {
                name: `Until Period 1`,
                remaining: timeUntilNext,
                error: null
            };
        }

        // If before first period, show countdown to first period
        if (currentSeconds < firstPeriodStart) {
            return {
                name: `Until Period 1`,
                remaining: firstPeriodStart - currentSeconds,
                error: null
            };
        }

        // Find current period
        for (const period of currentSchedule) {
            const startTime = getTimeInSeconds(period.start);
            const endTime = getTimeInSeconds(period.end);
            
            if (currentSeconds >= startTime && currentSeconds < endTime) {
                return {
                    name: period.name,
                    remaining: endTime - currentSeconds,
                    error: null
                };
            }
        }

        // Between periods, find next period
        for (const period of currentSchedule) {
            const startTime = getTimeInSeconds(period.start);
            if (currentSeconds < startTime) {
                return {
                    name: `Until ${period.name}`,
                    remaining: startTime - currentSeconds,
                    error: null
                };
            }
        }

        // Should never reach here but just in case
        return {
            name: `Until Period 1`,
            remaining: firstPeriodStart - currentSeconds + (24 * 3600),
            error: null
        };
    } catch (error) {
        debugLog('Error in getCurrentPeriod:', error);
        return { error: error.message };
    }
  }

  function updateCountdown() {
    try {
      const now = new Date();
      const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      debugLog('Current time:', { hours: now.getHours(), minutes: now.getMinutes(), seconds: now.getSeconds() });

      const result = getCurrentPeriod(currentSeconds);
      debugLog('Period calculation result:', result);

      if (result.error) {
        periodName.textContent = "School Day End";
        timeRemaining.textContent = "--:--";
        return;
      }

      if (!periodName || !timeRemaining) {
        throw new Error('Display elements not found');
      }

      periodName.textContent = result.name;
      timeRemaining.textContent = formatTime(result.remaining);

    } catch (error) {
      console.error('Timer update error:', error);
      // Set fallback display
      if (periodName) periodName.textContent = "Error";
      if (timeRemaining) timeRemaining.textContent = "--:--";
    }
  }

  // Test and validate schedule data on load
  try {
    debugLog('Loaded schedule data:', currentSchedule);
    if (!Array.isArray(currentSchedule)) {
      throw new Error('Schedule data is not an array');
    }
    for (const period of currentSchedule) {
      if (!period.start || !period.end || !period.name) {
        throw new Error('Invalid period data found');
      }
    }
    // Start timer only if validation passes
    updateCountdown();
    setInterval(updateCountdown, 1000);
  } catch (error) {
    console.error('Schedule validation error:', error);
    periodName.textContent = "Schedule Error";
    timeRemaining.textContent = "--:--";
  }
});
