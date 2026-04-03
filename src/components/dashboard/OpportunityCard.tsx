'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar, Satellite, TrendingUp, TrendingDown, Minus,
  FileText, Download, FileJson, FileSpreadsheet, FileType,
  Zap, ShieldCheck, AlertTriangle, CheckCircle2, Clock,
  Leaf, Droplets, Activity, FlaskConical, Wind
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WeatherForecast } from "./WeatherForecast";
import { YieldProjection } from "./YieldProjection";
import { CropTimeline } from "./CropTimeline";
import { exportToPDF } from "@/lib/pdf-export";
import { File } from "lucide-react";

interface OpportunityProps {
  data: any;
}

const PRIORITY_CONFIG = {
  urgent: { color: 'bg-red-500/10 text-red-700 border-red-200', label: '🔴 URGENT', icon: AlertTriangle },
  important: { color: 'bg-orange-500/10 text-orange-700 border-orange-200', label: '🟠 IMPORTANT', icon: Zap },
  optimal: { color: 'bg-[#eaffed] text-[#32d74b] border-[#32d74b]/20', label: '🟢 OPTIMAL', icon: CheckCircle2 },
};

function SatelliteKPI({
  label, value, unit, trend, color, icon: Icon
}: { label: string; value: number; unit?: string; trend?: number; color: string; icon: any }) {
  const trendIcon = trend && trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend && trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />;
  const trendColor = trend && trend > 0 ? 'text-[#32d74b]' : trend && trend < 0 ? 'text-red-500' : 'text-slate-400';

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-[9px] font-black uppercase ${trendColor}`}>
            {trendIcon} {Math.abs(trend).toFixed(0)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-900 tracking-tighter leading-none">
          {typeof value === 'number' ? value.toFixed(2) : value}
          {unit && <span className="text-sm font-bold text-slate-400 ml-1">{unit}</span>}
        </p>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

function NDVIHeatmap({ ndvi }: { ndvi: number }) {
  const pct = Math.max(0, Math.min(1, ndvi));
  const stops = [
    { offset: '0%', color: '#ff453a' },   // rouge (stress severe)
    { offset: '25%', color: '#ff9f0a' },  // orange
    { offset: '50%', color: '#ffd60a' },  // jaune
    { offset: '75%', color: '#32d74b' },  // vert
    { offset: '100%', color: '#007629' }, // vert foncé (dense)
  ];

  return (
    <div className="space-y-3">
      <div className="relative h-8 w-full rounded-full overflow-hidden" style={{
        background: 'linear-gradient(to right, #ff453a, #ff9f0a, #ffd60a, #32d74b, #007629)'
      }}>
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-xl"
          style={{ left: `calc(${pct * 100}% - 2px)` }}
        />
      </div>
      <div className="flex justify-between text-[8px] font-black uppercase text-slate-400">
        <span>0.0 Sol Nu</span>
        <span className="text-slate-600">
          NDVI actuel: <span className="font-black text-slate-900">{ndvi.toFixed(3)}</span>
        </span>
        <span>1.0 Dense</span>
      </div>
    </div>
  );
}

export function OpportunityCard({ data }: OpportunityProps) {
  const isGood = data.successScore > 70;
  const hasAnomaly = data.anomalies?.hasAnomaly;
  const ndwi = data.telemetryUsed?.ndwi ?? 0.4;
  const evi = data.telemetryUsed?.evi ?? 0.55;

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  };

  const exportAsPDF = async () => {
    await exportToPDF({
      elementId: `report-${data.zone?.replace(/\s/g, '-')}`,
      filename: `SaisonPlus_Bulletin_${data.zone}_${Date.now()}`,
      zone: data.zone,
    });
  };

  const exportAsJSON = () => {
    downloadFile(JSON.stringify({ ...data, exportTimestamp: new Date().toISOString(), source: "SaisonPlus AI / Sentinel-2B GEE" }, null, 2),
      `SaisonPlus_Rapport_${data.zone}_${Date.now()}.json`, 'application/json');
  };

  const exportAsCSV = () => {
    const headers = "Zone,Culture,Score,NDVI,NDWI,EVI,Humidite,Temperature,RendEstime,RendMax,DateRecolte\n";
    const row = `${data.zone},${data.recommendedCrop},${data.successScore}%,${data.telemetryUsed?.ndvi},${ndwi},${evi},${data.telemetryUsed?.humidity}%,${data.telemetryUsed?.temperature}°C,${data.yieldProjection?.estimatedYield}T/ha,${data.yieldProjection?.maxPotential}T/ha,${data.estimatedHarvestDate}\n`;
    downloadFile(headers + row, `SaisonPlus_Donnees_${data.zone}.csv`, 'text/csv');
  };

  const exportAsText = () => {
    const yp = data.yieldProjection;
    const report = `
=========================================
SAISONPLUS AI — RAPPORT D'ANALYSE COMPLET
=========================================
Zone : ${data.zone.toUpperCase()} | Culture : ${data.recommendedCrop} | Score : ${data.successScore}%

--- INDICES SATELLITES ---
NDVI  : ${data.telemetryUsed?.ndvi?.toFixed(3)} (Santé végétale)
NDWI  : ${ndwi.toFixed(3)}              (Hydrique)
EVI   : ${evi.toFixed(3)}               (Biomasse)
Humidité: ${data.telemetryUsed?.humidity}% | Température: ${data.telemetryUsed?.temperature}°C

--- PROJECTION RENDEMENT ---
Estimé: ${yp?.estimatedYield} T/ha | Max: ${yp?.maxPotential} T/ha | Déf. eau: ${yp?.waterDeficit}%

--- DIAGNOSTIC EXPERT ---
"${data.explanation}"

--- ACTIONS PRIORITAIRES ---
${data.actionItems?.map((a: any, i: number) => `${i + 1}. [${a.priority.toUpperCase()}] ${a.action} — ${a.deadline}`).join('\n')}

--- RÉCOLTE ---
Progression: ${data.maturityProgress}% | Récolte dans: ${data.daysToHarvest} jours | Date: ${data.estimatedHarvestDate}
=========================================`;
    downloadFile(report.trim(), `SaisonPlus_Bulletin_${data.zone}.txt`, 'text/plain');
  };

  return (
    <div id={`report-${data.zone?.replace(/\s/g, '-')}`} className="bg-white rounded-[32px] overflow-hidden shadow-2xl border border-slate-100">
      {/* ===== ENTÊTE SANTÉ GLOBALE ===== */}
      <div className={`p-8 ${isGood ? 'bg-gradient-to-br from-[#007629] to-[#32d74b]' : 'bg-gradient-to-br from-slate-700 to-slate-900'} text-white`}>
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <Satellite className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
                {data.zone} • Sentinel-2B
              </span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter leading-none mb-2">
              {data.recommendedCrop}
            </h2>
            <p className="text-sm opacity-70 font-medium">{data.telemetryUsed?.producerInfo || 'Coopérative Locale'}</p>
          </div>

          {/* Score Global */}
          <div className="text-center">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                <circle cx="40" cy="40" r="34" fill="none" stroke="white" strokeWidth="8"
                  strokeDasharray={`${(data.successScore / 100) * 213.6} 213.6`}
                  strokeLinecap="round" className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black leading-none">{data.successScore}</span>
                <span className="text-[8px] font-black opacity-70">%</span>
              </div>
            </div>
            <p className="text-[8px] font-black uppercase tracking-widest opacity-70 mt-1">Score Santé</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {hasAnomaly && (
            <Badge className="bg-red-500/20 text-white border-red-300/30 text-[9px] font-black uppercase tracking-widest gap-1 backdrop-blur-sm">
              <AlertTriangle className="w-3 h-3" /> {data.anomalies.type} — {data.anomalies.severity}
            </Badge>
          )}
          <Badge className="bg-white/10 text-white border-white/20 text-[9px] font-black uppercase tracking-widest gap-1 backdrop-blur-sm">
            <Calendar className="w-3 h-3" /> Récolte dans {data.daysToHarvest}j
          </Badge>
          <Badge className="bg-white/10 text-white border-white/20 text-[9px] font-black uppercase tracking-widest gap-1 backdrop-blur-sm">
            <Clock className="w-3 h-3" /> {data.telemetryUsed?.lastPass ? new Date(data.telemetryUsed.lastPass).toLocaleDateString('fr') : 'Aujourd\'hui'}
          </Badge>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {/* ===== HEATMAP NDVI ===== */}
        <div>
          <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-[#32d74b] rounded-full" /> Carte NDVI — Gradient de Santé
          </h3>
          <NDVIHeatmap ndvi={data.telemetryUsed?.ndvi ?? 0.5} />
        </div>

        {/* ===== 3 KPIs SATELLITES ===== */}
        <div>
          <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-blue-500 rounded-full" /> Indices Satellitaires
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <SatelliteKPI
              label="NDVI Santé"
              value={data.telemetryUsed?.ndvi ?? 0}
              trend={((data.telemetryUsed?.ndvi - (data.telemetryUsed?.historicalNdviAverage ?? 0)) / (data.telemetryUsed?.historicalNdviAverage ?? 1)) * 100}
              icon={Leaf}
              color="bg-[#eaffed] text-[#32d74b]"
            />
            <SatelliteKPI
              label="NDWI Eau"
              value={ndwi}
              icon={Droplets}
              color="bg-blue-50 text-blue-500"
            />
            <SatelliteKPI
              label="EVI Biomasse"
              value={evi}
              icon={Activity}
              color="bg-orange-50 text-orange-500"
            />
          </div>
        </div>

        {/* ===== SANTÉ DU SOL ===== */}
        {/* ===== MÉTÉO 7 JOURS ===== */}
        {data.weatherForecast && (
          <div>
            <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-sky-500 rounded-full" /> Prévisions Météo — 7 Jours
            </h3>
            <WeatherForecast forecast={data.weatherForecast} />
          </div>
        )}

        {/* ===== PROJECTION RENDEMENT ===== */}
        {data.yieldProjection && (
          <div>
            <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-purple-500 rounded-full" /> Projection de Rendement
            </h3>
            <YieldProjection data={data.yieldProjection} cropType={data.recommendedCrop} />
          </div>
        )}

        {/* ===== CALENDRIER CULTURAL ===== */}
        <div>
          <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-emerald-500 rounded-full" /> Calendrier Cultural
          </h3>
          <CropTimeline
            cropType={data.recommendedCrop}
            maturityProgress={data.maturityProgress}
            estimatedHarvestDate={data.estimatedHarvestDate}
            daysToHarvest={data.daysToHarvest}
          />
        </div>

        {/* ===== DIAGNOSTIC IA ===== */}
        <div>
          <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-violet-500 rounded-full" /> Diagnostic Expert Génie Rural
          </h3>
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
            <p className="text-sm leading-relaxed text-slate-700 font-medium italic border-l-4 border-[#32d74b] pl-4">
              "{data.explanation}"
            </p>
            {data.impactSouverainete && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-[#eaffed] border border-[#32d74b]/20">
                <ShieldCheck className="w-4 h-4 text-[#32d74b] shrink-0 mt-0.5" />
                <p className="text-[10px] font-bold text-[#007629] leading-relaxed">{data.impactSouverainete}</p>
              </div>
            )}
          </div>
        </div>

        {/* ===== 3 ACTIONS PRIORITAIRES ===== */}
        {data.actionItems && (
          <div>
            <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-red-500 rounded-full" /> Actions Prioritaires
            </h3>
            <div className="space-y-3">
              {data.actionItems.map((item: any, i: number) => {
                const cfg = PRIORITY_CONFIG[item.priority as keyof typeof PRIORITY_CONFIG];
                const Icon = cfg.icon;
                return (
                  <div key={i} className={`p-4 rounded-2xl border ${cfg.color} flex gap-4 items-start`}>
                    <div className="shrink-0 w-8 h-8 rounded-xl bg-white/70 flex items-center justify-center shadow-sm">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-60">{cfg.label}</span>
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-60 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />{item.deadline}
                        </span>
                      </div>
                      <p className="text-xs font-black leading-snug">{item.action}</p>
                      <p className="text-[10px] font-medium opacity-70 mt-1">↳ {item.impact}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== PIED DE PAGE : DATE + EXPORT ===== */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          <div>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Fenêtre de récolte</p>
            <p className="text-sm font-black text-slate-800 flex items-center gap-1 mt-1">
              <Calendar className="w-4 h-4 text-[#32d74b]" /> {data.estimatedHarvestDate}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-10 px-6 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-[9px] uppercase tracking-widest gap-2">
                <Download className="w-4 h-4" /> Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 bg-white border-slate-200 shadow-2xl rounded-2xl p-2">
              <DropdownMenuLabel className="text-[9px] font-black uppercase text-slate-400 tracking-widest px-3">Format Export</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={exportAsPDF} className="gap-3 cursor-pointer py-3 rounded-xl hover:bg-slate-50">
                <File className="w-4 h-4 text-red-500" /><span className="text-xs font-bold uppercase">Bulletin PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportAsJSON} className="gap-3 cursor-pointer py-3 rounded-xl hover:bg-slate-50">
                <FileJson className="w-4 h-4 text-[#32d74b]" /><span className="text-xs font-bold uppercase">JSON Scientifique</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportAsCSV} className="gap-3 cursor-pointer py-3 rounded-xl hover:bg-slate-50">
                <FileSpreadsheet className="w-4 h-4 text-blue-500" /><span className="text-xs font-bold uppercase">Tableur CSV</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportAsText} className="gap-3 cursor-pointer py-3 rounded-xl hover:bg-slate-50">
                <FileType className="w-4 h-4 text-slate-500" /><span className="text-xs font-bold uppercase">Rapport Texte</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
