document.addEventListener('click', function(event) {
  const element = event.target;
  const computedStyle = window.getComputedStyle(element);
  const gradient = computedStyle.backgroundImage;
  
  if (gradient.includes('gradient')) {
    chrome.runtime.sendMessage({ gradient: gradient });
  }
});

let retryCount = 0;
const MAX_RETRIES = 5; // increased from 3
const ALLOWED_ORIGINS = [
    'http://127.0.0.1:5500',
    'http://localhost',
    'https://shilohchristian.github.io',
    'https://bradyblackwell.github.io',  // Add your domain
    window.location.origin  // Add current origin dynamically
];

// Listen for messages from webpage with retry mechanism
window.addEventListener('message', function(event) {
    if (!ALLOWED_ORIGINS.includes(event.origin)) {
        console.warn('Rejected message from unauthorized origin:', event.origin);
        return;
    }

    // Modified check: verify runtime object instead of checking chrome.runtime.id
    if (!chrome.runtime) {
        console.warn('Extension runtime not available');
        window.postMessage({ type: 'EXTENSION_NOT_FOUND' }, event.origin);
        return;
    }

    if (event.data?.type === 'SAVE_GRADIENT') {
        saveGradientWithRetry(event.data.gradient, event.origin);
    }
});

function saveGradientWithRetry(gradient, origin, attempt = 0) {
    try {
        chrome.storage.sync.set({ 
            gradientGrabber: { 
                savedGradient: gradient,
                timestamp: Date.now()
            }
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('Storage set error:', chrome.runtime.lastError.message);
                handleSaveError(gradient, origin, attempt);
                return;
            }
            // Verify save was successful
            chrome.storage.sync.get(['gradientGrabber'], (result) => {
                if (result?.gradientGrabber?.savedGradient === gradient) {
                    window.postMessage({ 
                        type: 'GRADIENT_SAVED',
                        success: true 
                    }, origin);
                } else {
                    console.warn('Gradient not saved correctly, retrying:', result);
                    handleSaveError(gradient, origin, attempt);
                }
            });
        });
    } catch (error) {
        console.error('Exception in saveGradientWithRetry:', error);
        handleSaveError(gradient, origin, attempt);
    }
}

function handleSaveError(gradient, origin, attempt) {
    if (attempt < MAX_RETRIES) {
        console.warn(`Retry attempt ${attempt + 1} of ${MAX_RETRIES} for saving gradient.`);
        setTimeout(() => {
            saveGradientWithRetry(gradient, origin, attempt + 1);
        }, Math.pow(2, attempt) * 1000); // Exponential backoff
    } else {
        console.error('Max retries exceeded. Gradient save failed.');
        window.postMessage({ 
            type: 'GRADIENT_SAVE_FAILED',
            error: 'Max retries exceeded'
        }, origin);
    }
}
