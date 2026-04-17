import { fetchInbox } from "./email-server/imap.js";
import { analyzeEmail } from "./utils/email.js";
import { phishingModel } from "./ml-model/model.js";
import { checkPhishingAPI } from "./utils/api.js"; // ✅ ADDED

let modelReady = false;
let isScanning = false;

async function initializeSystem() {
    if (!modelReady) {
        await phishingModel.load();
        console.log("System Status: Neural Network Ready.");
        modelReady = true;
    }
}

chrome.runtime.onInstalled.addListener(initializeSystem);
chrome.runtime.onStartup.addListener(initializeSystem);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.action === "scanEmails") {

        if (isScanning) {
            sendResponse({ error: "Scan already running" });
            return;
        }

        isScanning = true;

        handleInboxScan()
            .then((result) => {
                sendResponse(result);
            })
            .catch((err) => {
                console.error("Scan Error:", err);
                sendResponse({ error: err.message });
            })
            .finally(() => {
                isScanning = false;
            });

        return true;
    }

    if (request.action === "checkLink") {
        handleLinkCheck(request.url);
    }
});

async function handleInboxScan() {
    await initializeSystem();

    console.log("🔍 Starting inbox scan...");

    const emails = await fetchInbox();

    if (!emails || emails.length === 0) {
        console.warn("No emails found.");
        return { total: 0, phishing: 0 };
    }

    let phishingCount = 0;

    for (const email of emails) {

        if (!email || typeof email !== "object") continue;

        const subject = email.subject || "No Subject";
        const body = email.text || email.body || "";
        const from = email.from || "";

        const verdict = await analyzeEmail({ subject, body, from });

        console.log("Verdict:", verdict);

        const confidence = Number(verdict.confidence) || 0;

        if (verdict.isPhishing && confidence > 70) {
            phishingCount++;

            triggerNotification(subject, confidence, verdict.source);

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: "displayVerdict",
                        result: verdict
                    });
                }
            });
        }
    }

    console.log(`Scan complete: ${phishingCount}/${emails.length} phishing`);

    return {
        total: emails.length,
        phishing: phishingCount
    };
}

async function handleLinkCheck(url) {
    console.log("🔗 Checking link:", url);

    try {
        const isDangerous = await checkPhishingAPI(url);

        if (isDangerous) {
            chrome.notifications.create({
                type: "basic",
                iconUrl: "icons/icon128.png",
                title: "⚠️ Phishing Link Detected",
                message: `Dangerous link blocked:\n${url}`,
                priority: 2
            });

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: "displayVerdict",
                        result: {
                            isPhishing: true,
                            confidence: 100,
                            source: "Google Safe Browsing (Link)"
                        }
                    });
                }
            });
        }

    } catch (err) {
        console.error("Link check failed:", err);
    }
}

function triggerNotification(subject, confidence, source) {
    chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon128.png",
        title: `PHISHING ALERT: ${source}`,
        message: `Threat detected in: "${subject}"\nConfidence: ${confidence}%`,
        priority: 2
    });
}

console.log("🚀 BACKGROUND READY");
