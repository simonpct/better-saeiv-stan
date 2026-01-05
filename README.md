# 🚌 SAEIV Next-Gen - Système d'Aide à l'Exploitation et à l'Information Voyageurs

Simulateur temps réel du réseau de transport Stan (Nancy) avec visualisation cartographique interactive.

## 🎯 Projet

Application web de supervision et simulation du réseau de bus/tram avec :
- Carte interactive (MapLibre GL JS)
- Simulation temporelle (vitesse variable)
- Télémétrie des véhicules en temps réel
- Gestion des déviations et incidents
- LOD (Level of Detail) pour optimisation performance

## 📋 Documentation

- [SPECS.md](./SPECS.md) - Spécifications techniques complètes
- [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Roadmap d'implémentation
- [PHASE_1_COMPLETE.md](./PHASE_1_COMPLETE.md) - Rapport Phase 1
- [SYNOPTIC_ADDED.md](./SYNOPTIC_ADDED.md) - Documentation Synoptic

## 🚀 Démarrage Rapide

```bash
# Installation
npm install

# Dev server
npm run dev

# Build production
npm run build

# Accéder au PCC (Poste de Commande Centralisé)
http://localhost:3000/pcc
```

## 🏗️ Stack Technique

- **Framework** : Next.js 16 (App Router, React 19)
- **State Management** : Zustand (Slices pattern)
- **Cartographie** : MapLibre GL JS
- **Geo Processing** : Turf.js
- **Styling** : Tailwind CSS 4 (Dark Ops theme)
- **Language** : TypeScript (strict mode)

## 📊 Progression

**Phase actuelle** : Phase 1 ✅ Terminée (2026-01-05)
**Prochaine phase** : Phase 2 - Vertical Slice MVP

| Phase | Description | État |
|-------|-------------|------|
| Phase 1 | Foundation Setup | ✅ Terminée |
| Phase 2 | Vertical Slice MVP | ⏸️ À venir |
| Phase 3+ | Features atomiques | ⏸️ À venir |

## 🗂️ Structure du Projet

```
src/
├── app/              # Next.js App Router
│   ├── pcc/         # Page principale PCC
│   └── api/         # API Routes (GTFS, OSM)
├── components/       # Composants React
│   ├── map/         # MapLibre components
│   ├── panels/      # Inspector, Main Courante
│   ├── controls/    # TimeControls, etc.
│   └── ui/          # Composants UI génériques
├── store/           # Zustand stores
│   └── slices/      # Fleet, Temporal, Network, Log
├── types/           # Types TypeScript centralisés
├── hooks/           # React hooks custom
└── lib/             # Utilitaires
    ├── engine/      # Moteur de simulation
    └── utils/       # Helpers
```

## 🎨 Thème Dark Ops

Palette de couleurs configurée dans `src/app/globals.css` :

```css
--ops-bg: #0a0e1a       /* Fond principal */
--ops-panel: #12172a    /* Panneaux */
--ops-border: #1e2742   /* Bordures */
--ops-text: #e2e8f0     /* Texte */
--ops-accent: #3b82f6   /* Accent bleu */
--ops-warning: #f59e0b  /* Warning */
--ops-critical: #ef4444 /* Critical */
--ops-success: #10b981  /* Success */
```

## 📝 Commandes Utiles

```bash
# Dev avec hot reload
npm run dev

# Build production
npm run build

# Lancer build en production
npm start

# Linter
npm run lint

# Vérifier les types TypeScript
npx tsc --noEmit
```

## 🧪 Prochaines Étapes (Phase 2)

1. Implémenter MapLibre init
2. Ajouter bus statique de test
3. Connecter horloge virtuelle
4. Layout 4 zones fonctionnel
5. Test à 60 FPS

Voir [IMPLEMENTATION.md](./IMPLEMENTATION.md) pour le détail complet.

## 📄 Licence

Projet éducatif / portfolio
