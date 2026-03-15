export const CONFIG = {
    // The address of your local Node.js Proxy Server
    PROXY_URL: "http://localhost:3000/fetch-emails",
    
    // Google Safe Browsing API Key
    SAFE_BROWSING_API_KEY: "Your_api_key",
    SAFE_BROWSING_URL: "https://safebrowsing.googleapis.com/v4/threatMatches:find",
    
    // Security Thresholds
    AI_CONFIDENCE_THRESHOLD: 0.75, // Only alert if AI is 75% sure
    MAX_TEXT_LENGTH: 500           // Matches your ML model's input size
};