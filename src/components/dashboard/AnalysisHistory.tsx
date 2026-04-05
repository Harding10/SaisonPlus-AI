'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, TrendingUp, TrendingDown, Minus, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AnalysisRecord {
  id: string;
  zoneName: string;
  ndviIndexValue: number;
  humidityLevel: number;
  detectionTimestamp: string;
  recommendedCrop: string;
  successScore: number;
}

interface AnalysisHistoryProps {
  records: AnalysisRecord[];
}

import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AnalysisHistory({ records }: AnalysisHistoryProps) {
  const [filter, setFilter] = useState<string>('all');

  const filteredRecords = useMemo(() => {
    if (filter === 'all') return records;
    return records.filter(r => r.recommendedCrop === filter);
  }, [records, filter]);

  const uniqueCrops = useMemo(() => {
    const crops = new Set(records.map(r => r.recommendedCrop));
    return Array.from(crops);
  }, [records]);

  if (!records || records.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-xl bg-slate-50 border-slate-200">
        <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
        <p className="text-sm text-slate-400 font-medium italic">Aucun scan historique disponible.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barre de filtrage */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <History className="w-4 h-4" />
              </div>
              <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">Historique des Scans</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{records.length} analyses archivées</p>
              </div>
          </div>

          <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full md:w-48 h-10 rounded-xl border-slate-200 bg-white font-black text-[10px] uppercase tracking-widest">
                  <SelectValue placeholder="Filtrer par culture" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-2xl border-slate-100">
                  <SelectItem value="all" className="text-[10px] font-black uppercase">Toutes les cultures</SelectItem>
                  {uniqueCrops.map(c => (
                      <SelectItem key={c} value={c} className="text-[10px] font-bold uppercase">{c}</SelectItem>
                  ))}
              </SelectContent>
          </Select>
      </div>

      {filteredRecords.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-[32px] bg-slate-50 border-slate-200">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aucun scan pour cette culture.</p>
          </div>
      ) : (
          <div className="grid md:grid-cols-1 gap-4">
            {filteredRecords.map((record, index) => {
        const date = new Date(record.detectionTimestamp);
        const prevRecord = records[index + 1];
        const ndviDiff = prevRecord ? record.ndviIndexValue - prevRecord.ndviIndexValue : 0;
        
        return (
          <Card key={record.id} className="border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-black uppercase text-slate-800">{record.zoneName}</span>
                    <Badge variant="outline" className="text-[9px] font-bold uppercase py-0 px-1 border-slate-200">
                      {record.recommendedCrop}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {format(date, 'PPP à HH:mm', { locale: fr })}
                  </p>
                </div>
              </div>

              <div className="flex gap-8 border-l border-slate-100 pl-6 h-full items-center">
                <div className="text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">NDVI</p>
                  <div className="flex items-center gap-1 justify-center">
                    <span className="text-sm font-black text-primary">{record.ndviIndexValue.toFixed(3)}</span>
                    {ndviDiff > 0.02 ? (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : ndviDiff < -0.02 ? (
                      <TrendingDown className="w-3 h-3 text-amber-500" />
                    ) : (
                      <Minus className="w-3 h-3 text-slate-300" />
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Score</p>
                  <span className="text-sm font-black text-slate-700">{record.successScore}%</span>
                </div>
                <div className="h-8 w-px bg-slate-100 mx-2" />
                <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[8px] font-black h-6">
                  VÉRIFIÉ
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
    )}
    </div>
  );
}
