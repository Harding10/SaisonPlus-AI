'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LocateFixed, Radar, Activity } from "lucide-react";
import { Radar as ReRadar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface VegetationRadarProps {
  zone: string;
  ndvi: number;
}

export function VegetationRadar({ zone, ndvi }: VegetationRadarProps) {
  const data = [
    { subject: 'NORD', A: ndvi * 0.8 },
    { subject: 'EST', A: ndvi * 1.1 },
    { subject: 'SUD', A: ndvi * 0.9 },
    { subject: 'OUEST', A: ndvi * 1.2 },
    { subject: 'CENTRE', A: ndvi },
    { subject: 'PÉRI.', A: ndvi * 0.7 },
  ];

  return (
    <Card className="hud-border bg-white shadow-xl h-full flex flex-col">
      <CardHeader className="border-b bg-muted/10 p-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 text-primary">
            <Radar className="w-4 h-4" /> Scan Spectral Sectoriel
          </CardTitle>
          <Badge variant="outline" className="text-[8px] font-bold bg-primary/5 border-primary/20 text-primary">
            S2-RT
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-6 relative flex flex-col items-center justify-center">
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://picsum.photos/seed/sat/800/800')] bg-cover grayscale pointer-events-none" />
        
        <div className="w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="rgba(34, 197, 94, 0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(0,0,0,0.4)', fontSize: 9, fontWeight: 'bold' }} />
              <PolarRadiusAxis domain={[0, 1]} tick={false} axisLine={false} />
              <ReRadar
                name="NDVI"
                dataKey="A"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full flex justify-between items-end mt-4 border-t pt-4">
          <div className="bg-muted/50 p-2 rounded-lg border border-border">
            <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1">Coordonnées Cible</p>
            <div className="flex items-center gap-2">
              <LocateFixed className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-black text-foreground">{zone.toUpperCase()}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-black uppercase text-primary tracking-widest mb-1">Index NDVI Moyen</p>
            <p className="text-xl font-black text-foreground tabular-nums">{ndvi.toFixed(3)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}