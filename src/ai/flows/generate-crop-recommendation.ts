'use server';

/**
 * @fileOverview Flux d'IA SaisonPlus pour l'analyse agronomique complète.
 * Utilise les données spectrales REELLES de Sentinel-2 pour les diagnostics.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { fetchSentinelData } from '@/lib/satellite-service';
import { fetchWeatherForecast } from '@/lib/weather-service';

const GenerateCropRecommendationInputSchema = z.object({
  parcelGeoJSON: z.string().describe('GeoJSON de la parcelle tracée'),
  parcelName: z.string().describe('Nom local de la parcelle'),
  parcelArea: z.number().describe('Superficie en hectares'),
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
    ndwi: z.number().describe('Indice eau (entre -1 et 1)'),
    evi: z.number().describe('Indice biomasse (entre 0 et 1)'),
    humidity: z.number(),
    temperature: z.number(),
    cloudCover: z.number(),
    historicalNdviAverage: z.number(),
    lat: z.number().optional(),
    lon: z.number().optional(),
    producerInfo: z.string().optional(),
    lastPass: z.string().optional(),
  }),
  weatherForecast: z.array(z.object({
    day: z.string().describe('Nom du jour ex: Lun, Mar'),
    tempMax: z.number(),
    tempMin: z.number(),
    rainfall: z.number().describe('Pluie prévue en mm'),
    condition: z.string().describe('Ensoleillé, Nuageux, Pluie, Orageux'),
    riskLevel: z.enum(['low', 'medium', 'high']).describe('Risque meteorologique pour la culture'),
  })).length(7),
  yieldProjection: z.object({
    estimatedYield: z.number().describe('Rendement estimé en T/ha'),
    maxPotential: z.number().describe('Rendement maximum potentiel en T/ha'),
    waterDeficit: z.number().describe('Déficit hydrique en %'),
    nitrogenUptake: z.number().describe('Absorption azote en kg/ha estimée'),
  }),
  actionItems: z.array(z.object({
    priority: z.enum(['urgent', 'important', 'optimal']),
    action: z.string().describe('Action agronomique concrète et courte'),
    deadline: z.string().describe('Délai ex: Dans 48h, Cette semaine'),
    impact: z.string().describe('Impact attendu de l\'action (court)'),
  })).length(3),
  resilienceData: z.object({
    currentYearCurve: z.array(z.number()),
    lastYearCurve: z.array(z.number()),
  }),
});
export type GenerateCropRecommendationOutput = z.infer<typeof GenerateCropRecommendationOutputSchema>;

const geeTool = ai.defineTool(
  {
    name: 'queryGoogleEarthEngine',
    description: 'Récupère les statistiques spectrales réelles depuis Sentinel-2 sur la parcelle exacte.',
    inputSchema: z.object({ parcelGeoJSON: z.string(), parcelName: z.string() }),
    outputSchema: z.any(),
  },
  async (input) => {
    return await fetchSentinelData(input.parcelGeoJSON, input.parcelName);
  }
);

const weatherTool = ai.defineTool(
  {
    name: 'queryRealWeather',
    description: 'Récupère les prévisions météo réelles sur 7 jours via Open-Meteo.',
    inputSchema: z.object({ lat: z.number(), lon: z.number() }),
    outputSchema: z.any(),
  },
  async (input) => {
    return await fetchWeatherForecast(input.lat, input.lon);
  }
);

export async function generateCropRecommendation(
  input: GenerateCropRecommendationInput
): Promise<GenerateCropRecommendationOutput> {
  return generateCropRecommendationFlow(input);
}

const generateCropRecommendationPrompt = ai.definePrompt({
  name: 'generateCropRecommendationPrompt',
  tools: [geeTool, weatherTool],
  input: { schema: GenerateCropRecommendationInputSchema },
  output: { schema: GenerateCropRecommendationOutputSchema },
  prompt: `Vous êtes l'IA Agronome experte de SaisonPlus, spécialisée en agriculture tropicale ouest-africaine.

  VOTRE MISSION COMPLÈTE :
  1. Appeler OBLIGATOIREMENT "queryGoogleEarthEngine" avec le geoJSON de {{{parcelName}}} pour obtenir les données satellite RÉELLES (ndvi, ndwi, evi, lat, lon) calculées exactement sur la géométrie du champ.
  2. Appeler OBLIGATOIREMENT "queryRealWeather" en utilisant la latitude et longitude retournées par Earth Engine. Intégrez EXACTEMENT ces vraies données météo dans l'output final \`weatherForecast\`. Ne rien inventer pour la météo.
  3. Analyser la valeur NDVI :
     - 0.1-0.3 : Sol nu ou stress sévère → score bas, anomalie probable.
     - 0.4-0.6 : Végétation moyenne, croissance en cours → score moyen.
     - 0.7-0.9 : Biomasse dense, maturité proche → score élevé.
  
  4. INTERDICTION FORMELLE D'INVENTER LA SANTÉ DU SOL : Ne fournissez plus de N, P, K.
  
  5. PROJECTION RENDEMENT (strictement basée sur NDVI/EVI) :
     - estimatedYield: Basé sur EVI et NDVI.
     - maxPotential: 30-50% au-dessus de l'estimé.
     - waterDeficit: Déduit directement du NDWI réel calculé par GEE.
     - nitrogenUptake: Estimez grossièrement selon la biomasse (NDVI).
  6. 3 ACTIONS PRIORITAIRES concrètes, ordonnées par urgence, adaptées à la culture, à la météo réelle et aux anomalies détectées sur les {{{parcelArea}}} hectares du champ.
  
  Soyez extrêmement précis et scientifiquement cohérent. Les données doivent être plausibles et strictement dérivées de vos outils, aucune invention.`,
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
