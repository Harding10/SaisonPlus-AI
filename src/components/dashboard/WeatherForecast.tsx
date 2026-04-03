'use client';

import { Cloud, Sun, CloudRain, Zap, Droplets, AlertTriangle, ThermometerSun } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeatherDay {
  day: string;
  tempMax: number;
  tempMin: number;
  rainfall: number;
  condition: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface WeatherForecastProps {
  forecast: WeatherDay[];
}

function getWeatherIcon(condition: string) {
  const c = condition.toLowerCase();
  if (c.includes('orage')) return <Zap className="w-5 h-5" />;
  if (c.includes('pluie')) return <CloudRain className="w-5 h-5" />;
  if (c.includes('nuage')) return <Cloud className="w-5 h-5" />;
  return <Sun className="w-5 h-5" />;
}

const RISK_CLASSES = {
  low: 'bg-[#eaffed] text-[#32d74b] border-[#32d74b]/20',
  medium: 'bg-orange-50 text-orange-600 border-orange-200',
  high: 'bg-red-50 text-red-600 border-red-200',
};

const RISK_LABELS = {
  low: 'Optimal',
  medium: 'Attention',
  high: 'Risque',
};

export function WeatherForecast({ forecast }: WeatherForecastProps) {
  const highRiskDays = forecast.filter(d => d.riskLevel === 'high').length;
  const totalRainfall = forecast.reduce((sum, d) => sum + d.rainfall, 0);

  return (
    <div className="space-y-5">
      {/* Risk Summary Banner */}
      {highRiskDays > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-xs font-black text-red-700 uppercase tracking-tight">
            {highRiskDays} jour{highRiskDays > 1 ? 's' : ''} à risque élevé — Surveillance renforcée recommandée
          </p>
        </div>
      )}

      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-blue-50 border border-blue-100">
          <Droplets className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">Pluie Totale</p>
            <p className="text-sm font-black text-blue-700">{totalRainfall.toFixed(0)} mm</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-orange-50 border border-orange-100">
          <ThermometerSun className="w-5 h-5 text-orange-500" />
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-orange-400">Temp. Max</p>
            <p className="text-sm font-black text-orange-700">{Math.max(...forecast.map(d => d.tempMax))}°C</p>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div className="grid grid-cols-7 gap-1">
        {forecast.map((day, i) => (
          <div
            key={i}
            className={cn(
              "flex flex-col items-center gap-2 p-2 rounded-2xl border text-center transition-all",
              RISK_CLASSES[day.riskLevel]
            )}
          >
            <span className="text-[9px] font-black uppercase tracking-widest opacity-70">{day.day}</span>
            <div className="opacity-80">{getWeatherIcon(day.condition)}</div>
            <div>
              <p className="text-[11px] font-black leading-none">{day.tempMax}°</p>
              <p className="text-[9px] opacity-50 font-bold">{day.tempMin}°</p>
            </div>
            {day.rainfall > 0 && (
              <span className="text-[8px] font-black opacity-70 flex items-center gap-0.5">
                <Droplets className="w-2 h-2" />{day.rainfall}
              </span>
            )}
            <span className={cn(
              "text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full",
              day.riskLevel === 'high' ? 'bg-red-200' : day.riskLevel === 'medium' ? 'bg-orange-200' : 'bg-[#32d74b]/20'
            )}>
              {RISK_LABELS[day.riskLevel]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
