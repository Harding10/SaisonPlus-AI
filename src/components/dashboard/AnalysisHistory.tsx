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

export function AnalysisHistory({ records }: AnalysisHistoryProps) {
  if (!records || records.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-xl bg-slate-50 border-slate-200">
        <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
        <p className="text-sm text-slate-400 font-medium italic">Aucun scan historique disponible.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-1 gap-4">
      {records.map((record, index) => {
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
  );
}
