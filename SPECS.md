# 📑 Projet : SAEIV Next-Gen (Simulateur de Supervision de Transport)

Ce projet est une démonstration technique de haut niveau alliant **Géomatique**, **Développement Web moderne** et **Algorithmique de transport**. Il simule un Poste de Commande Centralisé (PCC) gérant une flotte de bus (standards, articulés et bi-articulés) en temps réel.

---

## 🏗️ 1. Architecture Technique (Hybrid Client-Server)

Le projet repose sur une architecture **hybride** avec calculs côté client et backend léger Next.js pour le caching, garantissant une fluidité maximale (60 FPS) sans latence réseau temps réel.

### Stack Technique

* **Framework :** Next.js 16 (App Router)
* **Déploiement :** Vercel (Edge Functions pour API Routes)
* **Gestion d'État :** **Zustand** (Slices pattern) pour un flux de données unidirectionnel performant
* **Moteur Cartographique :** MapLibre GL JS avec **LOD (Level of Detail) obligatoire**
* **Moteur de Simulation :** Boucle temporelle déterministe côté client (`requestAnimationFrame`)
* **SIG & Routing :** Turf.js (calculs géodésiques client-side)
* **Sources de Données :**
  * **GTFS :** Données réelles du réseau **Stan (Nancy)**, pré-traitées et cachées en API Routes
  * **OSM :** Données via **Overpass API**, cachées derrière API Routes Next.js pour éviter rate-limiting
* **Caching Backend :** API Routes Next.js avec headers `Cache-Control` agressifs + Vercel Edge Cache

### Contraintes Techniques

* **Performance :** LOD obligatoire (simplification rendering bus distants, réduction détails carte)
* **Scope :** **Une seule ligne** sélectionnable parmi toutes les lignes GTFS disponibles
* **Plateforme :** Desktop uniquement (pas de responsive mobile)
* **Accessibilité :** Non implémentée (focus sur performance visuelle)

---

## 🛠️ 2. Modélisation & Typage TypeScript (Extraits)

### Les Véhicules (Cinématique & Télémétrie)

Le système gère la physique de bus bi-articulés (3 segments).

```typescript
export interface BusSegment {
  id: string; // 'tracteur', 'remorque_1', 'remorque_2'
  length: number;
  width: number;
  currentHeading: number;
  currentPosition: [number, number];
}

export interface Bus {
  id: string;
  type: 'STANDARD' | 'ARTICULATED' | 'BI_ARTICULATED';
  status: 'IN_SERVICE' | 'IDLE' | 'HLP' | 'EMERGENCY';
  segments: BusSegment[];
  telemetry: {
    energyLevel: number; // % Gaz ou Batterie
    energyType: 'ELECTRIC' | 'CNG';
    doors: boolean[]; // État ouvert/fermé par porte
    engineTemp: number;
    alerts: { abs: boolean; overheat: boolean };
  };
  parkingSpaceId?: string; // ID de la closed way OSM au dépôt
}

```

### Le Réseau & Services

```typescript
export interface GTFSService {
  tripId: string;
  routeId: string;
  stopTimes: { stopId: string; arrivalTime: string; departureTime: string }[];
  path: [number, number][]; // Tracé OSM fusionné
}

```

---

## 📺 3. Interface Utilisateur (UI/UX)

L'interface est découpée en **4 zones stratégiques** avec un thème **"Dark Ops"** industriel.

1. **Écran Central (Carte) :**
* Visualisation des bus avec sprites articulés réagissant aux virages.
* Interaction directe (Drag-to-reroute) pour créer des déviations.
* Snapping magnétique sur les segments de route OSM.


2. **Panneau de Gauche (Inspecteur Contextuel) :**
* **Vue Bus :** Cockpit avec jauges d'énergie, boutons de commande des portes et état moteur.
* **Vue Arrêt :** Prochains passages (BIV) et analyse isochrone.
* **Vue Dépôt :** Gestion du stationnement (marche avant/arrière sur les places dédiées).


3. **Panneau de Droite (Main Courante) :**
* Flux d'événements en temps réel (Historique des alertes, pannes, prises de service).
* Journal de bord avec niveaux de sévérité (Info, Warning, Critical).


4. **Écran du Bas (Synoptique - Rétractable) :**
* Vue linéaire de la ligne "à plat".
* Visualisation de l'espacement entre les bus pour la régulation du cadencement.



---

