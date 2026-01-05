# 🚀 IMPLEMENTATION ROADMAP - SAEIV Next-Gen

**Dernière mise à jour** : 2026-01-05
**Phase actuelle** : Phase 3.2 - Terminée ✅
**Progression globale** : 45%

---

## 📋 TABLE DES MATIÈRES

1. [État Global](#état-global)
2. [Phase 1 : Foundation Setup](#phase-1--foundation-setup)
3. [Phase 2 : Vertical Slice MVP](#phase-2--vertical-slice-mvp)
4. [Phases 3-N : Features Atomiques](#phases-3-n--features-atomiques)
5. [Décisions Techniques](#décisions-techniques)
6. [Notes d'Implémentation](#notes-dimplémentation)
7. [Bugs & Issues](#bugs--issues)

---

## 🎯 ÉTAT GLOBAL

### Stack Confirmée
- ✅ **Framework** : Next.js 16 (App Router)
- ✅ **State** : Zustand (Slices pattern)
- ✅ **Map** : MapLibre GL JS
- ✅ **Geo** : Turf.js
- ✅ **UI** : Tailwind CSS
- ✅ **Deploy** : Vercel

### Architecture
- **Type** : Hybrid Client-Server
- **Backend** : API Routes Next.js (cache uniquement)
- **Données** : GTFS Stan Nancy + OSM via Overpass
- **LOD** : Obligatoire (3 niveaux)
- **Scope MVP** : 1 ligne, 3-5 bus standards, desktop only

### Conventions de Code
```typescript
// Ordre des imports
1. React/Next
2. Libraries externes (zustand, maplibre, turf)
3. Types locaux
4. Stores
5. Components
6. Utils

// Nommage
- Types/Interfaces : PascalCase (Bus, GeoPoint)
- Composants : PascalCase (MapCanvas.tsx)
- Fichiers utils : camelCase (formatTime.ts)
- Stores : camelCase avec Slice suffix (fleetSlice.ts)
- Constantes : UPPER_SNAKE_CASE
```

---

## 📦 PHASE 1 : FOUNDATION SETUP

**Objectif** : Créer toute la structure du projet avec types complets et squelettes.
**État** : ✅ TERMINÉE
**Tokens utilisés** : ~18k
**Date de completion** : 2026-01-05

### 1.1 Initialisation Next.js ⏸️

**Commandes** :
```bash
cd /Users/simon/DEV/better-saeiv-stan
npx create-next-app@latest . --typescript --app --tailwind --no-src
```

**Config** :
- ✅ TypeScript strict mode
- ✅ App Router
- ✅ Tailwind CSS
- ❌ ESLint (désactivé pour perf)
- ❌ Turbopack (pas stable Next.js 16)

**Fichiers à vérifier** :
- [ ] `package.json` existe
- [ ] `tsconfig.json` avec strict: true
- [ ] `tailwind.config.ts` existe
- [ ] `next.config.ts` créé

---

### 1.2 Installation des Dépendances ⏸️

**Package.json additions** :
```json
{
  "dependencies": {
    "zustand": "^5.0.2",
    "maplibre-gl": "^4.7.1",
    "@turf/turf": "^7.1.0",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "@types/maplibre-gl": "^3.1.0"
  }
}
```

**Commande** :
```bash
npm install zustand maplibre-gl @turf/turf date-fns
npm install -D @types/maplibre-gl
```

**Vérification** :
- [ ] `npm run dev` démarre sans erreur
- [ ] Aucune erreur TypeScript

---

### 1.3 Structure de Dossiers ⏸️

**À créer** :
```
src/
├── app/
│   ├── api/
│   │   ├── gtfs/
│   │   │   └── nancy/
│   │   │       └── route.ts           [⏸️ À créer]
│   │   ├── osm/
│   │   │   └── overpass/
│   │   │       └── route.ts           [⏸️ À créer]
│   │   └── routing/
│   │       └── dijkstra/
│   │           └── route.ts           [⏸️ À créer]
│   └── pcc/
│       ├── page.tsx                   [⏸️ À créer]
│       └── layout.tsx                 [⏸️ À créer]
├── components/
│   ├── ui/
│   │   ├── Button.tsx                 [⏸️ À créer]
│   │   └── Card.tsx                   [⏸️ À créer]
│   ├── map/
│   │   ├── MapCanvas.tsx              [⏸️ À créer]
│   │   └── BusMarker.tsx              [⏸️ À créer]
│   ├── panels/
│   │   ├── Inspector.tsx              [✅ Créé - Phase 1]
│   │   ├── MainCourante.tsx           [✅ Créé - Phase 1]
│   │   └── Synoptic.tsx               [✅ Créé - Phase 1 (squelette)]
│   └── controls/
│       └── TimeControls.tsx           [⏸️ À créer]
├── hooks/
│   └── useSimulation.ts               [⏸️ À créer]
├── lib/
│   ├── engine/
│   │   ├── movement.ts                [⏸️ À créer]
│   │   └── telemetry.ts               [⏸️ À créer]
│   └── utils/
│       ├── geo.ts                     [⏸️ À créer]
│       └── time.ts                    [⏸️ À créer]
├── store/
│   ├── index.ts                       [⏸️ À créer - Store racine]
│   └── slices/
│       ├── temporalSlice.ts           [⏸️ À créer]
│       ├── fleetSlice.ts              [⏸️ À créer]
│       ├── networkSlice.ts            [⏸️ À créer]
│       └── logSlice.ts                [⏸️ À créer]
└── types/
    └── index.ts                       [⏸️ À créer - PRIORITÉ MAX]
```

**Commande de création** :
```bash
mkdir -p src/{app/api/{gtfs/nancy,osm/overpass,routing/dijkstra},app/pcc,components/{ui,map,panels,controls},hooks,lib/{engine,utils},store/slices,types}
```

---

### 1.4 Types TypeScript Complets ⏸️

**Fichier** : `src/types/index.ts`
**État** : ⏸️ Pas créé
**Importance** : 🔴 **CRITIQUE** - Référence pour tout le reste

**Contenu à créer** :
```typescript
/**
 * TYPES CENTRAUX DU SAEIV
 *
 * Ce fichier définit TOUS les types utilisés dans l'application.
 * Il sert de référence unique et doit être lu au début de chaque
 * implémentation de feature.
 *
 * Voir specs.md section 2 pour détails complets.
 */

// ============================================================================
// GEO & SPATIAL
// ============================================================================

/**
 * Coordonnées géographiques [longitude, latitude]
 * ATTENTION : GeoJSON utilise [lon, lat], pas [lat, lon]
 */
export type GeoPoint = [number, number];

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Nancy bbox - À utiliser partout
export const NANCY_BBOX: BoundingBox = {
  north: 48.72,
  south: 48.65,
  east: 6.25,
  west: 6.1,
};

// ============================================================================
// VÉHICULES
// ============================================================================

export type BusType = 'STANDARD' | 'ARTICULATED' | 'BI_ARTICULATED';
export type VehicleStatus = 'IDLE' | 'IN_SERVICE' | 'HLP' | 'EMERGENCY' | 'OFF_LINE';
export type EnergyType = 'ELECTRIC' | 'CNG';

/**
 * Segment d'un bus (tracteur ou remorque)
 * Un bus STANDARD a 1 segment, ARTICULATED 2, BI_ARTICULATED 3
 */
export interface BusSegment {
  id: string; // 'tracteur' | 'remorque_1' | 'remorque_2'
  length: number; // mètres
  width: number; // mètres
  currentHeading: number; // degrés (0 = Nord)
  currentPosition: GeoPoint; // [lon, lat]
}

/**
 * Télémétrie en temps réel d'un bus
 */
export interface BusTelemetry {
  energyLevel: number; // 0-100%
  energyType: EnergyType;
  doors: boolean[]; // [porte1, porte2, porte3, porte4]
  engineTemp: number; // Celsius
  alerts: {
    abs: boolean;
    overheat: boolean;
  };
  odometer: number; // km total parcouru
}

/**
 * Bus complet (peut être standard, articulé ou bi-articulé)
 */
export interface Bus {
  id: string;
  type: BusType;
  status: VehicleStatus;
  segments: BusSegment[]; // 1 pour STANDARD, 2 pour ARTICULATED, 3 pour BI_ARTICULATED
  telemetry: BusTelemetry;
  assignedRouteId?: string; // ID de la ligne GTFS
  assignedTripId?: string; // ID du trip GTFS en cours
  currentStopIndex?: number; // Index dans le trip
  parkingSpaceId?: string; // ID OSM de la place de parking (si IDLE)
  speed: number; // km/h
}

// ============================================================================
// GTFS & RÉSEAU
// ============================================================================

/**
 * Arrêt de bus (depuis GTFS stops.txt)
 */
export interface Stop {
  id: string; // stop_id du GTFS
  name: string;
  position: GeoPoint;
  code?: string; // Code physique affiché à l'arrêt
}

/**
 * Horaire à un arrêt (depuis GTFS stop_times.txt)
 */
export interface StopTime {
  stopId: string;
  arrivalTime: string; // "HH:MM:SS" (peut dépasser 24h!)
  departureTime: string;
  stopSequence: number;
}

/**
 * Trip GTFS (un service/départ)
 */
export interface Trip {
  id: string; // trip_id du GTFS
  routeId: string; // Lien vers la ligne
  serviceId: string; // Calendrier (weekday, weekend, etc.)
  stopTimes: StopTime[];
  shapeId?: string;
}

/**
 * Route/Ligne GTFS
 */
export interface Route {
  id: string; // route_id
  shortName: string; // "T1", "T2", etc.
  longName: string; // "Tram Ligne 1 : ..."
  type: number; // 0=tram, 3=bus, etc.
  color: string; // Hex color "#FF6600"
  textColor: string; // "#FFFFFF"
}

/**
 * Géométrie d'une route (tracé sur la carte)
 */
export interface RouteGeometry {
  routeId: string;
  path: GeoPoint[]; // LineString coordinates
  stops: string[]; // IDs des stops dans l'ordre
}

/**
 * Déviation de tracé (modification temporaire)
 */
export interface Deviation {
  id: string;
  routeId: string;
  startStopId: string;
  endStopId: string;
  alternativePath: GeoPoint[];
  active: boolean;
  createdAt: Date;
}

// ============================================================================
// TEMPORAL / TEMPS
// ============================================================================

export type TimeScale = 1 | 10 | 30 | 60; // Multiplicateur de vitesse

export interface VirtualTime {
  current: Date; // Heure virtuelle actuelle
  scale: TimeScale; // Vitesse de simulation
  isPaused: boolean;
}

// ============================================================================
// LOGS / MAIN COURANTE
// ============================================================================

export type LogSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type LogSource = 'VEHICLE' | 'SYSTEM' | 'REGULATION';

export interface LogEntry {
  id: string;
  virtualTimestamp: Date; // Heure virtuelle de l'event
  severity: LogSeverity;
  source: LogSource;
  message: string;
  entityId?: string; // ID du bus/arrêt concerné
}

// ============================================================================
// PERFORMANCE & LOD
// ============================================================================

export type LODLevel = 'full' | 'simplified' | 'minimal';

export interface PerformanceMetrics {
  fps: number;
  tickDuration: number; // ms par tick
  activeVehicles: number;
  lodLevel: LODLevel;
}

// ============================================================================
// API RESPONSES
// ============================================================================

/**
 * Réponse de l'API /api/gtfs/nancy/routes
 */
export interface GTFSRoutesResponse {
  routes: Route[];
  totalCount: number;
}

/**
 * Réponse de l'API /api/gtfs/nancy/route/[id]
 */
export interface GTFSRouteDetailResponse {
  route: Route;
  geometry: RouteGeometry;
  stops: Stop[];
  trips: Trip[];
}

/**
 * Réponse de l'API /api/routing/dijkstra
 */
export interface RoutingResponse {
  path: GeoPoint[];
  distance: number; // mètres
  duration: number; // secondes
  warnings: string[];
}

// ============================================================================
// UI STATES
// ============================================================================

export interface MapViewState {
  center: GeoPoint;
  zoom: number;
  bearing: number;
  pitch: number;
}

export type PanelView = 'bus' | 'stop' | 'depot' | null;

// ============================================================================
// CONSTANTES
// ============================================================================

export const DEFAULT_BUS_SPEED = 30; // km/h
export const TICK_RATE = 30; // Hz (30 FPS pour la physique)
export const TARGET_FPS = 60;
export const MAX_VEHICLES = 20;
export const MAX_BI_ARTICULATED = 5;

export const LOD_ZOOM_THRESHOLDS = {
  FULL: 16,
  SIMPLIFIED: 14,
  MINIMAL: 10,
} as const;
```

**Vérifications après création** :
- [ ] Aucune erreur TypeScript dans le fichier
- [ ] Tous les types du spec sont présents
- [ ] Commentaires JSDoc présents
- [ ] Constantes NANCY_BBOX et seuils LOD définis

---

### 1.5 Stores Zustand (Squelettes) ⏸️

**Approche** : Créer les interfaces complètes, implémentations minimales.

#### 1.5.1 Store Racine (`src/store/index.ts`) ⏸️

```typescript
/**
 * STORE RACINE ZUSTAND
 *
 * Combine tous les slices dans un seul store global.
 * Pattern: https://docs.pmnd.rs/zustand/guides/typescript#slices-pattern
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createTemporalSlice, TemporalSlice } from './slices/temporalSlice';
import { createFleetSlice, FleetSlice } from './slices/fleetSlice';
import { createNetworkSlice, NetworkSlice } from './slices/networkSlice';
import { createLogSlice, LogSlice } from './slices/logSlice';

export type PCCStore = TemporalSlice & FleetSlice & NetworkSlice & LogSlice;

export const usePCCStore = create<PCCStore>()(
  devtools(
    (...a) => ({
      ...createTemporalSlice(...a),
      ...createFleetSlice(...a),
      ...createNetworkSlice(...a),
      ...createLogSlice(...a),
    }),
    { name: 'PCC Store' }
  )
);
```

**État** : ⏸️ À créer

---

#### 1.5.2 TemporalSlice ⏸️

**Fichier** : `src/store/slices/temporalSlice.ts`

```typescript
import { StateCreator } from 'zustand';
import { PCCStore } from '../index';
import { VirtualTime, TimeScale } from '@/types';

export interface TemporalSlice {
  // State
  virtualTime: Date;
  timeScale: TimeScale;
  isPaused: boolean;

  // Actions
  tick: (deltaTime: number) => void;
  setSpeed: (speed: TimeScale) => void;
  togglePause: () => void;
  seekTime: (target: Date) => void;
}

export const createTemporalSlice: StateCreator<
  PCCStore,
  [],
  [],
  TemporalSlice
> = (set, get) => ({
  // État initial
  virtualTime: new Date('2026-01-05T08:00:00'), // Lundi 8h
  timeScale: 1,
  isPaused: true,

  // TODO Phase 2: Implémenter la logique temporelle
  // Voir specs.md section "TemporalStore"
  tick: (deltaTime: number) => {
    // À implémenter
  },

  setSpeed: (speed: TimeScale) => {
    set({ timeScale: speed });
  },

  togglePause: () => {
    set((state) => ({ isPaused: !state.isPaused }));
  },

  seekTime: (target: Date) => {
    set({ virtualTime: target });
  },
});
```

**État** : ⏸️ À créer
**Dépendances** : types/index.ts

---

#### 1.5.3 FleetSlice ⏸️

**Fichier** : `src/store/slices/fleetSlice.ts`

```typescript
import { StateCreator } from 'zustand';
import { PCCStore } from '../index';
import { Bus, VehicleStatus, LODLevel } from '@/types';

export interface FleetSlice {
  // State
  vehicles: Record<string, Bus>;
  selectedEntityId: string | null;
  lodLevel: LODLevel;

  // Actions
  updateVehiclesLogic: () => void;
  setVehicleStatus: (id: string, status: VehicleStatus) => void;
  toggleDoors: (id: string, doorIndex: number) => void;
  selectEntity: (id: string | null) => void;
  updateLOD: (zoom: number) => void;
}

export const createFleetSlice: StateCreator<
  PCCStore,
  [],
  [],
  FleetSlice
> = (set, get) => ({
  vehicles: {},
  selectedEntityId: null,
  lodLevel: 'full',

  // TODO Phase 2: Implémenter mouvement des bus
  // Algo: Utiliser turf.along() pour suivre le tracé GTFS
  // Vitesse: DEFAULT_BUS_SPEED modulée par trafic
  updateVehiclesLogic: () => {
    // À implémenter
  },

  setVehicleStatus: (id, status) => {
    set((state) => ({
      vehicles: {
        ...state.vehicles,
        [id]: { ...state.vehicles[id], status },
      },
    }));
  },

  toggleDoors: (id, doorIndex) => {
    // À implémenter
  },

  selectEntity: (id) => {
    set({ selectedEntityId: id });
  },

  updateLOD: (zoom) => {
    const level: LODLevel =
      zoom >= 16 ? 'full' : zoom >= 14 ? 'simplified' : 'minimal';
    set({ lodLevel: level });
  },
});
```

**État** : ⏸️ À créer

---

#### 1.5.4 NetworkSlice ⏸️

**Fichier** : `src/store/slices/networkSlice.ts`

```typescript
import { StateCreator } from 'zustand';
import { PCCStore } from '../index';
import { Route, RouteGeometry, Stop, Deviation } from '@/types';

export interface NetworkSlice {
  // State
  routes: Record<string, RouteGeometry>;
  stops: Record<string, Stop>;
  activeDeviations: Deviation[];
  selectedRouteId: string | null;

  // Actions
  loadRoute: (routeId: string) => Promise<void>;
  addDeviation: (routeId: string, deviation: Deviation) => void;
  selectRoute: (routeId: string | null) => void;
}

export const createNetworkSlice: StateCreator<
  PCCStore,
  [],
  [],
  NetworkSlice
> = (set, get) => ({
  routes: {},
  stops: {},
  activeDeviations: [],
  selectedRouteId: null,

  // TODO Phase 3: Implémenter chargement depuis API
  loadRoute: async (routeId) => {
    // Fetch depuis /api/gtfs/nancy/route/[id]
  },

  addDeviation: (routeId, deviation) => {
    set((state) => ({
      activeDeviations: [...state.activeDeviations, deviation],
    }));
  },

  selectRoute: (routeId) => {
    set({ selectedRouteId: routeId });
  },
});
```

**État** : ⏸️ À créer

---

#### 1.5.5 LogSlice ⏸️

**Fichier** : `src/store/slices/logSlice.ts`

```typescript
import { StateCreator } from 'zustand';
import { PCCStore } from '../index';
import { LogEntry, LogSeverity, LogSource } from '@/types';

export interface LogSlice {
  // State
  logs: LogEntry[];

  // Actions
  addLog: (entry: Omit<LogEntry, 'id' | 'virtualTimestamp'>) => void;
  clearLogs: () => void;
}

export const createLogSlice: StateCreator<
  PCCStore,
  [],
  [],
  LogSlice
> = (set, get) => ({
  logs: [],

  addLog: (entry) => {
    const virtualTime = get().virtualTime;
    const newLog: LogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random()}`,
      virtualTimestamp: virtualTime,
    };

    set((state) => ({
      logs: [...state.logs, newLog],
    }));
  },

  clearLogs: () => {
    set({ logs: [] });
  },
});
```

**État** : ⏸️ À créer

---

### 1.6 Composants React (Squelettes) ⏸️

Tous les composants sont créés avec structure minimale + TODOs.

#### MapCanvas.tsx ⏸️
```typescript
'use client';

/**
 * COMPOSANT MAPLIBRE PRINCIPAL
 *
 * Responsabilités:
 * - Init MapLibre avec style
 * - Afficher les bus (layers)
 * - Gérer le LOD selon zoom
 * - Interactions (clic, drag)
 *
 * TODO Phase 2: Implémenter MapLibre init
 * TODO Phase 3: Ajouter layers bus (LOD)
 */

export default function MapCanvas() {
  return (
    <div className="w-full h-full bg-slate-900">
      {/* TODO: MapLibre container */}
      <div id="map" className="w-full h-full"></div>
    </div>
  );
}
```

**État** : ⏸️ À créer
**Fichier** : `src/components/map/MapCanvas.tsx`

---

### 1.7 Tailwind Config ⏸️

Ajouter thème "Dark Ops" dans `tailwind.config.ts` :

```typescript
export default {
  theme: {
    extend: {
      colors: {
        // Dark Ops palette
        ops: {
          bg: '#0a0e1a',
          panel: '#12172a',
          border: '#1e2742',
          text: '#e2e8f0',
          accent: '#3b82f6',
          warning: '#f59e0b',
          critical: '#ef4444',
          success: '#10b981',
        },
      },
    },
  },
};
```

---

## ✅ CHECKLIST PHASE 1

Avant de passer à Phase 2, vérifier :

- [x] `npm run dev` démarre sans erreur
- [x] Aucune erreur TypeScript dans tout le projet
- [x] Fichier `types/index.ts` complet et documenté (269 lignes)
- [x] Les 4 slices Zustand compilent
- [x] Store racine créé et exporté
- [x] Structure de dossiers complète (17 fichiers créés)
- [x] Tailwind config avec thème Dark Ops
- [x] Tous les fichiers ont des TODOs pour Phase 2

**Commande de validation** :
```bash
npm run build
```

✅ **Build réussi** - Phase 1 terminée !

Voir [PHASE_1_COMPLETE.md](./PHASE_1_COMPLETE.md) pour le rapport détaillé.

---

## 🎨 PHASE 2 : VERTICAL SLICE MVP

**État** : ✅ TERMINÉE
**Prérequis** : Phase 1 complète
**Tokens utilisés** : ~22k
**Date de completion** : 2026-01-05

### Objectif
Avoir une démo fonctionnelle end-to-end :
- ✅ Carte MapLibre affichée
- ✅ 1 bus statique positionné sur Nancy
- ✅ Horloge virtuelle qui tourne
- ✅ Inspector affiche le bus sélectionné
- ✅ TimeControls (pause/play/speed)

### 2.1 MapLibre Init ⏸️

**Fichier** : `src/components/map/MapCanvas.tsx`

**À implémenter** :
```typescript
useEffect(() => {
  const map = new maplibregl.Map({
    container: 'map',
    style: 'https://demotiles.maplibre.org/style.json', // Temp
    center: [6.18, 48.68], // Nancy
    zoom: 13,
  });

  // Cleanup
  return () => map.remove();
}, []);
```

**TODOs** :
- [ ] Installer maplibre-gl CSS
- [ ] Créer le map instance
- [ ] Centrer sur Nancy
- [ ] Ajouter controls (zoom, etc.)

---

### 2.2 Bus Statique ⏸️

**Fichier** : `src/store/slices/fleetSlice.ts`

Ajouter un bus de test dans l'état initial :

```typescript
vehicles: {
  'bus-001': {
    id: 'bus-001',
    type: 'STANDARD',
    status: 'IN_SERVICE',
    segments: [
      {
        id: 'tracteur',
        length: 12,
        width: 2.5,
        currentHeading: 45,
        currentPosition: [6.18, 48.68], // Place Stanislas
      },
    ],
    telemetry: {
      energyLevel: 85,
      energyType: 'ELECTRIC',
      doors: [false, false, false, false],
      engineTemp: 75,
      alerts: { abs: false, overheat: false },
      odometer: 12450,
    },
    speed: 0,
  },
},
```

**Affichage sur la carte** :
```typescript
// Dans MapCanvas.tsx
map.addSource('fleet', {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: Object.values(vehicles).map(bus => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: bus.segments[0].currentPosition,
      },
      properties: { id: bus.id },
    })),
  },
});

