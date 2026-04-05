# Plan de transformation en startup — SaisonPlus AI

## 1. Positionnement produit

### Objectif principal
Construire une startup SaaS agricole pour la Côte d'Ivoire qui aide les acteurs des cultures vivrières à anticiper les pénuries, optimiser les semis/récoltes, et stabiliser les prix de marché.

### Valeur clé
- recommandation de culture basée sur données satellite et météo
- alertes de pénurie et de stress hydrique
- indicateurs de souveraineté alimentaire pour le riz, le maïs, le manioc, l'igname, la tomate, l'oignon
- suivi simple des prix de marché nationaux

## 2. MVP recommandé

### Fonctionnalités essentielles
1. **Analyse de parcelle et recommandation de culture**
   - Recommandation de culture adaptée
   - Date de semis / récolte optimale
   - Score de réussite et conseil agronomique
2. **Alertes proactives**
   - Risque de pénurie
   - Stress hydrique / météo extrême
   - Ravageurs / conditions défavorables
3. **Dashboard de souveraineté**
   - Statuts de sécurité alimentaire des cultures nationales
   - Tendances de production et de prix
4. **Prix de marché**
   - Intégration d'une source API si disponible
   - Affichage des prix d'Abidjan, Adjamé, Treichville
5. **Gestion utilisateur**
   - connexion Firebase
   - profils coopératives et producteurs

## 3. Priorités techniques

### A. Fiabilité des données
- vérifier le flux Google Earth Engine dans `src/lib/satellite-service.ts`
- continuer à utiliser `src/lib/weather-service.ts` pour la météo réelle
- ajouter un service de prix de marché si une API fiable existe
- consolider les données historiques avec `src/lib/seasonal-history-service.ts`

### B. Expérience utilisateur
- rendre l'interface simple, claire et mobile-friendly
- ajouter des traductions/français clair et locales
- proposer un mode hors ligne si possible
- améliorer l'onboarding et les explications

### C. Opérations et dev
- créer un pitch produit à partir du README et du blueprint
- ajouter un dossier `docs/startup-plan.md` (ce fichier) pour formaliser la stratégie
- ajouter un tableau de bord utilisateur clair et une page de contact

## 4. Business model

### Options de monétisation
- abonnement mensuel pour coopératives
- forfait premium « conseil agronomique spatial »
- service de monitoring des prix et d’alertes
- licence pour ONG / ministères / programmes agricoles

### Premier client cible
- coopératives ivoiriennes de riz et maïs
- grossistes d'Abidjan
- partenaires ONG/agriculture durable

## 5. Roadmap immediate

### Étape 1 — Prototype utilisable
- finaliser les pages `analyse`, `historique`, `marches`
- rendre les alertes dynamiques
- valider la recommandation de culture pour au moins 2 cultures

### Étape 2 — Validation terrain
- contacter 1 ou 2 coopératives
- proposer un test gratuit
- collecter leurs retours sur les recommandations et alertes

### Étape 3 — Pack commercial
- créer une page de présentation simple
- ajouter un formulaire de contact ou d'inscription
- préparer un pitch de 3 minutes

## 6. Checklist de lancement startup

- [ ] MVP fonctionnel
- [ ] données satellite/météo valides
- [ ] dashboard d'alertes et de recommandations
- [ ] segment client identifié
- [ ] démarche commerciale simple
- [ ] documentation produit claire
- [ ] démonstration terrain ou test utilisateur

---

SaisonPlus AI a déjà une base solide pour devenir une startup. Le travail maintenant est d’organiser les priorités, renforcer la fiabilité des données, et lancer un test réel avec des utilisateurs.
