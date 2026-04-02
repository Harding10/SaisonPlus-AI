'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { History, CloudRain } from "lucide-react";

interface ResilienceChartProps {
  currentData: number[];
  lastYearData: number[];
}

export function ResilienceChart({ currentData, lastYearData }: ResilienceChartProps) {
  const chartData = currentData.map((val, i) => ({
    month: ['J', 'F', 'M', 'A', 'M', 'J'][i],
    current: val,
    last: lastYearData[i],
  }));

  return (
    <Card className="shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <History className="w-4 h-4 text-primary" /> Historique de Résilience
          </CardTitle>
          <CardDescription className="text-[10px]">Comparaison de vigueur végétale (NDVI) Saison 2025 vs 2024.</CardDescription>
        </div>
        <CloudRain className="w-5 h-5 text-blue-500 opacity-50" />
      </CardHeader>
      <CardContent className="h-[250px] pt-4">
        <ChartContainer config={{ 
          current: { label: "2025 (Actuel)", color: "hsl(var(--primary))" },
          last: { label: "2024 (Passé)", color: "hsl(var(--muted-foreground))" }
        }}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
            <XAxis dataKey="month" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis fontSize={10} tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="current" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCurrent)" strokeWidth={2} />
            <Area type="monotone" dataKey="last" stroke="hsl(var(--muted-foreground))" fillOpacity={0} strokeDasharray="5 5" strokeWidth={2} />
            <Legend verticalAlign="top" height={36}/>
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
