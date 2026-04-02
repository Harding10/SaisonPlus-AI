# **App Name**: SaisonPlus AI

## Core Features:

- Analyse Spatiale et Recommandation: Un outil simule la détection de micro-climats favorables (basé sur l'Indice NDVI et l'humidité) pour des zones spécifiques (ex: Korhogo ou Man), et prédit les cultures conseillées (tomate/oignon) et les dates de récolte optimales pour anticiper les pénuries à Abidjan.
- Enregistrement des Opportunités de Récolte: Stocke automatiquement les résultats de l'analyse spatiale dans une collection Firestore nommée 'opportunités_recoltes', incluant la zone, la culture conseillée, le score de réussite et la date de récolte prévue.
- Suivi des Prix du Marché: Enregistre les prix actuels des marchés d'Adjamé et Treichville dans une collection Firestore distincte pour une analyse comparative et de tendances.
- Dashboard Temps Réel des Opportunités: Une interface web simple et moderne, construite avec Next.js et Tailwind CSS, affiche en temps réel la liste des opportunités de récolte détectées et les données de prix du marché.

## Style Guidelines:

- Schéma clair pour une interface propre et apaisante. Couleur primaire: un vert nature (#2A954E) évoquant la croissance et la stabilité agricole.
- Couleur de fond: Un vert très clair et désaturé (#E6F5EB) pour maintenir une ambiance naturelle sans distraire.
- Couleur d'accent: Un vert plus vif et lumineux (#B8EB5A) pour les éléments interactifs et les indicateurs clés, offrant un contraste distinct.
- Police d'écriture pour les titres et le corps de texte: 'Inter' (sans-serif) pour une lisibilité excellente et un style moderne et objectif, adapté aux données et informations.
- Utilisez des icônes simples et modernes, de style 'line-art' ou 'flat', en accord avec le thème agricole (feuilles, cultures, marchés, cartes) pour illustrer les fonctionnalités et données.
- Disposition claire et basée sur une grille, mettant en avant la lecture facile des listes de données. Espacement généreux et hiérarchie visuelle définie pour une navigation intuitive.
- Animations subtiles et fluides pour les transitions entre les états du dashboard, le chargement des données, et les interactions, pour une expérience utilisateur raffinée et non intrusive.