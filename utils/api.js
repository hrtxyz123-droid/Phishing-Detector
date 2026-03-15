import { CONFIG } from './config.js';

/**
 * Checks if any URLs within the provided text are flagged as malicious.
 * @param {string} text - The email body text to scan for links.
 * @returns {Promise<boolean>} - Returns true if a threat is found, false otherwise.
 */
export async function checkPhishingAPI(text) {
    if (!text) return false;

    // 1. URL Extraction: Find all links in the text
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex);

    // If no links are found, there's no API check needed
    if (!urls || urls.length === 0) return false;

    // 2. Payload Construction: Format data for Google's API
    // We only check the first 5 links to stay within API limits and improve speed.
    const payload = {
        client: {
            clientId: "phishing-detector-extension",
            clientVersion: "2.0.0"
        },
        threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: urls.slice(0, 5).map(url => ({ url: url.replace(/[.,;]$/, '') }))
        }
    };

    try {
        // 3. The API Request: Uses the URL and Key from your config.js
        const apiUrl = `${CONFIG.SAFE_BROWSING_URL}?key=${CONFIG.SAFE_BROWSING_API_KEY}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error(`API Error: ${response.status} - ${response.statusText}`);
            return false;
        }

        const data = await response.json();

        // 4. Result Interpretation: If 'matches' exists, the link is dangerous
        // Google only returns a 'matches' array if it finds a threat.
        const isDangerous = !!(data.matches && data.matches.length > 0);
        
        if (isDangerous) {
            console.warn("[API Alert] Malicious URL detected by Google Safe Browsing!");
        }

        return isDangerous;

    } catch (error) {
        console.error("Network Error (Safe Browsing API):", error);
        return false;
    }
}