map.addLayer({
  id: 'buses',
  type: 'circle',
  source: 'fleet',
  paint: {
    'circle-radius': 8,
    'circle-color': '#3b82f6',
  },
});
```

---

### 2.3 Horloge Temps Réel ⏸️

**Fichier** : `src/hooks/useSimulation.ts`

```typescript
export function useSimulation() {
  const { virtualTime, timeScale, isPaused, tick } = usePCCStore();

  useEffect(() => {
    if (isPaused) return;

    let lastTime = performance.now();
    let animationId: number;

    const loop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000; // secondes
      lastTime = currentTime;

      tick(deltaTime * timeScale);

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationId);
  }, [isPaused, timeScale]);
}
```

Implémenter `tick()` dans temporalSlice :
```typescript
tick: (deltaTime) => {
  set((state) => ({
    virtualTime: new Date(state.virtualTime.getTime() + deltaTime * 1000),
  }));
},
```

---

### 2.4 UI Layout PCC ⏸️

**Fichier** : `src/app/pcc/page.tsx`

Layout 4 zones :
```tsx
export default function PCCPage() {
  return (
    <div className="h-screen flex flex-col bg-ops-bg text-ops-text">
      {/* Header */}
      <header className="h-16 bg-ops-panel border-b border-ops-border px-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">SAEIV - Supervision Transport</h1>
        <TimeControls />
      </header>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Inspector (gauche) */}
        <aside className="w-80 bg-ops-panel border-r border-ops-border">
          <Inspector />
        </aside>

        {/* Map (centre) */}
        <main className="flex-1">
          <MapCanvas />
        </main>

        {/* Main Courante (droite) */}
        <aside className="w-96 bg-ops-panel border-l border-ops-border">
          <MainCourante />
        </aside>
      </div>
    </div>
  );
}
```

---

## ✅ CHECKLIST PHASE 2

- [x] Carte MapLibre visible et centrée sur Nancy
- [x] 1 bus visible sur la carte (cercle bleu)
- [x] Bus cliquable pour sélection
- [x] Horloge virtuelle affichée et qui tourne
- [x] Boutons pause/play fonctionnels
- [x] Sélecteur de vitesse (×1, ×10, ×30, ×60)
- [x] Sélection du bus change l'Inspector
- [x] Inspector affiche toute la télémétrie
- [x] Layout 5 zones responsive (avec synoptic)
- [x] 60 FPS constant ✅
- [x] Build production réussi

✅ **Phase 2 terminée !**

Voir [PHASE_2_COMPLETE.md](./PHASE_2_COMPLETE.md) pour le rapport détaillé.

---

## 🚧 PHASES 3-N : FEATURES ATOMIQUES

Chaque feature = 1 conversation courte (~5-10k tokens).

### Phase 3.1 : Mouvement des Bus ⏸️
**Fichiers** : `fleetSlice.ts`, `lib/engine/movement.ts`
**Objectif** : Bus se déplacent le long du tracé GTFS

### Phase 3.2 : API OSM Overpass ✅
**État** : ✅ TERMINÉE
**Date** : 2026-01-05
**Fichiers** : [app/api/osm/overpass/route.ts](src/app/api/osm/overpass/route.ts) (340 lignes)
**Rapport** : [PHASE_3.2_COMPLETE.md](PHASE_3.2_COMPLETE.md)

**Fonctionnalités livrées** :
- ✅ Endpoint `/api/osm/overpass?routeId=T1&direction=aller`
- ✅ Requête Overpass optimisée (instance Kumi Systems)
- ✅ Parser OSM → GeoJSON LineString (600+ points par ligne)
- ✅ Extraction automatique des arrêts (25 arrêts T1 aller)
- ✅ Cache en mémoire (15 min TTL)
- ✅ Gestion complète des erreurs (timeout 60s, validation params)
- ✅ Testé avec données réelles (T1 aller/retour)

**Performance** :
- Première requête : 8-10s
- Requêtes cachées : <100ms
- 633 points géographiques (T1 aller, 13.93 km)
- 619 points géographiques (T1 retour, 22.46 km)

### Phase 3.3 : LOD System ⏸️
**Fichiers** : `MapCanvas.tsx`, `fleetSlice.ts`
**Objectif** : 3 layers bus selon zoom

### Phase 3.4 : Télémétrie Dynamique ⏸️
**Fichiers** : `lib/engine/telemetry.ts`, `Inspector.tsx`
**Objectif** : Simulation alertes, affichage jauges

### Phase 3.5 : Main Courante ⏸️
**Fichiers** : `MainCourante.tsx`, `logSlice.ts`
**Objectif** : Liste scrollable des logs avec filtres

### Phase 3.6 : Synoptic - Vue Linéaire ⏸️
**Fichiers** : `Synoptic.tsx`, `networkSlice.ts`
**Objectif** : Implémenter la vue linéaire de la ligne
**Fonctionnalités** :
- Se déplie automatiquement lors de la sélection d'une ligne
- Affiche les arrêts de manière linéaire (timeline horizontale)
- Positionne les bus sur leur segment actuel
- Calcule l'espacement entre véhicules
- Affiche les retards/avances par rapport à l'horaire théorique
**Détails techniques** :
- Connecter au `selectedRouteId` du NetworkStore
- Calculer la position relative de chaque bus sur la ligne (0-100%)
- Utiliser turf.lineSliceAlong() pour obtenir la distance parcourue
- Animation smooth lors du déplacement des bus
**Importance** : Essentiel pour la régulation du cadencement

### Phase 3.7 : Régulation & Commandes ⏸️
**Fichiers** : `fleetSlice.ts`, `Inspector.tsx`
**Objectif** : Ajouter les actions de régulation
**Fonctionnalités** :
- Retard commandé (attente forcée à un arrêt)
- Avance commandée (saut d'arrêt)
- HLP (Hors Ligne Programmé)
- Changement de terminus
**Prérequis** : Phase 3.6 (Synoptic) pour visualiser l'impact

### Phase 3.8 : Gestion du Dépôt ⏸️
**Fichiers** : `fleetSlice.ts`, `components/panels/Depot.tsx`
**Objectif** : Gérer les véhicules au dépôt
**Fonctionnalités** :
- Définir zones de parking OSM (polygones)
- Affectation bus ↔ places de stationnement
- État IDLE avec position au dépôt
- Interface de déploiement/retrait de bus en service
- Visualisation du dépôt sur la carte
**Technique** : Utiliser Overpass pour récupérer les zones `amenity=parking` + `operator=Stan`

### Phase 3.9 : Physique Multi-Segments ⏸️
**Fichiers** : `lib/engine/movement.ts`, `MapCanvas.tsx`
**Objectif** : Rendu réaliste des bus articulés
**Fonctionnalités** :
- Calcul positions de tous les segments (tracteur + remorques)
- Angles d'articulation réalistes (contraintes physiques)
- Rendu visuel avec liaisons articulées
- Animation fluide des articulations
**Technique** : Géométrie inverse pour calculer positions des remorques à partir du tracteur

### Phase 3.10 : Calcul de Cadencement ⏸️
**Fichiers** : `lib/engine/headway.ts`, `components/panels/HeadwayMonitor.tsx`
**Objectif** : Analyser et optimiser le cadencement
**Fonctionnalités** :
- Calcul de l'intervalle moyen entre bus
- Détection d'irrégularités (bunching = regroupement)
- Calcul de la variance du cadencement
- Suggestions de régulation automatiques
- Graphique temps réel du cadencement
**Importance** : Métrique clé de qualité de service

### Phase 3.11 : Détection de Conflits ⏸️
**Fichiers** : `lib/engine/conflicts.ts`, `logSlice.ts`
**Objectif** : Détecter les situations problématiques
**Fonctionnalités** :
- Distance inter-véhicules en temps réel
- Alertes si 2 bus trop proches (< 200m)
- Détection de dépassements (bus arrive avant celui de devant)
- Visualisation zone critique sur Synoptic
- Logs automatiques des conflits
**Technique** : Calcul de distance curviligne le long du tracé

### Phase 3.12 : Interface Création de Déviations ⏸️
**Fichiers** : `components/controls/DeviationTool.tsx`, `MapCanvas.tsx`
**Objectif** : Permettre au régulateur de créer des déviations
**Fonctionnalités** :
- Mode dessin sur la carte (clic pour placer points)
- Sélection début/fin de déviation sur tracé
- Preview du nouveau tracé
- Validation et activation
- Désactivation/suppression
- Raison de la déviation (travaux, accident, etc.)
**UX** : Interface inspirée des outils de dessin CAO

### Phase 3.13 : Terminus Dynamiques ⏸️
**Fichiers** : `fleetSlice.ts`, `networkSlice.ts`
**Objectif** : Modifier le terminus d'un bus en cours de service
**Fonctionnalités** :
- Sélection nouveau terminus (arrêt intermédiaire)
- Recalcul du tracé (tronçon du tracé original)
- Mise à jour temps de parcours estimé
- Notification au conducteur virtuel
- Impact sur les horaires suivants
**Cas d'usage** : Régulation en cas de retard important

### Phase 3.14 : Mode Replay ⏸️
**Fichiers** : `hooks/useRecorder.ts`, `temporalSlice.ts`
**Objectif** : Enregistrer et rejouer des sessions
**Fonctionnalités** :
- Enregistrement de tous les événements (state snapshots)
- Export JSON de l'historique complet
- Import et rejeu d'une session
- Contrôles de lecture (play/pause/seek)
- Vitesse de rejeu variable
**Cas d'usage** : Formation, analyse post-mortem, debug

### Phase 3.15 : Simulation Trafic Routier ⏸️
**Fichiers** : `lib/engine/traffic.ts`, `networkSlice.ts`
**Objectif** : Modulation réaliste de la vitesse
**Fonctionnalités** :
- Segmentation des tracés (vitesse par segment)
- Simulation feux tricolores (délais aléatoires 30-90s)
- Zones de congestion (rush hours)
- Impact sur temps de parcours
- Visualisation des zones lentes sur carte
**Technique** : Attributs OSM `maxspeed`, segments routiers

### Phase 3.16 : Export & Rapports ⏸️
**Fichiers** : `lib/utils/export.ts`, `components/panels/Reports.tsx`
**Objectif** : Générer des rapports de régulation
**Fonctionnalités** :
- Export PDF du journal (Main Courante)
- Graphiques de performance (cadencement, ponctualité)
- Statistiques de régulation (nb commandes, impact)
- Export CSV des événements
- Rapport de fin de journée
**Technique** : jsPDF + Chart.js

### Phase 3.17 : Multi-Lignes (Vue Réseau) ⏸️
**Fichiers** : `MapCanvas.tsx`, `fleetSlice.ts`, `components/panels/NetworkOverview.tsx`
**Objectif** : Afficher et gérer plusieurs lignes simultanément
**Fonctionnalités** :
- Affichage de toutes les lignes Stan sur la carte
- Sélection/désélection de lignes (filtres)
- Vue d'ensemble du réseau (matrice lignes × véhicules)
- Performance avec 50+ bus simultanés
- Layers séparés par ligne
**Challenge** : Maintenir 60 FPS avec beaucoup de véhicules

### Phase 3.18 : Optimisation WebWorker ⏸️
**Fichiers** : `workers/simulation.worker.ts`, `hooks/useSimulation.ts`
**Objectif** : Déporter calculs lourds hors du thread principal
**Fonctionnalités** :
- WebWorker pour calcul physique (mouvement, télémétrie)
- Communication efficace main ↔ worker (Transferable objects)
- Synchronisation state Zustand ↔ Worker
- Maintien 60 FPS avec 100+ véhicules
**Technique** : Comlink pour simplifier worker communication

### Phase 3.19 : Mode Collaboratif (optionnel) ⏸️
**Fichiers** : `lib/sync/websocket.ts`, `app/api/ws/route.ts`
**Objectif** : Multi-utilisateurs en temps réel
**Fonctionnalités** :
- WebSocket pour sync en temps réel
- Gestion de rôles (régulateur 1, 2, superviseur)
- Merge de commandes concurrentes
- Curseurs des autres utilisateurs sur carte
- Chat entre régulateurs
**Technique** : Next.js API Routes + ws, Yjs pour CRDT

---

## 🔧 DÉCISIONS TECHNIQUES

### DT-001 : Pas de sql.js pour GTFS
**Date** : 2026-01-05
**Décision** : Utiliser JSON pré-traité au lieu de SQLite
**Raison** : sql.js = 2MB, pas de SpatiaLite en WASM, overkill pour 1 ligne
**Alternative** : Parser GTFS CSV → JSON au build time

### DT-002 : MapLibre style
**Date** : 2026-01-05
**Décision** : Utiliser un style OSM custom ou Maptiler free tier
**Raison** : Meilleur contrôle du thème Dark Ops
**TODO** : Choisir entre Maptiler ou self-hosted OSM tiles

### DT-003 : OSM/Overpass pour les tracés de lignes ⭐ **NOUVELLE**
**Date** : 2026-01-05
**Décision** : Utiliser OpenStreetMap relations via Overpass API pour les tracés
**Raison** :
- OSM contient déjà les tracés précis des lignes Stan
- Relations OSM = 1 relation par sens (aller/retour)
- Données communautaires mises à jour
- Pas besoin de maintenir un GTFS shapes.txt
**Architecture** :
- Liste hard-coded des lignes dans `src/lib/constants/routes.ts`
- Chaque ligne = 2 IDs de relations OSM (aller + retour)
- Cache des géométries via API route `/api/osm/overpass`
- GTFS utilisé uniquement pour les horaires (stop_times.txt)
**Avantages** :
- Données géographiques précises et à jour
- Gestion native des déviations (remplacement de segments)
- Possibilité de récupérer attributs routiers (vitesse max, etc.)
**Cache** :
- Réponses Overpass en cache (15 min)
- Stockage local des géométries en IndexedDB

### DT-004 : Gestion des déviations sur tracés OSM
**Date** : 2026-01-05
**Décision** : Système de remplacement de segments de path
**Implémentation** :
- Chaque déviation définit un segment du tracé à remplacer (start/end index)
- Calcul du `activePath` = basePath avec segments remplacés
- Bus suivent le `activePath` au lieu du `basePath`
- Plusieurs déviations peuvent coexister (segments disjoints)
**Avantage** : Flexibilité maximale pour gérer travaux, accidents, etc.

---

## 📝 NOTES D'IMPLÉMENTATION

### NI-001 : GeoJSON lon/lat
**Rappel** : TOUJOURS utiliser [longitude, latitude] pour GeoJSON.
MapLibre attend aussi [lon, lat]. Ne jamais inverser.

### NI-002 : Zustand et React 19
**Note** : Zustand 5+ compatible React 19. Pas de soucis de deps.

### NI-003 : Performance MapLibre
**Astuce** : Utiliser `map.setData()` sur la source, pas `removeLayer/addLayer`.
Beaucoup plus performant pour animer les bus.

### NI-004 : Requêtes Overpass API ⭐ **NOUVELLE**
**Endpoint** : `https://overpass-api.de/api/interpreter`
**Format de requête** pour une relation :
```
[out:json];
relation(1234567);
(._;>;);
out geom;
```
**Parsing** :
- Récupérer les members de type "way"
- Assembler les nodes dans l'ordre pour créer le LineString
- Extraire les nodes de type "stop" pour les arrêts
**Limites** :
- Rate limit : 2 requêtes/seconde max
- Timeout : 180s par défaut
- Faire du caching agressif (15 min minimum)

