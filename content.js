
// 1. Listen for link clicks across any webpage
document.addEventListener('click', (event) => {
    // Find the nearest anchor (link) tag
    const link = event.target.closest('a');

    if (link && link.href) {
        const targetUrl = link.href;

        // Skip internal chrome links or empty links
        if (targetUrl.startsWith('chrome') || targetUrl.startsWith('javascript')) return;

        console.log(`[Sentinel] Intercepted link: ${targetUrl}`);

        // 2. Send the URL to background.js for Hybrid Analysis
        // We use the background script because content scripts cannot access 
        // the TensorFlow model or Google APIs directly due to security (CORS).
        chrome.runtime.sendMessage({
            action: "checkLink",
            url: targetUrl
        });
    }
}, true); // Use 'true' for capturing phase to catch clicks before they navigate away

// 3. Optional: Dynamic Page Analysis (Heuristic)
// Scans the page for suspicious forms if the user is on a login page
function scanForSuspiciousForms() {
    const forms = document.querySelectorAll('form');
    const passwordFields = document.querySelectorAll('input[type="password"]');

    if (passwordFields.length > 0 && !window.location.protocol.includes('https')) {
        console.warn("[Sentinel] Warning: Password field detected on non-HTTPS site.");
        // You could send a message to background.js here to trigger a specific alert
    }
}

// Run a quick heuristic scan when the page loads
window.onload = scanForSuspiciousForms;