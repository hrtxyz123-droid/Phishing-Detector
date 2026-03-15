const STOP_WORDS = new Set([
    "a", "an", "the", "and", "or", "but", "is", "are", "was", "were", 
    "to", "of", "in", "with", "as", "at", "by", "for", "from", "on"
]);

/**
 * Main preprocessing function
 * @param {string} text - The raw body text from the email.
 * @returns {string} - Cleaned, tokenized, and filtered text string.
 */
export const preprocessText = (text) => {
    if (!text) return "";

    // 1. Lowercasing: Ensures 'Login' and 'login' are treated the same
    let processed = text.toLowerCase();

    // 2. Remove HTML Tags: In case the proxy sends raw HTML
    processed = processed.replace(/<[^>]*>/g, ' ');

    // 3. Remove Special Characters: Keep only alphanumeric and basic spaces
    processed = processed.replace(/[^\w\s]/gi, ' ');

    // 4. Tokenization: Split text into an array of words
    let tokens = processed.split(/\s+/);

    // 5. Noise Reduction: Remove stop words and short/meaningless characters
    tokens = tokens.filter(word => {
        return word.length > 1 && !STOP_WORDS.has(word);
    });

    // 6. Normalization: Rejoin tokens into a clean string for the character encoder
    return tokens.join(' ').trim();
};

export const getUrgencyScore = (text) => {
    const urgencyKeywords = ["urgent", "immediately", "action", "suspended", "security", "unauthorized"];
    const lowerText = text.toLowerCase();
    
    let matches = 0;
    urgencyKeywords.forEach(word => {
        if (lowerText.includes(word)) matches++;
    });

    return matches; // Return count of high-pressure words
};