import { fetchInbox } from "./email-server/imap.js";
import { analyzeEmail } from "./utils/email.js";
import { phishingModel } from "./ml-model/model.js";
import { CONFIG } from "./utils/config.js";

let model = null;

// 1. Initialization: Load the AI Model
async function initializeSystem() {
    if (!model) {
        model = await phishingModel.load();
        console.log("System Status: Neural Network Ready.");
    }
}

chrome.runtime.onInstalled.addListener(initializeSystem);
chrome.runtime.onStartup.addListener(initializeSystem);

// 2. Message Listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scanEmails") {
        handleInboxScan().then(() => {
            sendResponse({ status: "Scan Completed" });
        }).catch(err => {
            sendResponse({ status: "Scan Failed", error: err.message });
        });
    }
    return true; 
});

// 3. The Core Processing Logic
async function handleInboxScan() {
    try {
        await initializeSystem();
        const emails = await fetchInbox();

        if (!emails || emails.length === 0) return;

        for (const email of emails) {
            const verdict = await analyzeEmail(email);

            if (verdict.isPhishing) {
                // ACTION 1: Create a System Notification
                triggerNotification(email.subject, verdict.confidence, verdict.source);

                // ACTION 2: Trigger the UI Banner in phishing.js
                // We find the current active tab to show the red warning banner
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
    } catch (error) {
        console.error("Critical System Failure:", error);
    }
}

// 4. Notification Helper
function triggerNotification(subject, confidence, source) {
    chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon128.png",
        title: `PHISHING ALERT: ${source}`,
        message: `Threat detected in: "${subject}"\nConfidence: ${confidence}%`,
        priority: 2
    });
}