## 🎮 4. Fonctionnalités de Régulation (Actions)

Le PCC permet d'agir sur le réseau pour corriger les aléas :

* **Gestion Temporelle :** Décalage de départ, régulation par l'avance, gestion des temps de battement.
* **Haut-Le-Pied (HLP) :** Injection de véhicules, retour prématuré au dépôt, HLP "Descente Uniquement".
* **Gestion de Crise :** Échange standard de véhicule en ligne, substitution suite à une panne moteur/ABS.
* **Dépôt & Remisage :** Gestion des places de parking (closed ways OSM). Les véhicules `IDLE` sont garés précisément sur leurs emplacements attitrés.

---

## 🚒 5. Simulation des Aléas & Interventions

* **Véhicules d'intervention :** Patrouille aléatoire sur le graphe routier (Random Walk).
* **Scénario d'urgence :** Lorsqu'une alerte critique (ex: surchauffe) remonte dans la Main Courante, le régulateur peut dépêcher le véhicule d'intervention le plus proche (Calcul Dijkstra sur réseau routier).
* **Trafic :** Influence sur la vitesse moyenne des segments, impactant les ETA (Estimated Time of Arrival) calculés dynamiquement.

---

## 🚀 6. Pourquoi ce projet valorise ton Portfolio ?

1. **Maîtrise SIG :** Manipulation de données OSM et GTFS, calculs de trajectoires complexes, snapping et géofencing.
2. **Complexité Algorithmique :** Gestion de la cinématique des bus bi-articulés et algorithmes d'assignation automatique (Graphicage).
3. **Ingénierie Frontend :** Utilisation avancée de Zustand, MapLibre et Next.js pour gérer un état global massif en temps réel.
4. **UX Industrielle :** Conception d'un dashboard métier cohérent et fonctionnel.

---

## 1. `TemporalStore` (Gestion du Temps)

Ce store pilote l'horloge interne du simulateur.

```typescript
interface TemporalState {
  virtualTime: Date;       // L'heure actuelle de la simulation
  timeScale: number;       // Multiplicateur (1x, 10x, 60x...)
  isPaused: boolean;       // État du moteur de simulation
  
  // Actions
  tick: (deltaTime: number) => void;
  setSpeed: (speed: number) => void;
  togglePause: () => void;
  seekTime: (target: Date) => void;
}

```

---

## 2. `FleetStore` (Véhicules & Cinématique)

C'est le store le plus dynamique, mis à jour à chaque "tick".

```typescript
interface FleetState {
  vehicles: Record<string, Bus | InterventionVehicle>;
  selectedEntityId: string | null; // ID du bus/véhicule sélectionné
  
  // Types internes
  // Bus gère Standard, Articulé et Bi-Articulé via le tableau de segments
  // Les segments permettent de calculer les angles d'articulation
  
  // Actions
  updateVehiclesLogic: () => void; // Calcul positions + angles + télémétrie
  setVehicleStatus: (id: string, status: VehicleStatus) => void;
  toggleDoors: (id: string, doorIndex: number) => void;
  selectEntity: (id: string | null) => void;
}

```

---

## 3. `NetworkStore` (Infrastructure & SIG)

Contient les données "froides" (GTFS) et les modifications "chaudes" (Déviations).

```typescript
interface NetworkState {
  routes: Record<string, RouteGeometry>; // Tracés OSM + Shapes
  stops: Record<string, Stop>;           // Points d'arrêts (coordonnées, nom)
  parkingSpaces: Record<string, Way>;    // Polygones OSM du dépôt
  activeDeviations: Deviation[];         // Liste des déviations en cours
  
  // Actions
  addDeviation: (routeId: string, newPath: GeoPoint[]) => void;
  getStopBIV: (stopId: string) => Promise<Arrival[]>; // Temps réel calculé
  snapToNetwork: (point: GeoPoint) => GeoPoint;       // Utile pour le drag-to-reroute
}

```

---

## 4. `ScheduleStore` (Planning & Services)

Gère l'assignation des ressources aux missions.

```typescript
interface ScheduleState {
  trips: Record<string, Trip>;           // Services théoriques (GTFS)
  assignments: Record<string, string>;   // Mapping [TripID]: [VehicleID]
  
  // Actions
  assignVehicleToTrip: (vehicleId: string, tripId: string) => void;
  calculateDispatch: () => void;         // Algorithme d'assignation auto
  triggerHLP: (vehicleId: string, destination: GeoPoint) => void;
}

```