### NI-005 : Application des déviations
**Algorithme** :
```typescript
function applyDeviations(basePath: GeoPoint[], deviations: Deviation[]): GeoPoint[] {
  let activePath = [...basePath];

  for (const dev of deviations.filter(d => d.active)) {
    const { startPointIndex, endPointIndex, alternativePath } = dev.segment;
    activePath = [
      ...activePath.slice(0, startPointIndex),
      ...alternativePath,
      ...activePath.slice(endPointIndex + 1)
    ];
  }

  return activePath;
}
```
**Important** : Trier les déviations par ordre décroissant de `startPointIndex` pour éviter les conflits d'index.

### NI-006 : Mouvement bus sur tracé avec déviations
**Algorithme** :
1. Bus a un `activePath` (= basePath + déviations appliquées)
2. Bus a une `distanceOnPath` (en mètres depuis le début)
3. Utiliser `turf.along(lineString, distance)` pour obtenir la position actuelle
4. Chaque tick : `distanceOnPath += speed * deltaTime`
5. Si `distanceOnPath >= totalDistance` → bus arrive au terminus

---

## 🐛 BUGS & ISSUES

### BUG-001 : (Exemple)
**Status** : 🔴 Ouvert
**Description** : Aucun bug pour l'instant (projet pas démarré)
**Fichiers** : N/A
**Solution** : N/A

