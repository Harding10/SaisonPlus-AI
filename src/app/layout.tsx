import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { GenieRural } from '@/components/ai/GenieRural';
import { OfflineStatus } from '@/components/pwa/OfflineStatus';

export const metadata: Metadata = {
  title: 'SaisonPlus AI | Stabilisation Alimentaire Côte d\'Ivoire',
  description: 'Analyse spatiale et prédiction de récoltes pour stabiliser les prix alimentaires à Abidjan.',
  manifest: '/manifest.json',
};

export const viewport = {
  themeColor: '#22c55e',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-slate-900">
        <FirebaseClientProvider>
          {children}
          <Toaster />
          <GenieRural />
          <OfflineStatus />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
