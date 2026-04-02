
'use server';

import { generateCropRecommendation, GenerateCropRecommendationInput } from "@/ai/flows/generate-crop-recommendation";

/**
 * Action Serveur pour lancer l'analyse satellitaire via Genkit.
 * Cette fonction sert de pont entre l'interface utilisateur et le moteur d'IA.
 */
export async function runSatelliteAnalysis(input: GenerateCropRecommendationInput) {
  try {
    // Appel du flux Genkit pour obtenir la recommandation basée sur Earth Engine
    const recommendation = await generateCropRecommendation(input);
    return { success: true, data: recommendation };
  } catch (error) {
    console.error("[Action Serveur] Erreur lors de l'analyse spatiale :", error);
    return { success: false, error: "Échec de l'initialisation du calcul spatial." };
  }
}
