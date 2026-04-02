'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Share2, Zap, Clock, FileText, Satellite, TrendingUp, Info, Download, FileJson, FileSpreadsheet, FileType } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OpportunityProps {
  data: any;
}

export function OpportunityCard({ data }: OpportunityProps) {
  const isGood = data.successScore > 70;
  const hasAnomaly = data.anomalies?.hasAnomaly;

  // Fonction utilitaire pour le téléchargement de fichiers
  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  };

  // Exportation JSON pour les systèmes d'information
  const exportAsJSON = () => {
    const exportData = {
      ...data,
      exportTimestamp: new Date().toISOString(),
      source: "SaisonPlus AI / Sentinel-2B GEE"
    };
    downloadFile(JSON.stringify(exportData, null, 2), `SaisonPlus_Rapport_${data.zone}_${new Date().getTime()}.json`, 'application/json');
  };

  // Exportation CSV pour les tableurs agronomiques
  const exportAsCSV = () => {
    const headers = "Identifiant,Zone,Culture,ScoreSucces,NDVI,Humidite,Maturite,DateRecoltePrevue\n";
    const row = `${data.id || 'N/A'},${data.zone},${data.recommendedCrop},${data.successScore}%,${data.telemetryUsed?.ndvi || 'N/A'},${data.telemetryUsed?.humidity || 'N/A'}%,${data.maturityProgress}%,${data.estimatedHarvestDate}\n`;
    downloadFile(headers + row, `SaisonPlus_Donnees_${data.zone}.csv`, 'text/csv');
  };

  // Exportation Rapport Texte pour lecture humaine
  const exportAsText = () => {
    const report = `
=========================================
SAISONPLUS AI - RAPPORT D'ANALYSE SPECTRALE
=========================================
Généré le : ${new Date().toLocaleString()}
Source : Constellation Sentinel-2B
-----------------------------------------
ZONE D'ANALYSE : ${data.zone.toUpperCase()}
CULTURE CIBLE : ${data.recommendedCrop}
SCORE DE RÉUSSITE : ${data.successScore}%
-----------------------------------------
TÉLÉMÉTRIE DE MATURITÉ :
- Progrès : ${data.maturityProgress}%
- Récolte optimale dans : ${data.daysToHarvest} jours
- Fenêtre prévue : ${data.estimatedHarvestDate}
-----------------------------------------
DIAGNOSTIC EXPERT GEMINI :
"${data.explanation}"
-----------------------------------------
SOUVERAINETÉ ALIMENTAIRE :
${data.impactSouverainete || 'Analyse d\'impact nationale certifiée GEE.'}
=========================================
    `;
    downloadFile(report.trim(), `SaisonPlus_Bulletin_${data.zone}.txt`, 'text/plain');
  };

  return (
    <Card className="overflow-hidden border-none bg-white group h-full flex flex-col">
      <CardHeader className="pb-4 bg-slate-50 border-b space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2 text-slate-500">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-sm">
               <Satellite className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-black block leading-none">{data.zone}</span>
              <span className="text-[8px] uppercase font-bold text-slate-400">Scan ID: {data.id?.substring(0, 8) || 'GEE-LIVE'}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {hasAnomaly && (
              <Badge variant="destructive" className="flex items-center gap-1 text-[8px] h-5 px-1.5 rounded-sm uppercase font-black tracking-widest">
                <Zap className="w-2.5 h-2.5" /> Stress Alerte
              </Badge>
            )}
            <Badge variant={isGood ? "default" : "secondary"} className={`text-[8px] h-5 px-1.5 rounded-sm uppercase font-black tracking-widest ${isGood ? 'bg-primary text-white' : ''}`}>
              Score: {data.successScore}%
            </Badge>
          </div>
        </div>
        
        <CardTitle className="text-xl font-black capitalize flex items-center justify-between text-slate-900 tracking-tight">
          <div className="flex items-center gap-3">
            <span className="text-2xl filter drop-shadow-sm">🌱</span>
            {data.recommendedCrop}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-primary/20 hover:bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest gap-2">
                <Download className="w-3 h-3" /> Exporter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white border-slate-200 shadow-2xl">
              <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Format Export</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={exportAsJSON} className="gap-3 cursor-pointer py-3 hover:bg-slate-50">
                <FileJson className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase">JSON Scientifique</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportAsCSV} className="gap-3 cursor-pointer py-3 hover:bg-slate-50">
                <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold uppercase">Tableur CSV</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportAsText} className="gap-3 cursor-pointer py-3 hover:bg-slate-50">
                <FileType className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold uppercase">Rapport Texte</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6 flex-1 flex flex-col">
        {/* Télémétrie de Maturité */}
        <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100 shadow-inner">
          <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400 tracking-widest">
            <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-primary" /> État de Maturité Spatiale</span>
            <span className="text-primary font-bold">{data.maturityProgress}%</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${data.maturityProgress}%` }} />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Récolte Optimale :</span>
            <span className="text-xs font-black text-slate-800">{data.daysToHarvest} JOURS</span>
          </div>
        </div>

        {/* Bulletin IA Expert */}
        <div className="space-y-3 flex-1">
          <h4 className="text-[9px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2">
            <FileText className="w-3.5 h-3.5" /> Diagnostic Expert Gemini
          </h4>
          <p className="text-xs leading-relaxed text-slate-600 font-medium italic border-l-2 border-primary/20 pl-4 py-1">
            &quot;{data.explanation}&quot;
          </p>
        </div>

        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-auto">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Fenêtre de récolte</span>
            <span className="text-[10px] font-black text-slate-800 uppercase flex items-center gap-1">
              <Calendar className="w-3 h-3 text-primary" /> {data.estimatedHarvestDate}
            </span>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" className="h-auto p-0 text-[9px] font-black uppercase tracking-[0.2em] text-primary hover:bg-transparent group/btn">
                  Détails GEE <TrendingUp className="w-3 h-3 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-900 text-white text-[10px] uppercase font-bold tracking-widest border-none">
                Données certifiées Sentinel-2B via GEE
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}
