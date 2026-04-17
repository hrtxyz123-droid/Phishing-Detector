document.addEventListener('DOMContentLoaded', () => {
    const scanBtn = document.getElementById('scanEmails');
    const statusText = document.getElementById('status-text');
    const resultValue = document.getElementById('result-value');
    const progress = document.getElementById('progress-bar');

    const resetUI = () => {
        scanBtn.disabled = false;
        scanBtn.innerText = "🔍 Scan Inbox";
        progress.classList.add("hidden");
    };

    scanBtn.addEventListener('click', () => {

        scanBtn.disabled = true;
        scanBtn.innerText = "Scanning...";
        statusText.innerText = "Connecting to Proxy...";
        resultValue.innerText = "";
        progress.classList.remove("hidden");

        let responded = false;

        const timeout = setTimeout(() => {
            if (!responded) {
                statusText.innerText = "Timeout";
                resultValue.innerText = "Server not responding";
                resetUI();
            }
        }, 8000);

        chrome.runtime.sendMessage({ action: "scanEmails" }, (response) => {
            responded = true;
            clearTimeout(timeout);

            if (chrome.runtime.lastError) {
                statusText.innerText = "❌ Proxy Offline";
                resultValue.innerText = "Start backend server";
                resetUI();
                return;
            }

            if (!response) {
                statusText.innerText = "❌ No response";
                resultValue.innerText = "Try again";
                resetUI();
                return;
            }

            if (response.error) {
                statusText.innerText = "❌ Scan Failed";
                resultValue.innerText = response.error;
                resetUI();
                return;
            }

            statusText.innerText = "🟢 Scan Complete";
            resultValue.innerText = `${response.phishing || 0} phishing / ${response.total || 0} emails`;

            resetUI();
        });
    });
});