---

## 5. `LogStore` (La Main Courante)

Le registre historique de tous les événements de la simulation.

```typescript
interface LogEntry {
  id: string;
  virtualTimestamp: Date;                // Heure à laquelle l'event s'est produit
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  source: 'VEHICLE' | 'SYSTEM' | 'REGULATION';
  message: string;
  entityId?: string;                     // Lien vers un bus ou arrêt
}

interface LogState {
  logs: LogEntry[];                      // Liste chronologique (la plus récente en bas)
  
  // Actions
  addLog: (entry: Omit<LogEntry, 'id' | 'virtualTimestamp'>) => void;
  clearLogs: () => void;
}

```

---

## 📋 Types de Base Partagés

Pour assurer la cohérence entre les stores, voici les types fondamentaux à définir dans un fichier `types/transport.ts` :

| Type | Structure | Description |
| --- | --- | --- |
| **`GeoPoint`** | `[number, number]` | Coordonnées [Long, Lat]. |
| **`VehicleStatus`** | `enum` | `IDLE`, `IN_SERVICE`, `HLP`, `EMERGENCY`, `OFF_LINE`. |
| **`BusTelemetry`** | `object` | `energy`, `engineTemp`, `doors[]`, `absAlert`, `odometer`. |
| **`Segment`** | `object` | `pos`, `heading`, `length`, `relativeAngle`. |

---

La logique métier est le "moteur de décision" de ton SAEIV. Dans Next.js, elle réside principalement dans les actions de tes **stores Zustand** (côté client) et dans tes **API Routes** (pour les calculs lourds comme le routing).

Voici comment structurer les algorithmes pour les trois piliers de ton exploitation :

---

## 1. Logique de Régulation (Gestion de l'Aléa)

La régulation intervient quand le `FleetStore` détecte un écart entre le `virtualTime` et le `theoreticalTime` du GTFS.

### A. Le Retard Commandé (Décalage de départ)

