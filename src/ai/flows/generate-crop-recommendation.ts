'use server';

/**
 * @fileOverview Flux d'IA SaisonPlus pour l'analyse agronomique complète.
 * Utilise les données spectrales REELLES de Sentinel-2 pour les diagnostics.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { fetchSentinelData } from '@/lib/satellite-service';

const GenerateCropRecommendationInputSchema = z.object({
  zone: z.string().describe('Zone géographique en Côte d\'Ivoire.'),
  soilType: z.string().describe('Type de sol observé.'),
  cropType: z.string().optional().describe('Culture spécifique à analyser.'),
});
export type GenerateCropRecommendationInput = z.infer<typeof GenerateCropRecommendationInputSchema>;

const GenerateCropRecommendationOutputSchema = z.object({
  recommendedCrop: z.string(),
  successScore: z.number(),
  estimatedHarvestDate: z.string(),
  daysToHarvest: z.number(),
  maturityProgress: z.number(),
  explanation: z.string(),
  impactSouverainete: z.string(),
  anomalies: z.object({
    hasAnomaly: z.boolean(),
    type: z.enum(['Sécheresse', 'Ravageurs', 'Excès d\'eau', 'Aucune']),
    description: z.string(),
    severity: z.enum(['Faible', 'Modérée', 'Critique']),
  }),
  telemetryUsed: z.object({
    ndvi: z.number(),
    humidity: z.number(),
    historicalNdviAverage: z.number(),
  }),
  resilienceData: z.object({
    currentYearCurve: z.array(z.number()),
    lastYearCurve: z.array(z.number()),
  }),
});
export type GenerateCropRecommendationOutput = z.infer<typeof GenerateCropRecommendationOutputSchema>;

const geeTool = ai.defineTool(
  {
    name: 'queryGoogleEarthEngine',
    description: 'Récupère les statistiques spectrales réelles depuis Sentinel-2.',
    inputSchema: z.object({ zone: z.string() }),
    outputSchema: z.any(),
  },
  async (input) => {
    return await fetchSentinelData(input.zone);
  }
);

export async function generateCropRecommendation(
  input: GenerateCropRecommendationInput
): Promise<GenerateCropRecommendationOutput> {
  return generateCropRecommendationFlow(input);
}

const generateCropRecommendationPrompt = ai.definePrompt({
  name: 'generateCropRecommendationPrompt',
  tools: [geeTool],
  input: { schema: GenerateCropRecommendationInputSchema },
  output: { schema: GenerateCropRecommendationOutputSchema },
  prompt: `Vous êtes l'IA Agronome experte de SaisonPlus. 
  
  VOTRE MISSION :
  1. Appeler impérativement "queryGoogleEarthEngine" pour obtenir le NDVI et l'humidité RÉELS.
  2. Analyser la valeur NDVI reçue (Typiquement entre 0.1 et 0.9). 
     - 0.1-0.3 : Sol nu ou stress sévère.
     - 0.4-0.6 : Végétation moyenne, croissance en cours.
     - 0.7-0.9 : Biomasse dense, maturité proche.
  3. Comparer avec le type de culture {{{cropType}}} et le sol {{{soilType}}}.
  4. Détecter des anomalies basées sur les chiffres réels.
  5. Générer des données de résilience plausibles basées sur la valeur NDVI actuelle.
  
  CONSEIL TECHNIQUE : Soyez extrêmement précis. Si le NDVI est faible, ne recommandez pas une récolte immédiate.`,
});

const generateCropRecommendationFlow = ai.defineFlow(
  {
    name: 'generateCropRecommendationFlow',
    inputSchema: GenerateCropRecommendationInputSchema,
    outputSchema: GenerateCropRecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await generateCropRecommendationPrompt(input);
    if (!output) throw new Error('Échec du diagnostic spatial.');
    
    return output as GenerateCropRecommendationOutput;
  }
);
