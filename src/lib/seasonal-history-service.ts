/**
 * @fileOverview Service de gestion des données historiques saisonnières.
 * Stocke et récupère les tendances multi-années pour les cultures vivrières.
 */

import { collection, addDoc, query, orderBy, getDocs, where, Timestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

export interface SeasonalData {
  id?: string;
  crop: string;
  year: number;
  month: number;
  region: string;
  ndvi: number;
  yield: number; // T/ha
  price: number; // FCFA/kg
  rainfall: number; // mm
  temperature: number; // °C
  timestamp: Timestamp;
}

/**
 * Ajoute une nouvelle entrée de données saisonnières.
 */
export async function addSeasonalData(data: Omit<SeasonalData, 'id' | 'timestamp'>): Promise<void> {
  try {
    const db = getFirestore();
    await addDoc(collection(db, 'seasonalData'), {
      ...data,
      timestamp: Timestamp.now()
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout des données saisonnières:', error);
  }
}

/**
 * Récupère les données saisonnières pour une culture et une région spécifiques.
 */
export async function getSeasonalData(crop: string, region: string, years: number = 5): Promise<SeasonalData[]> {
  try {
    const db = getFirestore();
    const startYear = new Date().getFullYear() - years;
    const q = query(
      collection(db, 'seasonalData'),
      where('crop', '==', crop),
      where('region', '==', region),
      where('year', '>=', startYear),
      orderBy('year', 'desc'),
      orderBy('month', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SeasonalData));
  } catch (error) {
    console.error('Erreur lors de la récupération des données saisonnières:', error);
    return [];
  }
}

/**
 * Calcule les tendances pour une culture (moyennes par année).
 */
export function calculateTrends(data: SeasonalData[]): Record<number, { avgYield: number; avgPrice: number; avgNdvi: number }> {
  const trends: Record<number, { yields: number[]; prices: number[]; ndvis: number[] }> = {};

  data.forEach(item => {
    if (!trends[item.year]) {
      trends[item.year] = { yields: [], prices: [], ndvis: [] };
    }
    trends[item.year].yields.push(item.yield);
    trends[item.year].prices.push(item.price);
    trends[item.year].ndvis.push(item.ndvi);
  });

  const result: Record<number, { avgYield: number; avgPrice: number; avgNdvi: number }> = {};
  Object.entries(trends).forEach(([year, values]) => {
    result[parseInt(year)] = {
      avgYield: values.yields.reduce((a, b) => a + b, 0) / values.yields.length,
      avgPrice: values.prices.reduce((a, b) => a + b, 0) / values.prices.length,
      avgNdvi: values.ndvis.reduce((a, b) => a + b, 0) / values.ndvis.length
    };
  });

  return result;
}

/**
 * Simule des données historiques pour le développement (sera remplacé par des données réelles).
 */
export async function seedHistoricalData(): Promise<void> {
  const crops = ['Riz', 'Maïs', 'Manioc', 'Tomate', 'Oignon'];
  const regions = ['Abidjan', 'Bouaké', 'Korhogo', 'Man'];

  for (let year = 2020; year <= 2025; year++) {
    for (const crop of crops) {
      for (const region of regions) {
        for (let month = 1; month <= 12; month++) {
          await addSeasonalData({
            crop,
            year,
            month,
            region,
            ndvi: Math.random() * 0.8 + 0.2, // 0.2-1.0
            yield: Math.random() * 5 + 1, // 1-6 T/ha
            price: Math.random() * 500 + 200, // 200-700 FCFA/kg
            rainfall: Math.random() * 200 + 50, // 50-250 mm
            temperature: Math.random() * 10 + 20 // 20-30°C
          });
        }
      }
    }
  }
}