* **Trigger :** Manuel (via l'UI) ou automatique (correspondance manquée).
* **Algorithme :**
1. Sélectionner le `Trip` dans le `ScheduleStore`.
2. Appliquer un `offset` (ex: +5min) à tous les `stop_times` restants du service.
3. **Vérification de faisabilité :** Calculer si le bus aura assez de temps pour son prochain service (enchaînement des blocs). Si le temps de battement au terminus devient < 2 min, lever une alerte de "Conflit de service".



### B. Le Haut-Le-Pied (HLP) de rééquilibrage

* **Trigger :** Un trou dans la desserte est détecté sur une ligne.
* **Algorithme :**
1. Changer le `status` du bus en `HLP`.
2. Appeler l'API de routing Next.js pour calculer le trajet le plus court (carrossable) entre la position actuelle et le point d'injection cible sur la ligne.
3. Calculer l'ETA. Si le bus arrive à temps pour boucher le trou, valider l'action.
4. **UI :** Le bus change de couleur sur la carte et son tracé devient une ligne directe vers la cible.



---

## 2. Logique des Alertes (Main Courante & Maintenance)

C'est ici que tu lies la télémétrie du bus au `LogStore`.

### A. Déclenchement d'Alerte Télémétrique

* **Calcul (dans le loop du FleetStore) :**
* `if (bus.engineTemp > 105)` → Trigger alerte `CRITICAL`.
* `if (bus.energyLevel < 10%)` → Trigger alerte `WARNING`.


* **Action :**
1. Ajouter une entrée dans le `LogStore`.
2. Le bus passe en mode `EMERGENCY` (vitesse réduite ou arrêt immédiat).
3. L'UI fait clignoter le bus en rouge et affiche un badge "!" dans la liste.



### B. Alerte de "Bunching" (Train de bus)

* **Calcul :** Calculer la distance entre le bus  et le bus  sur la même ligne.
* **Seuil :** Si la distance < 200m alors qu'elle devrait être de 2km.
* **Action :** Alerte visuelle pour suggérer au régulateur un "Saut d'arrêts" pour le premier bus ou un "Retard commandé" pour le second.

---

## 3. Logique de Gestion du Dépôt (Remisage)

Pour garer tes bus (standards ou bi-articulés) sur les polygones OSM.

### A. Entrée au Dépôt

* **Input :** Le bus franchit le geofence du dépôt.
* **Processus :**
1. Récupérer le `parkingSpaceId` lié au bus.
2. Récupérer la géométrie du polygone (Way) dans le `NetworkStore`.
3. Calculer le vecteur d'alignement (Axe médian du polygone).
4. **Snapping Cinématique :** Si `parkingMode === 'REAR'`, inverser le heading () et aligner les 3 segments (bi-articulé) sur cet axe.



### B. Sortie de Dépôt (Prise de service)

* **Logic :** 10 minutes avant le premier départ du GTFS.
* **Action :** Le bus s'auto-allume, passe de `IDLE` à `HLP` (Haut-le-pied vers le terminus de départ).

---

## 4. Logique Spécifique : Bus Bi-Articulé en Virage

Pour que l'articulation soit réaliste visuellement :

* **Variables :**  (Heading tracteur),  (Longueur segments).
* **Algorithme de poursuite :**
1. Calculer la position du pivot 1 à l'arrière du tracteur.
2. Le segment 2 (remorque 1) s'oriente vers le pivot 1, mais avec une **constante de lissage** (amortissement) pour simuler l'inertie de l'articulation.
3. Répéter l'opération pour le pivot 2 et le segment 3 (remorque 2).
4. **Contrainte :** L'angle relatif entre deux segments ne peut excéder 45°. Si le tracé OSM est trop serré, déclencher une alerte "Rayon de courbure insuffisant".


Cette fonctionnalité de **multicouches (Layering)** avec intégration de **vidéo 360°** propulse ton portfolio dans une dimension "Digital Twin" (Jumeau Numérique) très impressionnante. Elle montre que tu sais gérer des médias lourds et des états de carte complexes.

Voici le résumé structuré de cette gestion des layers :

---

## 🗺️ Stratégie de Layering (Gestion des Couches)

La carte utilise un système de filtres dynamiques piloté par le `NetworkStore`.

### 1. Layer "Exploitation" (La vue par défaut)

* **Comportement :** S'active lors de la sélection d'une ligne.
* **Affichage :** * Le tracé de la ligne est mis en surbrillance (épaisseur accrue, couleur de la ligne).
* Filtrage des sprites : seuls les bus de cette ligne conservent leur opacité 100%, les autres passent en semi-transparence.
* **Synoptique :** Le panneau du bas se déplie automatiquement pour afficher la vue linéaire.



### 2. Layer "Trafic & Congestion" (Simulation Temporelle)

* **Logique métier :** Génération d'états de trafic fictifs basés sur l'horloge virtuelle (`virtualTime`).
* **Visualisation :** Segments de routes colorés (Rouge/Orange) superposés aux axes principaux.
* **Dynamique :** * **08h / 12h / 18h :** Apparition automatique des bouchons.
* **Impact :** Le moteur de simulation réduit la vitesse des bus traversant ces segments, créant mécaniquement du retard dans le `FleetStore`.



### 3. Layer "Vidéosurveillance & Immersion 360°"

* **Points d'intérêt (POI) :** Icônes "Caméra" placés à des endroits stratégiques (stations majeures, carrefours critiques, dépôts).
* **Intégration GoPro 360 :**
* Au clic sur une caméra ou via le bouton "Live View" dans l'**Inspecteur Contextuel** du bus (si le bus est proche d'une caméra).
* **Popup Interactive :** Utilisation d'un lecteur de sphère 360 (comme `Pannellum` ou `Three.js`) intégré dans une modale Next.js.
* **UX :** L'utilisateur peut "drag" la vue pour inspecter l'environnement comme s'il était sur place.



---

## 🛠️ Implémentation Technique

### Structure du Store (`NetworkStore`)

```typescript
interface Camera {
  id: string;
  position: GeoPoint;
  videoUrl: string; // Lien vers ton fichier local GoPro 360
  name: string;
}

interface TrafficState {
  segmentId: string;
  level: 'LOW' | 'MEDIUM' | 'HEAVY';
}

```

### Logique de l'Inspecteur (Panneau de Gauche)

Lorsqu'un bus est sélectionné :

1. Le système calcule la distance entre le bus et la caméra la plus proche.
2. Si `distance < 50m`, un bouton **"Voir Caméra Embarquée/Station"** apparaît.
3. Le clic déclenche l'ouverture de la vue 360° sans quitter l'onglet.

### Contraintes Techniques & Astuces

