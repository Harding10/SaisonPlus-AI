/**
 * @fileOverview Service de prédiction ML pour les pénuries alimentaires.
 * Utilise TensorFlow.js pour prédire les risques de pénurie basés sur les données saisonnières.
 */

import * as tf from '@tensorflow/tfjs';
import { getSeasonalData, SeasonalData } from './seasonal-history-service';

export interface PredictionInput {
  crop: string;
  region: string;
  currentNdvi: number;
  currentRainfall: number;
  currentTemperature: number;
  historicalData?: SeasonalData[];
}

export interface PredictionOutput {
  shortageRisk: number; // 0-100
  confidence: number; // 0-1
  predictedYield: number; // T/ha
  explanation: string;
}

let model: tf.LayersModel | null = null;

/**
 * Charge ou crée un modèle simple de prédiction de pénurie.
 */
async function loadModel(): Promise<tf.LayersModel> {
  if (model) return model;

  // Modèle simple de régression linéaire pour la démonstration
  model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [3], units: 16, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 8, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }));

  model.compile({
    optimizer: tf.train.adam(0.01),
    loss: 'meanSquaredError',
    metrics: ['accuracy']
  });

  return model;
}

/**
 * Entraîne le modèle avec des données historiques simulées.
 */
export async function trainModel(): Promise<void> {
  const model = await loadModel();

  // Données d'entraînement simulées
  const xs = tf.tensor2d([
    [0.7, 150, 25], // NDVI, pluie, température
    [0.5, 80, 30],
    [0.8, 200, 22],
    [0.3, 50, 35],
    [0.6, 120, 28]
  ]);

  const ys = tf.tensor2d([
    [0.2], // Risque de pénurie faible
    [0.8], // Risque élevé
    [0.1],
    [0.9],
    [0.4]
  ]);

  await model.fit(xs, ys, {
    epochs: 50,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if (epoch % 10 === 0) {
          console.log(`Epoch ${epoch}: loss = ${logs?.loss}`);
        }
      }
    }
  });

  console.log('Modèle ML entraîné avec succès');
}

/**
 * Prédit le risque de pénurie pour une culture donnée.
 */
export async function predictShortage(input: PredictionInput): Promise<PredictionOutput> {
  const model = await loadModel();

  // Préparer les données d'entrée
  const inputTensor = tf.tensor2d([[input.currentNdvi, input.currentRainfall, input.currentTemperature]]);

  // Faire la prédiction
  const prediction = model.predict(inputTensor) as tf.Tensor;
  const riskValue = (await prediction.data())[0] * 100; // Convertir en pourcentage

  // Calculer la confiance basée sur la variance des données historiques
  const historicalData = input.historicalData || await getSeasonalData(input.crop, input.region, 3);
  const yields = historicalData.map(d => d.yield);
  const mean = yields.reduce((a, b) => a + b, 0) / yields.length;
  const variance = yields.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / yields.length;
  const confidence = Math.max(0.1, 1 - (variance / (mean * mean))); // Confiance inversement proportionnelle à la variance

  // Prédiction du rendement basée sur les données historiques
  const predictedYield = mean * (1 - riskValue / 100); // Réduire le rendement selon le risque

  // Nettoyer les tensors
  inputTensor.dispose();
  prediction.dispose();

  let explanation = '';
  if (riskValue > 70) {
    explanation = `Risque critique de pénurie détecté. Les conditions actuelles (NDVI: ${input.currentNdvi.toFixed(2)}, pluie: ${input.currentRainfall}mm) indiquent une production réduite.`;
  } else if (riskValue > 40) {
    explanation = `Risque modéré de pénurie. Surveiller les conditions météorologiques et envisager des mesures préventives.`;
  } else {
    explanation = `Risque faible de pénurie. Les conditions sont favorables pour une bonne production.`;
  }

  return {
    shortageRisk: Math.round(riskValue),
    confidence: Math.round(confidence * 100) / 100,
    predictedYield: Math.round(predictedYield * 10) / 10,
    explanation
  };
}

/**
 * Vérifie si le modèle est entraîné.
 */
export function isModelTrained(): boolean {
  return model !== null;
}