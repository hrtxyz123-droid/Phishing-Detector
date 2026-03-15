chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "displayVerdict") {
        renderWarning(message.result);
    }
});

function renderWarning(result) {
    // Only show if it's actually phishing
    if (!result.isPhishing) return;

    // Create the warning banner element
    const banner = document.createElement('div');
    banner.id = 'phishing-detector-alert';
    
    // Inject Styles directly for high priority visibility
    Object.assign(banner.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        width: '320px',
        backgroundColor: '#d93025', // Security Red
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: '999999',
        fontFamily: 'sans-serif',
        borderLeft: '5px solid #ffeb3b'
    });

    banner.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px;">⚠️ PHISHING ALERT</div>
        <div style="font-size: 13px; line-height: 1.4;">
            This content has been flagged by our <strong>${result.source}</strong>.<br>
            <strong>Confidence:</strong> ${result.confidence}%<br>
            <button id="close-phish-btn" style="margin-top: 10px; background: white; color: #d93025; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Acknowledge</button>
        </div>
    `;

    document.body.appendChild(banner);

    // Add close functionality
    document.getElementById('close-phish-btn').addEventListener('click', () => {
        banner.remove();
    });
}

export function highlightSuspiciousLink(element) {
    element.style.border = "2px dashed #d93025";
    element.style.backgroundColor = "rgba(217, 48, 37, 0.1)";
    element.title = "Warning: This link looks suspicious!";
}