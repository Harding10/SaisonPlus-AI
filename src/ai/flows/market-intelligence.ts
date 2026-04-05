'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MarketIntelligenceInputSchema = z.object({
  region: z.string().describe('Région de production (ex: Korhogo, San-Pédro)'),
  crops: z.array(z.object({
    type: z.string(),
    estimatedVolume: z.number().describe('Volume en tonnes'),
    harvestDate: z.string()
  })),
});

const MarketIntelligenceOutputSchema = z.object({
  marketTrends: z.array(z.object({
    marketName: z.string().describe('Nom du marché (ex: Adjamé, Treichville)'),
    crop: z.string(),
    currentPrice: z.number().describe('Prix actuel au kg/sac'),
    trend: z.enum(['stable', 'rising', 'falling']),
    demandLevel: z.enum(['low', 'medium', 'high']),
  })),
  logisticRecommendations: z.array(z.object({
    action: z.string().describe('Action logistique recommandée'),
    targetMarket: z.string(),
    priority: z.enum(['low', 'medium', 'high']),
    impact: z.string().describe('Impact financier/social estimé'),
  })),
  souveraineteNote: z.string().describe('Impact sur la sécurité alimentaire locale'),
});

export const marketIntelligenceFlow = ai.defineFlow(
  {
    name: 'marketIntelligenceFlow',
    inputSchema: MarketIntelligenceInputSchema,
    outputSchema: MarketIntelligenceOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: `Vous êtes l'Expert Analyste Marché de SaisonPlus. 
        Basé sur les récoltes prévues en Côte d'Ivoire (Région: ${input.region}), analysez la logistique vers Abidjan.
        
        Récoltes prévues : ${JSON.stringify(input.crops)}
        
        VOTRE RÔLE :
        1. Simuler les tendances de prix pour les 3 plus grands marchés : Adjamé (Gros), Treichville, et Abobo.
        2. Si un volume important de ${input.crops[0]?.type || 'produit'} arrive, déterminez si le marché risque la saturation.
        3. Proposez des redirections logistiques pour stabiliser les prix.
        
        Soyez stratégique et concret pour aider les coopératives.`,
        output: { schema: MarketIntelligenceOutputSchema }
      });
      
      if (!output) throw new Error('Échec de l\'analyse de marché.');
      return output;
    } catch (error) {
      console.warn("Genkit Quota Exceeded or Error - Falling back to local strategic logic:", error);
      
      // FALLBACK DATA (Expert Simulation)
      const fallbackData = {
        marketTrends: [
          { marketName: 'Adjamé (Gros)', crop: input.crops[0]?.type || 'Vivrier', currentPrice: 450, trend: 'stable' as const, demandLevel: 'high' as const },
          { marketName: 'Abobo', crop: input.crops[0]?.type || 'Vivrier', currentPrice: 500, trend: 'rising' as const, demandLevel: 'high' as const },
          { marketName: 'Yopougon', crop: input.crops[0]?.type || 'Vivrier', currentPrice: 480, trend: 'stable' as const, demandLevel: 'medium' as const }
        ],
        logisticRecommendations: [
          { 
            action: "Privilégier le stockage intermédiaire (Zone tampon)", 
            targetMarket: "Adjamé", 
            priority: "high" as const, 
            impact: "Évite l'effondrement des prix par saturation immédiate." 
          },
          { 
            action: "Redirection vers les marchés périphériques", 
            targetMarket: "Anyama", 
            priority: "medium" as const, 
            impact: "Capture d'une marge supérieure due à la rareté locale." 
          }
        ],
        souveraineteNote: "NOTE: Service en mode résilience (Quota API). Les données affichées sont des simulations stratégiques basées sur les flux saisonniers habituels. Sécurité alimentaire stable."
      } as const;
      return fallbackData;
    }
  }
);
