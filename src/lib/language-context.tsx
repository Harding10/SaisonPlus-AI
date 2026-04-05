'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'fr' | 'ba' | 'di'; // Français, Baoulé, Dioula

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  fr: {
    'dashboard.title': 'Tableau de Bord',
    'analysis.title': 'Analyse Satellite',
    'alerts.title': 'Alertes',
    'history.title': 'Historique',
    'settings.title': 'Paramètres',
    'market.title': 'Marchés',
    'sovereignty.title': 'Souveraineté Alimentaire',
    'crop.recommendation': 'Recommandation de Culture',
    'season.favorable': 'Saison Favorable',
    'shortage.risk': 'Risque de Pénurie',
    'yield.prediction': 'Prédiction de Rendement',
  },
  ba: {
    'dashboard.title': 'Tableau de Bord',
    'analysis.title': 'Analyse Satellite',
    'alerts.title': 'Alertes',
    'history.title': 'Historique',
    'settings.title': 'Paramètres',
    'market.title': 'Marchés',
    'sovereignty.title': 'Souveraineté Alimentaire',
    'crop.recommendation': 'Recommandation de Culture',
    'season.favorable': 'Saison Favorable',
    'shortage.risk': 'Risque de Pénurie',
    'yield.prediction': 'Prédiction de Rendement',
  },
  di: {
    'dashboard.title': 'Tableau de Bord',
    'analysis.title': 'Analyse Satellite',
    'alerts.title': 'Alertes',
    'history.title': 'Historique',
    'settings.title': 'Paramètres',
    'market.title': 'Marchés',
    'sovereignty.title': 'Souveraineté Alimentaire',
    'crop.recommendation': 'Recommandation de Culture',
    'season.favorable': 'Saison Favorable',
    'shortage.risk': 'Risque de Pénurie',
    'yield.prediction': 'Prédiction de Rendement',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.fr] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}