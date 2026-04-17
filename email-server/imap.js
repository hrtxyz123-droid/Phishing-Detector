import { CONFIG } from "../utils/config.js";
export async function fetchInbox() {
    console.log(`[IMAP] Requesting emails from: ${CONFIG.PROXY_URL}`);

    try {
        const controller = new AbortController();

        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const response = await fetch(`${CONFIG.PROXY_URL}/fetch-emails`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`Proxy Error: ${response.status}`);
        }

        const emails = await response.json();

        console.log("Emails received:", emails.length);

        return Array.isArray(emails) ? emails : [];

    } catch (error) {
        console.error("[IMAP] Connection Failed:", error.message);
        return [];
    }
}
