'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MaterialIcon } from '@/components/ui/material-icon';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: 'Succès', description: 'Connexion Google réussie.' });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ title: 'Erreur', description: 'Échec de la connexion.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push('/dashboard');
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-[#fafafa] font-sans antialiased text-slate-900">
      
      {/* Branding Side - Hidden on small mobile */}
      <div className="hidden lg:flex flex-col justify-center px-12 xl:px-24 w-1/2 bg-white border-r border-slate-100 relative overflow-hidden">
        <div className="absolute top-12 left-12 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-slate-100 overflow-hidden shadow-sm">
                <img src="/icon.png" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-xl font-black tracking-tight uppercase">SaisonPlus</span>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="max-w-md space-y-6"
        >
            <h2 className="text-5xl font-black leading-[1.1] tracking-tight">
                L'avenir de l'agriculture <span className="text-[#00d775]">est entre vos mains.</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
                Rejoignez la première plateforme agronomique ivoirienne pilotée par satellite et intelligence artificielle.
            </p>
            <div className="flex gap-4 pt-4">
                <div className="flex flex-col gap-1 pr-6 border-r border-slate-200">
                    <span className="text-3xl font-black">98%</span>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Précision NDVI</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-3xl font-black">+25k</span>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Exploitants Actifs</span>
                </div>
            </div>
        </motion.div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
        
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white border border-slate-100 shadow-2xl p-8 md:p-12 rounded-[32px] relative z-10"
        >
            <div className="lg:hidden flex items-center gap-2 mb-8">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-100 overflow-hidden">
                    <img src="/icon.png" alt="Logo" className="w-6 h-6 object-contain" />
                </div>
                <span className="text-sm font-black uppercase tracking-tighter">SaisonPlus</span>
            </div>

            <h3 className="text-2xl font-black mb-4 uppercase tracking-tight text-slate-800">
                {isLogin ? 'Connexion' : 'Inscription'}
            </h3>
            <p className="text-sm text-slate-500 font-medium mb-8">
                {isLogin ? "Accédez à vos données parcelles en temps réel." : "Créez votre compte agronome dès aujourd'hui."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Email professionnel</Label>
                    <Input 
                        type="email" 
                        placeholder="nom@agronomie.ci" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-12 bg-slate-50 border-slate-200 rounded-xl focus:border-[#00d775] focus:ring-0 transition-all font-bold placeholder:text-slate-300"
                    />
                </div>
                <div className="space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Mot de passe</Label>
                        <button type="button" className="text-[10px] font-black text-[#00d775] uppercase hover:underline">Oublié ?</button>
                    </div>
                    <Input 
                        type="password" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 bg-slate-50 border-slate-200 rounded-xl focus:border-[#00d775] focus:ring-0 transition-all font-bold placeholder:text-slate-300"
                    />
                </div>

                <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-14 bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200"
                >
                    {loading ? <MaterialIcon name="sync" className="animate-spin" /> : (isLogin ? 'Accéder au Dashboard' : 'Confirmer Inscription')}
                </Button>
            </form>

            <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-black text-slate-300 tracking-[0.2em] bg-white px-4">
                    Alternative
                </div>
            </div>

            <Button 
                variant="outline" 
                onClick={handleGoogleLogin}
                className="w-full h-12 border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-xl gap-3 text-xs"
            >
                <img src="https://www.google.com/favicon.ico" className="w-4 h-4 opacity-70" alt="Google" />
                Se connecter avec Google
            </Button>

            <div className="mt-10 text-center">
                <button 
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-[11px] font-black text-[#00d775] uppercase tracking-widest border-b-2 border-[#00d775]/20 hover:border-[#00d775] transition-all pb-1"
                >
                    {isLogin ? "Nouveau sur la plateforme ? S'inscrire" : "Déjà un compte ? Se connecter"}
                </button>
            </div>
        </motion.div>
      </div>
    </div>
  );
}
