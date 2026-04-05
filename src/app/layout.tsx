import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase';
import { GenieRural } from '@/components/ai/GenieRural';
import { OfflineStatus } from '@/components/pwa/OfflineStatus';
import { ThemeProvider } from 'next-themes';
import { ExpertTelemetry } from '@/components/dashboard/ExpertTelemetry';

export const viewport = {
  themeColor: '#007AFF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'SaisonPlus AI | Souveraineté Alimentaire Côte d\'Ivoire',
  description: 'Analyse spatiale et prédiction de récoltes pour stabiliser les prix alimentaires à Abidjan.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SaisonPlus AI',
  },
};

import { Header } from '@/components/navigation/Header';
import { QuickActionDock } from '@/components/navigation/QuickActionDock';
import { LanguageProvider } from '@/lib/language-context';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background text-foreground lg:pb-8">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <LanguageProvider>
            <FirebaseClientProvider>
              <Header />
              {children}
              <QuickActionDock />
              <Toaster />
              <OfflineStatus />
              <ExpertTelemetry />
            </FirebaseClientProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
