import { phishingModel } from '../ml-model/model.js';
import { checkPhishingAPI } from './api.js';

/**
 * @param {Object} emailData - Object containing { subject, body, from }.
 * @returns {Promise<Object>}
 */
export async function analyzeEmail(emailData) {

    if (!emailData || typeof emailData !== "object") {
        console.warn("Invalid emailData:", emailData);
        return {
            isPhishing: false,
            confidence: 0,
            source: "Invalid data",
            subject: "Unknown"
        };
    }

    console.log(`[Analyzer] Processing: ${emailData.subject || "No Subject"}`);

    try {
        const combinedText =
    (emailData.subject || "") + " " +
    (emailData.body || "");

const aiPromise = phishingModel.predict(combinedText);
        const apiPromise = checkPhishingAPI(emailData.body || "");

        const [aiResult, apiResult] = await Promise.all([aiPromise, apiPromise]);
        console.log("AI Score:", aiResult.rawScore);
console.log("API Result:", apiResult);

if (apiResult) {
    return {
        isPhishing: true,
        confidence: 100,
        source: "Google Safe Browsing",
        subject: emailData.subject || "No Subject"
    };
}

const score = aiResult?.rawScore ?? 0;

const text = (
    (emailData.subject || "") + " " +
    (emailData.body || "")
).toLowerCase();

const keywordMatch = /(security|alert|verify|password|bank|login|suspended|unauthorized|urgent|click)/i.test(text);

const isThreat =
    apiResult ||
    score > 0.75 ||
    (score > 0.5 && keywordMatch);

return {
    isPhishing: isThreat,
    confidence: (score * 100).toFixed(1),
    source: isThreat ? "Hybrid Detection" : "Safe",
    subject: emailData.subject || "No Subject"
};

    } catch (error) {
        console.error("Analysis Pipeline Error:", error);
        return {
            isPhishing: false,
            confidence: 0,
            source: "Error during analysis",
            subject: emailData.subject || "No Subject"
        };
    }
}
