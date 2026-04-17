chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "displayVerdict") {
        renderWarning(message.result);
    }
});

function renderWarning(result) {
    if (!result.isPhishing) return;

    const existing = document.getElementById('phishing-detector-alert');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'phishing-detector-alert';

    Object.assign(banner.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        width: '320px',
        backgroundColor: '#d93025',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: '999999',
        fontFamily: 'sans-serif',
        borderLeft: '5px solid #ffeb3b',
        animation: 'fadeIn 0.3s ease'
    });

    banner.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px;">⚠️ PHISHING ALERT</div>
        <div style="font-size: 13px; line-height: 1.4;">
            Flagged by <strong>${result.source}</strong><br>
            <strong>Confidence:</strong> ${result.confidence}%<br>
            <button id="close-phish-btn" style="margin-top: 10px; background: white; color: #d93025; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Close</button>
        </div>
    `;

    document.body.appendChild(banner);

    setTimeout(() => {
        banner.remove();
    }, 6000);

    // Manual close
    document.getElementById('close-phish-btn').addEventListener('click', () => {
        banner.remove();
    });

    highlightAllLinks();
}

function highlightAllLinks() {
    const links = document.querySelectorAll('a');

    links.forEach(link => {
        if (link.href) {
            highlightSuspiciousLink(link);
        }
    });
}

export function highlightSuspiciousLink(element) {
    element.style.border = "2px dashed #d93025";
    element.style.backgroundColor = "rgba(217, 48, 37, 0.1)";
    element.title = "⚠️ Suspicious link detected!";
}
