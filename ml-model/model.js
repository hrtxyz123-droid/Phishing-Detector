import * as tf from '@tensorflow/tfjs';

function extractFeatures(text) {
    const lower = (text || "").toLowerCase();

    return [
        lower.includes("urgent") ? 1 : 0,
        lower.includes("password") ? 1 : 0,
        lower.includes("verify") ? 1 : 0,
        lower.includes("login") ? 1 : 0,
        lower.includes("bank") ? 1 : 0,
        lower.includes("click") ? 1 : 0,
        lower.includes("account") ? 1 : 0,
        lower.includes("suspended") ? 1 : 0,
        lower.includes("security alert") ? 1 : 0,
    ];
}

class PhishingModel {
    constructor() {
        this.model = null;
    }

    async load() {
        if (this.model) return true;

        console.log("AI Model: Building feature-based model...");

        const model = tf.sequential();
        model.add(tf.layers.dense({
            units: 1,
            activation: 'sigmoid',
            inputShape: [9]
        }));

        const weightsTensor = tf.tensor2d([
            1.2,
            1.5, 
            1.3,
            1.1,
            1.2,
            1.0,
            1.0,
            1.4,
            1.6
        ], [9, 1]);

        const biasTensor = tf.tensor1d([-1]);

        model.layers[0].setWeights([weightsTensor, biasTensor]);

        this.model = model;
        console.log("System Status: AI Brain Ready (Feature-Based).");

        return true;
    }

    async predict(text) {
    if (!this.model) {
        await this.load();
    }

    const features = extractFeatures(text);
    const inputTensor = tf.tensor2d([features], [1, 9]);

    try {
        const prediction = this.model.predict(inputTensor);
        const score = await prediction.data();
        const confidenceValue = score[0];

        inputTensor.dispose();
        prediction.dispose();

        return {
            isPhish: confidenceValue > 0.7,
            confidence: (confidenceValue * 100).toFixed(1),
            rawScore: confidenceValue
        };

    } catch (err) {
        console.error("Inference Error:", err);
        inputTensor.dispose();
        return { isPhish: false, confidence: 0, rawScore: 0 };
    }
    }
}

export const phishingModel = new PhishingModel();
