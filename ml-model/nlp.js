const STOP_WORDS = new Set([
    "a", "an", "the", "and", "or", "but", "is", "are", "was", "were", 
    "to", "of", "in", "with", "as", "at", "by", "for", "from", "on"
]);

export const preprocessText = (text) => {
    if (!text) return "";

    let processed = text.toLowerCase();

    processed = processed.replace(/<[^>]*>/g, ' ');
    processed = processed.replace(/[^\w\s]/gi, ' ');

    let tokens = processed.split(/\s+/);

    tokens = tokens.filter(word => {
        return word.length > 1 && !STOP_WORDS.has(word);
    });

    return tokens.join(' ').trim();
};

export const getUrgencyScore = (text) => {
    if (!text) return 0;

    const urgencyKeywords = [
        "urgent", "immediately", "action", 
        "suspended", "security", "unauthorized",
        "verify", "password", "login", "bank",
        "security alert",

    ];

    const lowerText = text.toLowerCase();
    
    let matches = 0;

    urgencyKeywords.forEach(word => {
        if (lowerText.includes(word)) matches++;
    });

    return matches;
};