---

## 📊 MÉTRIQUES DE PROGRESSION

| Phase | État | Fichiers | LOC | Tokens utilisés | Date fin |
|-------|------|----------|-----|-----------------|----------|
| Phase 1 | ✅ | 18/18 | ~888 | ~18k | 2026-01-05 |
| Phase 2 | ✅ | 6/6 modifiés | ~1,236 | ~22k | 2026-01-05 |
| Phase 3.2 | ✅ | 1 créé | 340 | ~8k | 2026-01-05 |
| Phase 3+ | ⏸️ | 0/X | 0 | 0 | - |

**Total progression** : 45% (Phases 1, 2, 3.2 complètes)

---

## 🎯 PROCHAINE ACTION

**Phases 1 & 2 terminées ✅**

**Vertical Slice MVP fonctionnel !**

**ARCHITECTURE OSM/OVERPASS DÉFINIE ⭐**
- Types mis à jour ([types/index.ts](src/types/index.ts))
- Nouvelle architecture réseau avec relations OSM
- Système de déviations sur segments de tracé
- Liste hard-coded des lignes dans [lib/constants/routes.ts](src/lib/constants/routes.ts)

**AVANT DE COMMENCER PHASE 3** :
1. ✅ **IDs de relations OSM remplis** dans [lib/constants/routes.ts](src/lib/constants/routes.ts)
   - 5 lignes Tempo (T1 à T5) configurées
   - Relations aller/retour pour chaque ligne
   - Prêt pour Phase 3.2 (API OSM Overpass)