* **Performance Vidéo :** Pour que ce soit fluide en local, utilise des formats optimisés (WebM/MP4) et des résolutions adaptées à un affichage en popup.
* **Snapping 360 :** Tu peux même imaginer que la caméra 360 "suit" le bus si tu as plusieurs séquences vidéos, en changeant de source selon la position du bus.

Pour un projet de cette envergure sous **Next.js**, l'arborescence des fichiers doit refléter la séparation stricte entre la **logique de simulation** (le moteur), la **gestion d'état** (Zustand) et l'**affichage cartographique**.

Voici une proposition d'arborescence optimisée pour ton portfolio :

### 📂 Arborescence du Projet

```text
/
├── public/
│   ├── data/
│   │   ├── gtfs/           # Fichiers JSON convertis du GTFS (stops, trips)
│   │   └── osm/            # GeoJSON des lignes et polygones du dépôt
│   ├── sprites/            # SVG des segments de bus (front, middle, rear)
│   └── videos/             # Tes fichiers GoPro 360 (.mp4 / .webm)
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/            # API Routes (Routing OSRM, Snapping)
│   │   └── pcc/            # Page principale du simulateur
│   ├── components/
│   │   ├── ui/             # Composants génériques (Boutons, Modales)
│   │   ├── map/
│   │   │   ├── MapCanvas.tsx       # Composant MapLibre principal
│   │   │   └── ArticulatedBus.tsx  # Logique de rendu des sprites
│   │   ├── panels/
│   │   │   ├── Inspector.tsx       # Gauche : Cockpit, BIV, Caméra
│   │   │   ├── MainCourante.tsx    # Droite : Journal des événements
│   │   │   └── Synoptic.tsx        # Bas : Vue linéaire rétractable
│   │   └── video/
│   │       └── Viewer360.tsx       # Lecteur vidéo GoPro 360
│   ├── hooks/
│   │   └── useSimulation.ts        # Le "Ticker" qui fait tourner l'horloge
│   ├── lib/
│   │   ├── engine/                 # Logique pure (physique, cinématique)
│   │   │   ├── articulatedPhysics.ts
│   │   │   └── trafficGenerator.ts
│   │   └── utils/                  # Helpers géomatiques (Turf, formatage)
│   ├── store/                      # Zustand Stores
│   │   ├── usePCCStore.ts          # Store racine combiné
│   │   └── slices/
│   │       ├── fleetSlice.ts
│   │       ├── temporalSlice.ts
│   │       ├── networkSlice.ts
│   │       └── logSlice.ts
│   └── types/                      # Interfaces TypeScript
│       └── index.ts
├── tailwind.config.ts
└── tsconfig.json

```

---

## 🔌 API Routes Next.js (Backend Léger)

Le backend Next.js sert **uniquement** de cache et de proxy pour éviter les appels directs depuis le client.

### `/api/osm/overpass`

**Rôle :** Proxy caché vers Overpass API pour requêtes OSM.

**Stratégie de Caching :**
* Cache Vercel Edge avec `Cache-Control: public, s-maxage=86400, stale-while-revalidate=604800`
* Requêtes pré-définies (bbox Nancy, types de routes carrossables pour bus)
* Format retour : GeoJSON simplifié

**Paramètres :**
* `bbox`: Bounding box de Nancy
* `features`: `roads` | `depot` | `stops`

**Exemple de requête Overpass cachée :**
```typescript
// GET /api/osm/overpass?bbox=6.1,48.65,6.25,48.72&features=roads
// Retourne les routes OSM de Nancy en GeoJSON
```

---

### `/api/gtfs/nancy`

**Rôle :** Servir les données GTFS pré-traitées du réseau Stan.

**Endpoints :**
* `/api/gtfs/nancy/routes` → Liste toutes les lignes disponibles
* `/api/gtfs/nancy/route/[id]` → Détails d'une ligne (stops, trips, shapes)
* `/api/gtfs/nancy/stops` → Tous les arrêts avec coordonnées

