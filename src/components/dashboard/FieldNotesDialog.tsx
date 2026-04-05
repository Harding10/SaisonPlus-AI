'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Camera, MapPin, Send, StickyNote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function FieldNotesDialog({ parcelName }: { parcelName: string }) {
  const [note, setNote] = useState('');
  const [photoAdded, setPhotoAdded] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Repérage Enregistré",
      description: `Note synchronisée pour ${parcelName}.`,
    });
    setNote('');
    setPhotoAdded(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex items-center gap-1 text-[9px] font-black text-slate-500 hover:text-[#00d775] uppercase tracking-widest mt-2 transition-colors">
          <StickyNote className="w-3 h-3" /> Repérage
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-3xl border-border bg-card p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
            <MapPin className="text-[#00d775] w-5 h-5" /> {parcelName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <div className="bg-[#0c1812] rounded-xl p-4 flex items-center justify-between border border-white/5">
            <div>
              <p className="text-[10px] font-black text-[#8fa69a] uppercase tracking-widest">Coordonnées GPS</p>
              <p className="text-xs font-bold text-white tracking-widest">LAT: 5.3482 • LON: -4.0321</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Observation Terrain</label>
            <Textarea 
              placeholder="Ex: Apparition de chenilles légionnaires sur la zone Ouest..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none h-24 bg-muted/30 border-border rounded-xl font-medium focus:border-primary"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setPhotoAdded(!photoAdded)}
              className={`flex-1 h-12 rounded-xl text-xs font-bold transition-all border-dashed ${photoAdded ? 'bg-[#eaffed] text-[#00d775] border-[#00d775]/30' : 'bg-transparent text-slate-500 border-slate-200'}`}
            >
              <Camera className="w-4 h-4 mr-2" />
              {photoAdded ? "Photo Capturée" : "Prendre une Photo"}
            </Button>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full mt-4 h-12 bg-[#00d775] hover:bg-[#00c068] text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-[#00d775]/20">
          <Send className="w-4 h-4 mr-2" /> Enregistrer Rapport
        </Button>
      </DialogContent>
    </Dialog>
  );
}
