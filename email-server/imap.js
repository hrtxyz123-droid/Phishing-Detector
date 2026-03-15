import { CONFIG } from '../utils/config.js';

export async function fetchInbox() {
    console.log(`[IMAP] Requesting emails from: ${CONFIG.PROXY_URL}`);

    try {
        const response = await fetch(CONFIG.PROXY_URL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });

        if (!response.ok) {
            throw new Error(`Proxy Error: ${response.status}`);
        }

        const emails = await response.json();
        return Array.isArray(emails) ? emails : [];

    } catch (error) {
        console.error("[IMAP] Connection Failed:", error.message);
        return [];
    }
}