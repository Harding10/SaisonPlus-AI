
/**
 * @fileOverview Service de calcul de la Souveraineté Alimentaire (Côte d'Ivoire).
 * Gère les données de besoins nationaux et les projections de production.
 */

export interface CropSovereigntyInfo {
  id: string;
  name: string;
  nationalNeedTons: number; // Besoin annuel estimé (Tons)
  currentProjectedSupply: number; // Projection actuelle (Tons)
  shortageRisk: number; // 0 à 100 (100 = risque critique de pénurie)
  status: 'secure' | 'stable' | 'warning' | 'critical';
  trend: 'rising' | 'falling' | 'stable';
  strategicPriority: boolean;
}

// Données simplifiées inspirées des statistiques de la Côte d'Ivoire (MINADER)
const NATIONAL_CROPS_DATABASE: Record<string, Omit<CropSovereigntyInfo, 'id' | 'name'>> = {
  'Riz (Deni local)': {
    nationalNeedTons: 1500000,
    currentProjectedSupply: 950000, // Déficit structurel souvent compensé par l'importation
    shortageRisk: 65,
    status: 'warning',
    trend: 'falling',
    strategicPriority: true
  },
  'Maïs': {
    nationalNeedTons: 1100000,
    currentProjectedSupply: 1050000,
    shortageRisk: 15,
    status: 'stable',
    trend: 'stable',
    strategicPriority: true
  },
  'Manioc': {
    nationalNeedTons: 5000000,
    currentProjectedSupply: 4800000,
    shortageRisk: 8,
    status: 'secure',
    trend: 'rising',
    strategicPriority: false
  },
  'Igname': {
    nationalNeedTons: 6000000,
    currentProjectedSupply: 5800000,
    shortageRisk: 12,
    status: 'secure',
    trend: 'stable',
    strategicPriority: false
  },
  'Tomate': {
    nationalNeedTons: 150000,
    currentProjectedSupply: 100000, 
    shortageRisk: 82, // Forte dépendance saisonnière
    status: 'critical',
    trend: 'falling',
    strategicPriority: true
  },
  'Oignon': {
    nationalNeedTons: 300000,
    currentProjectedSupply: 80000,
    shortageRisk: 95, // Importé à 90% du Niger/Burkina
    status: 'critical',
    trend: 'falling',
    strategicPriority: true
  }
};

/**
 * Récupère l'ensemble des données de souveraineté pour les cultures vivrières.
 */
export function getSovereigntyStats(): CropSovereigntyInfo[] {
  return Object.entries(NATIONAL_CROPS_DATABASE).map(([name, data]) => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    ...data
  }));
}

/**
 * Calcule si une culture spécifique est en zone de risque stratégique.
 */
export function isStrategicCrop(cropName: string): boolean {
  const data = NATIONAL_CROPS_DATABASE[cropName];
  if (!data) return false;
  return data.strategicPriority || data.shortageRisk > 50;
}

/**
 * Simule l'impact d'une nouvelle parcelle sur la souveraineté nationale.
 * (Utilitaire pour encourager l'agriculteur)
 */
export function calculateSovereigntyImpact(cropName: string, areaHa: number, estimatedYieldTHa: number) {
  const production = areaHa * estimatedYieldTHa;
  const data = NATIONAL_CROPS_DATABASE[cropName];
  
  if (!data) return 0;
  
  const impactPercent = (production / data.nationalNeedTons) * 100;
  return impactPercent; 
}

/**
 * Retourne les conseils stratégiques basés sur les zones de pénurie.
 */
export function getStrategicAdvisory() {
  return [
    {
      crop: 'Riz',
      region: 'Vallées du Nord',
      action: 'Augmentation des surfaces irriguées recommandée pour réduire les importations.',
      urgency: 'high'
    },
    {
      crop: 'Oignon',
      region: 'Bagoué / Poro',
      action: 'Fort potentiel de marché : Offre nationale inférieure à 20% des besoins.',
      urgency: 'critical'
    },
    {
      crop: 'Maïs',
      region: 'Centre',
      action: 'Production stable, maintenir les rythmes actuels.',
      urgency: 'low'
    }
  ];
}