**Stratégie :**
* Données GTFS téléchargées depuis [data.grandnancy.eu](https://data.grandnancy.eu/) (source officielle Stan)
* Pré-traitement : conversion CSV → JSON, fusion `shapes.txt` avec OSM pour tracés précis
* Cache statique (build time) via `generateStaticParams`

---

### `/api/routing/dijkstra`

**Rôle :** Calcul de plus court chemin sur le graphe routier OSM.

**Implémentation :**
* Algorithme Dijkstra custom (pas de dépendance OSRM)
* Graphe construit au build-time depuis données OSM cachées
* Contraintes : routes carrossables bus, hauteur minimum, rayon de courbure

**Paramètres :**
```typescript
POST /api/routing/dijkstra
{
  origin: [lon, lat],
  destination: [lon, lat],
  vehicleType: 'STANDARD' | 'ARTICULATED' | 'BI_ARTICULATED'
}
```

**Retour :**
```typescript
{
  path: GeoPoint[],
  distance: number, // mètres
  duration: number, // secondes
  warnings: string[] // ex: "Rayon de courbure serré au point X"
}
```

---

## 🎨 Système LOD (Level of Detail) - Obligatoire

Le LOD est **critique** pour maintenir 60 FPS avec plusieurs bus articulés en temps réel.

### Stratégie de Simplification par Zoom

| Niveau Zoom | Distance Caméra | Rendu Bus | Détails Carte | Mise à Jour |
|-------------|----------------|-----------|---------------|-------------|
| **16-22** (Proche) | < 200m | **Full** : 3 segments animés, portes, télémétrie temps réel | Routes détaillées, noms arrêts | 60 FPS |
| **14-15** (Moyen) | 200m - 1km | **Simplifié** : 1 sprite statique, pas d'articulation | Routes simplifiées, arrêts sans labels | 30 FPS |
| **10-13** (Loin) | > 1km | **Points** : Dot coloré par statut | Routes principales uniquement | 15 FPS |

### Implémentation Technique

**Dans le FleetStore :**
```typescript
interface FleetState {
  // ...
  lodLevel: 'full' | 'simplified' | 'minimal';

  // Actions
  updateLOD: (zoom: number) => void;
}

// Logique
const updateLOD = (zoom: number) => {
  if (zoom >= 16) set({ lodLevel: 'full' });
  else if (zoom >= 14) set({ lodLevel: 'simplified' });
  else set({ lodLevel: 'minimal' });
};
```

**Dans MapLibre (Layers dynamiques) :**
```typescript
// Layer bus full detail (visible zoom >= 16)
map.addLayer({
  id: 'buses-detailed',
  type: 'symbol',
  source: 'fleet',
  minzoom: 16,
  layout: {
    'icon-image': ['get', 'segmentSprite'], // Sprites articulés
    'icon-rotate': ['get', 'heading']
  }
});

// Layer bus simplifié (14-15)
map.addLayer({
  id: 'buses-simple',
  type: 'symbol',
  source: 'fleet',
  minzoom: 14,
  maxzoom: 16,
  layout: { 'icon-image': 'bus-generic' }
});

// Layer bus minimal (< 14)
map.addLayer({
  id: 'buses-dots',
  type: 'circle',
  source: 'fleet',
  maxzoom: 14,
  paint: {
    'circle-radius': 4,
    'circle-color': ['get', 'statusColor']
  }
});
```

### Optimisations Physique

* **LOD Full** : Calculs cinématiques complets (angles articulation, portes, télémétrie)
* **LOD Simplifié** : Position seule, heading simplifié, pas d'animation portes
* **LOD Minimal** : Position uniquement, pas de calculs d'angle

**Impact attendu :**
* Sans LOD : ~20 FPS avec 10 bus bi-articulés
* Avec LOD : **60 FPS stable** avec 15+ bus

---

## 📊 Contraintes de Performance

### Limites Techniques à Respecter

* **Max véhicules simultanés :** 20 bus (dont max 5 bi-articulés)
* **Tick rate physique :** 30 Hz (33ms/tick) pour les calculs, interpolation pour 60 FPS rendering
* **Taille réseau OSM :** Bbox Nancy uniquement (~15km²), ~5000 segments routiers
* **Taille mémoire GTFS :** 1 ligne complète chargée (~50 arrêts, ~200 trips/jour)

### Monitoring Performance

Afficher dans l'UI (mode debug) :
* FPS courant
* Nombre de véhicules actifs
* LOD level actuel
* Temps de calcul par tick (ms)

```typescript
interface PerformanceMetrics {
  fps: number;
  tickDuration: number; // ms
  activeVehicles: number;
  lodLevel: string;
}
```

---

## 🎯 Scope MVP et Priorisation

### Phase 1 : Core (MVP Déployable)

**Objectif :** Démo fonctionnelle avec une ligne Stan sur Vercel.

**Features incluses :**
- ✅ Sélection d'une ligne GTFS parmi toutes les lignes Stan disponibles
- ✅ Affichage carte MapLibre avec tracé de la ligne sélectionnée
- ✅ **3-5 bus standards** (pas d'articulation) simulés en temps réel
- ✅ Système LOD fonctionnel (3 niveaux)
- ✅ Horloge virtuelle avec contrôles (pause, vitesse 1x/10x/60x)
- ✅ Panneau Inspector basique (sélection bus, télémétrie simple)
- ✅ Main Courante (logs INFO/WARNING/CRITICAL)
- ✅ API Routes : `/api/gtfs/nancy`, `/api/osm/overpass`

**Features exclues (Phase 2+) :**
- ❌ Bus articulés/bi-articulés
- ❌ Gestion dépôt et remisage
- ❌ Véhicules d'intervention
- ❌ Vidéo 360°
- ❌ Trafic dynamique
- ❌ Drag-to-reroute
- ❌ Actions de régulation avancées (HLP, etc.)

**Critères de succès MVP :**
1. 60 FPS stable avec 5 bus standards en LOD full
2. Déployé sur Vercel sans erreurs
3. Données GTFS Stan réelles chargées
4. Interface "Dark Ops" cohérente et fonctionnelle

---

### Phase 2 : Articulation & Régulation

**Ajouts :**
- Bus articulés (2 segments) avec cinématique réaliste
- Algorithme de régulation basique (retard commandé)
- Synoptique (vue linéaire)
- Calcul BIV temps réel

---

### Phase 3 : Advanced Features

**Ajouts :**
- Bus bi-articulés (3 segments)
- Gestion dépôt (parking, remisage)
- Trafic dynamique avec impact ETA
- Véhicules d'intervention
- Drag-to-reroute avec snapping

---

### Phase 4 : Polish & Innovation

**Ajouts :**
- Vidéo 360° (GoPro)
- Animations UI avancées
- Easter eggs et scénarios pré-configurés
- Documentation technique complète

---

## 🧮 Algorithmes Critiques à Implémenter

### 1. Cinématique Bus Articulé (Modèle Bicycle Simplifié)

**Variables :**
- `L1`, `L2` : Longueurs des segments (tracteur, remorque)
- `θ₁` : Heading tracteur
- `θ₂` : Heading remorque
- `δ` : Angle d'articulation (limité à ±45°)
- `v` : Vitesse linéaire du tracteur

**Algorithme de mise à jour (chaque tick) :**
```typescript
function updateArticulatedBus(bus: Bus, deltaTime: number) {
  const { segments, speed } = bus;
  const [tracteur, remorque] = segments;

  // 1. Mise à jour position tracteur
  const distance = speed * deltaTime;
  tracteur.currentPosition = turf.destination(
    tracteur.currentPosition,
    distance / 1000, // km
    tracteur.currentHeading,
    { units: 'kilometers' }
  ).geometry.coordinates;

  // 2. Calcul pivot (arrière tracteur)
  const pivotPosition = turf.destination(
    tracteur.currentPosition,
    tracteur.length / 1000,
    tracteur.currentHeading + 180,
    { units: 'kilometers' }
  ).geometry.coordinates;

  // 3. Calcul heading remorque (pointe vers le pivot)
  const bearing = turf.bearing(
    remorque.currentPosition,
    pivotPosition
  );

  // 4. Lissage (damping) pour simuler inertie articulation
  const DAMPING_FACTOR = 0.3; // À calibrer
  const targetHeading = bearing;
  remorque.currentHeading =
    remorque.currentHeading +
    (targetHeading - remorque.currentHeading) * DAMPING_FACTOR;

  // 5. Contrainte angle max
  const articulationAngle = Math.abs(tracteur.currentHeading - remorque.currentHeading);
  if (articulationAngle > 45) {
    // Alerte : virage trop serré
    logStore.addLog({
      severity: 'WARNING',
      source: 'VEHICLE',
      message: `Bus ${bus.id}: Angle articulation critique (${articulationAngle.toFixed(1)}°)`,
      entityId: bus.id
    });
  }

  // 6. Mise à jour position remorque (suit le pivot avec damping)
  const distanceToTarget = turf.distance(
    remorque.currentPosition,
    pivotPosition,
    { units: 'meters' }
  );

  if (distanceToTarget > 0.5) { // Seuil 50cm
    remorque.currentPosition = turf.destination(
      remorque.currentPosition,
      distanceToTarget * 0.5, // Move halfway (smoothing)
      remorque.currentHeading,
      { units: 'meters' }
    ).geometry.coordinates;
  }
}
```

**Extension pour bus bi-articulé :**
Répéter l'algorithme pour `remorque_2` en utilisant `remorque_1` comme référence.

---

### 2. Calcul ETA (Estimated Time of Arrival)

**Input :**
- Position actuelle bus
- Arrêts restants sur le trip
- Trafic sur les segments (Phase 3)

**Algorithme :**
```typescript
function calculateETA(bus: Bus, targetStopId: string): Date {
  const trip = scheduleStore.getAssignedTrip(bus.id);
  const currentPos = bus.segments[0].currentPosition;
  const remainingStops = trip.stopTimes.filter(
    st => st.stopId >= getCurrentStopId(bus) && st.stopId <= targetStopId
  );

  let totalDuration = 0; // secondes

  for (let i = 0; i < remainingStops.length - 1; i++) {
    const stopA = networkStore.stops[remainingStops[i].stopId];
    const stopB = networkStore.stops[remainingStops[i + 1].stopId];

    // Distance entre arrêts
    const distance = turf.distance(stopA.position, stopB.position, { units: 'meters' });

    // Vitesse moyenne (à ajuster avec trafic en Phase 3)
    const avgSpeed = 30; // km/h (vitesse urbaine bus)
    const duration = (distance / 1000) / avgSpeed * 3600; // secondes

    // Temps d'arrêt (ouverture/fermeture portes, montée/descente)
    const dwellTime = 30; // secondes

    totalDuration += duration + dwellTime;
  }

  // Ajouter à virtualTime
  const eta = new Date(temporalStore.virtualTime.getTime() + totalDuration * 1000);
  return eta;
}
```

---

### 3. Détection Bunching (Train de Bus)

**Algorithme :**
```typescript
function detectBunching(lineId: string): void {
  const busesOnLine = Object.values(fleetStore.vehicles).filter(
    v => v.status === 'IN_SERVICE' && v.assignedRouteId === lineId
  );

  // Trier par position sur la ligne (distance depuis terminus)
  const sorted = busesOnLine.sort((a, b) =>
    getDistanceFromOrigin(a) - getDistanceFromOrigin(b)
  );

  for (let i = 0; i < sorted.length - 1; i++) {
    const busA = sorted[i];
    const busB = sorted[i + 1];

    const distance = turf.distance(
      busA.segments[0].currentPosition,
      busB.segments[0].currentPosition,
      { units: 'meters' }
    );

    // Seuil : espacement théorique / 4
    const theoreticalSpacing = 2000; // 2km (à calculer dynamiquement)
    const threshold = theoreticalSpacing / 4;

    if (distance < threshold) {
      logStore.addLog({
        severity: 'WARNING',
        source: 'REGULATION',
        message: `Bunching détecté: Bus ${busA.id} et ${busB.id} trop proches (${distance.toFixed(0)}m)`,
        entityId: busA.id
      });

      // Suggestion UI : "Appliquer saut d'arrêts au bus avant?"
    }
  }
}
```

---

## 🚨 Points d'Attention pour l'Implémentation

### Pièges Techniques à Éviter

1. **Coordonnées [lon, lat] vs [lat, lon]** : GeoJSON utilise `[longitude, latitude]`, attention aux inversions avec MapLibre
2. **Turf.js units** : Toujours spécifier `{ units: 'meters' | 'kilometers' }` explicitement
3. **MapLibre sources** : Utiliser `GeoJSONSource.setData()` pour mises à jour, pas `addSource()` répété
4. **Zustand devtools** : Activer uniquement en dev, désactiver en prod (impact performance)
5. **Vercel Edge Functions timeout** : 10s max, prévoir fallback pour Overpass lent
6. **GTFS time format** : `"HH:MM:SS"` peut dépasser 24h (ex: `"25:30:00"` = 1h30 le lendemain)

### Données Nancy Spécifiques

- **Bbox Nancy** : `[6.1, 48.65, 6.25, 48.72]`
- **Dépôt Stan principal** : Dépot Rue marcel brot
- **Lignes majeures** : T1, T2, T3, T4, T5
- **Source GTFS officielle** : [https://data.grandnancy.eu/](https://data.grandnancy.eu/explore/dataset/osm-bus-traces/)