document.addEventListener('click', (event) => {
    const link = event.target.closest('a');

    if (link && link.href) {
        const targetUrl = link.href;

        if (targetUrl.startsWith('chrome') || targetUrl.startsWith('javascript')) return;

        console.log(`[Sentinel] Intercepted link: ${targetUrl}`);

        chrome.runtime.sendMessage({
            action: "checkLink",
            url: targetUrl
        });
    }
}, true);

function scanForSuspiciousForms() {
    const passwordFields = document.querySelectorAll('input[type="password"]');

    if (passwordFields.length > 0 && !window.location.protocol.includes('https')) {
        console.warn("[Sentinel] Warning: Password field detected on non-HTTPS site.");
    }
}

window.addEventListener('load', scanForSuspiciousForms);