2. Lire [PHASE_2_COMPLETE.md](./PHASE_2_COMPLETE.md) pour voir la démo actuelle

**ORDRE RECOMMANDÉ Phase 3** :
1. ✅ **Phase 3.2** : API OSM Overpass (TERMINÉE)
   - ✅ Endpoint `/api/osm/overpass` créé et testé
   - ✅ Parser OSM → GeoJSON fonctionnel (600+ points)
   - ✅ Cache 15 min implémenté
   - ✅ Testé avec T1 aller/retour (13.93 km / 22.46 km)
   - ✅ Voir [PHASE_3.2_COMPLETE.md](PHASE_3.2_COMPLETE.md)

2. **Phase 3.1** : Mouvement des bus (PRIORITÉ ACTUELLE)
   - Connecter NetworkStore à l'API Overpass
   - Charger les tracés au démarrage
   - Implémenter `turf.along()` pour le mouvement
   - Animation fluide le long du tracé OSM
   - Gestion de la distance parcourue

3. **Phase 3.6** : Synoptic (vue linéaire)
   - Visualisation essentielle pour la régulation
   - Affichage des bus sur la ligne
   - Calcul du cadencement

4. **Phase 3.12** : Interface déviations
   - Outil de dessin sur carte
   - Application des déviations aux tracés

**Commandes utiles** :
```bash
# Démarrer la démo
npm run dev

# Accéder au PCC
http://localhost:3000/pcc

# Test : Cliquer sur le bus bleu à Nancy
# → L'Inspector affiche la télémétrie
# → Play : l'horloge avance
# → ×60 : temps accéléré
```

**Roadmap complète** : 19 phases définies (3.1 → 3.19)

---

**FIN DU ROADMAP - Maintenu à jour en continu**