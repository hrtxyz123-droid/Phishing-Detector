document.addEventListener('DOMContentLoaded', () => {
    const scanBtn = document.getElementById('scanEmails');
    const statusText = document.getElementById('status-text');
    const resultValue = document.getElementById('result-value');

    scanBtn.addEventListener('click', () => {
        // UI Feedback
        scanBtn.disabled = true;
        scanBtn.innerText = "Scanning Inbox...";
        statusText.innerText = "Connecting to Proxy...";

        // Trigger the background.js logic
        chrome.runtime.sendMessage({ action: "scanEmails" }, (response) => {
            if (chrome.runtime.lastError) {
                statusText.innerText = "Error: Proxy Offline";
                scanBtn.disabled = false;
                return;
            }
            
            // Wait for processing
            setTimeout(() => {
                statusText.innerText = "System Active";
                resultValue.innerText = "Check Notifications";
                scanBtn.disabled = false;
                scanBtn.innerText = "Scan Inbox (IMAP)";
            }, 3000);
        });
    });
});