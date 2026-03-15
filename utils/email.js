import { phishingModel } from '../ml-model/model.js';
import { checkPhishingAPI } from './api.js';

/**
 * Analyzes a single email for phishing indicators.
 * @param {tf.LayersModel} model - The loaded TensorFlow.js model.
 * @param {Object} emailData - Object containing { subject, body, from }.
 * @returns {Promise<Object>} - The detection results and confidence.
 */
export async function analyzeEmail(model, emailData) {
    console.log(`[Analyzer] Processing: ${emailData.subject}`);

    try {
        // 1. Parallel Processing: Start both checks simultaneously for better speed
        const aiPromise = phishingModel.predict( emailData.body);
        const apiPromise = checkPhishingAPI(emailData.body);

        // Wait for both results to return
        const [aiResult, apiResult] = await Promise.all([aiPromise, apiPromise]);

        // 2. Logic Gate: Flag as threat if AI is confident OR Google finds a match
        const isThreat = aiResult.isPhish || apiResult;

        // 3. Source Attribution: Determine who caught the threat (for the notification)
        let detectionSource = "Safe";
        if (apiResult) {
            detectionSource = "Google Safe Browsing (Blacklisted Link)";
        } else if (aiResult.isPhish) {
            detectionSource = "Neural Network (Suspicious Pattern)";
        }

        return {
            isPhishing: isThreat,
            confidence: aiResult.confidence,
            source: detectionSource,
            subject: emailData.subject
        };

    } catch (error) {
        console.error("Analysis Pipeline Error:", error);
        return {
            isPhishing: false,
            confidence: 0,
            source: "Error during analysis",
            subject: emailData.subject
        };
    }
}