// Combined message handler for both internal and external messages
function handleGradientUpdate(message, sender, sendResponse) {
    try {
        // Validate gradient data structure
        if (!message.settings || !Array.isArray(message.settings.stops) || message.settings.angle === undefined) {
            throw new Error('Invalid gradient data structure');
        }

        // Store gradient settings
        const gradientData = {
            gradientGrabber: {
                savedGradient: {
                    angle: message.settings.angle,
                    stops: message.settings.stops.map(stop => ({
                        color: stop.color,
                        position: stop.position
                    }))
                },
                timestamp: Date.now()
            }
        };

        chrome.storage.sync.set(gradientData, () => {
            if (chrome.runtime.lastError) {
                sendResponse({ error: chrome.runtime.lastError.message });
            } else {
                // Notify popup about the update
                try {
                    chrome.runtime.sendMessage({
                        type: 'GRADIENT_UPDATED',
                        gradient: gradientData.gradientGrabber.savedGradient
                    });
                } catch (e) {
                    console.log('Popup not available for update');
                }
                sendResponse({ success: true });
            }
        });
        return true; // Keep channel open for async response
    } catch (error) {
        console.error('Error saving gradient:', error);
        sendResponse({ error: error.message });
    }
}

// Update message listeners to use the combined handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const messageId = Date.now().toString();
    
    try {
        if (!sender.id && !sender.origin) {
            throw new Error('Invalid message sender');
        }

        if (message.type === 'GET_GRADIENT') {
            chrome.storage.sync.get(['gradientGrabber'], result => {
                if (chrome.runtime.lastError) {
                    sendResponse({
                        error: chrome.runtime.lastError.message,
                        messageId
                    });
                    return;
                }
                sendResponse({
                    success: true,
                    data: result.gradientGrabber,
                    messageId
                });
            });
            return true; // Keep channel open for async response
        }
        
        if (message.type === 'UPDATE_GRADIENT') {
            return handleGradientUpdate(message, sender, sendResponse);
        }
    } catch (error) {
        console.error('Error processing message:', error);
        sendResponse({
            error: error.message,
            messageId
        });
    }
    return true;
});

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (message.type === 'UPDATE_GRADIENT') {
        return handleGradientUpdate(message, sender, sendResponse);
    }
    return true;
});

function isValidGradientData(settings) {
    return settings 
        && Array.isArray(settings.stops) 
        && settings.stops.length >= 2
        && typeof settings.angle === 'number';
}
