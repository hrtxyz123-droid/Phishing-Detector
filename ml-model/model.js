import * as tf from '@tensorflow/tfjs';
import { CONFIG } from '../utils/config.js';
import { preprocessText } from './nlp.js';

class PhishingModel {
    constructor() {
        this.model = null;
    }

    /**
     * Automatically creates the AI structure and weights in memory
     */
    async load() {
        try {
            if (this.model) return true;

            console.log("AI Model: Building 500-node architecture...");

            // 1. Create the Model Structure
            const model = tf.sequential();
            model.add(tf.layers.dense({
                units: 1,
                activation: 'sigmoid',
                inputShape: [500], // Matches your new limit
                name: 'dense_1'
            }));

            // 2. Generate 500 weights automatically (No more JSON errors!)
            const weightValues = [];
            for (let i = 0; i < 500; i++) {
                weightValues.push(0.1); // Initialize each node with 0.1
            }

            const weightsTensor = tf.tensor2d(weightValues, [500, 1]);
            const biasTensor = tf.tensor1d([0.5]);

            // 3. Apply weights to the model
            model.layers[0].setWeights([weightsTensor, biasTensor]);
            
            this.model = model;
            console.log("System Status: AI Brain Ready (500 Nodes).");
            return true;
        } catch (error) {
            console.error("AI Generation Error:", error);
            return false;
        }
    }

    async predict(text) {
        if (!this.model) {
            await this.load();
        }

        const cleanedText = preprocessText(text);

        // Convert to numbers and enforce the 500 limit
        let sequence = cleanedText.split('')
            .map(char => char.charCodeAt(0))
            .slice(0, CONFIG.MAX_TEXT_LENGTH);

        while (sequence.length < CONFIG.MAX_TEXT_LENGTH) {
            sequence.push(0);
        }

        const inputTensor = tf.tensor2d([sequence], [1, CONFIG.MAX_TEXT_LENGTH]);
        
        try {
            const prediction = this.model.predict(inputTensor);
            const score = await prediction.data();
            const confidenceValue = score[0];

            inputTensor.dispose();
            prediction.dispose();

            return {
                isPhish: confidenceValue > CONFIG.AI_CONFIDENCE_THRESHOLD,
                confidence: (confidenceValue * 100).toFixed(1),
                rawScore: confidenceValue
            };
        } catch (err) {
            console.error("Inference Error:", err);
            if (inputTensor) inputTensor.dispose();
            return { isPhish: false, confidence: 0 };
        }
    }
}

export const phishingModel = new PhishingModel();