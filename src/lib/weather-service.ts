'use server';

/**
 * @fileOverview Service Météo réel utilisant l'API Open-Meteo.
 * Récupère des prévisions 7 jours précises basées sur la latitude et longitude GPS.
 */

export interface DailyForecast {
  day: string;
  tempMax: number;
  tempMin: number;
  rainfall: number;
  condition: string;
  weatherCode: number;
  riskLevel: 'low' | 'medium' | 'high';
}

function getWeatherCondition(code: number): string {
  if (code === 0) return 'Ensoleillé';
  if (code >= 1 && code <= 3) return 'Nuageux';
  if (code >= 45 && code <= 48) return 'Brumeux';
  if (code >= 51 && code <= 67) return 'Pluie';
  if (code >= 71 && code <= 77) return 'Neige';
  if (code >= 80 && code <= 82) return 'Averses';
  if (code >= 95 && code <= 99) return 'Orageux';
  return 'Inconnu';
}

function calculateRiskLevel(rainfall: number, tempMax: number): 'low' | 'medium' | 'high' {
  if (rainfall > 30 || tempMax > 38) return 'high';
  if (rainfall > 10 || tempMax > 34) return 'medium';
  return 'low';
}

export async function fetchWeatherForecast(lat: number, lon: number): Promise<DailyForecast[]> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto`;
    const response = await fetch(url, { next: { revalidate: 3600 } });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch weather: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.daily) {
      throw new Error("Invalid format from Open-Meteo");
    }

    const daily = data.daily;
    const forecasts: DailyForecast[] = [];

    const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

    for (let i = 0; i < Math.min(7, daily.time.length); i++) {
      const date = new Date(daily.time[i]);
      const dayName = i === 0 ? 'Auj' : daysOfWeek[date.getDay()];
      
      const rainfall = daily.precipitation_sum[i] || 0;
      const tempMax = daily.temperature_2m_max[i];
      const tempMin = daily.temperature_2m_min[i];
      const weatherCode = daily.weathercode[i];

      forecasts.push({
        day: dayName,
        tempMax: Math.round(tempMax),
        tempMin: Math.round(tempMin),
        rainfall: Math.round(rainfall * 10) / 10,
        condition: getWeatherCondition(weatherCode),
        weatherCode,
        riskLevel: calculateRiskLevel(rainfall, tempMax)
      });
    }

    return forecasts;
  } catch (error) {
    console.error("[WEATHER PRODUCTION] Échec de la récupération Open-Meteo :", error);
    // Fallback in case of API failure
    return fallbackForecast();
  }
}

function fallbackForecast(): DailyForecast[] {
  const days = ['Auj', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  return days.map(day => ({
    day,
    tempMax: 32,
    tempMin: 23,
    rainfall: 0,
    condition: 'Ensoleillé',
    weatherCode: 0,
    riskLevel: 'low'
  }));
}
