# 🗺️ ARCHITECTURE OSM/OVERPASS

**Date** : 2026-01-05
**Status** : Architecture définie, à implémenter en Phase 3.2

---

## 📐 PRINCIPE GÉNÉRAL

Le SAEIV utilise **OpenStreetMap** comme source de données géographiques pour les tracés des lignes de transport, via l'**Overpass API**.

### Pourquoi OSM plutôt que GTFS shapes ?

✅ **Avantages** :
- Données géographiques précises et maintenues par la communauté
- Relations OSM = tracés officiels des lignes Stan
- 1 relation par sens (aller/retour) → facile à gérer
- Attributs routiers disponibles (vitesse max, nom des rues, etc.)
- Gestion native des déviations (remplacement de segments)

❌ **GTFS shapes.txt** :
- Souvent absent ou approximatif
- Pas de distinction claire aller/retour
- Difficile à maintenir
- Pas d'attributs routiers

---

## 🏗️ ARCHITECTURE

### 1. **Liste Hard-Coded des Lignes**

**Fichier** : [src/lib/constants/routes.ts](src/lib/constants/routes.ts)

```typescript
export const STAN_ROUTES: Record<string, RouteDefinition> = {
  T1: {
    id: 'T1',
    shortName: 'T1',
    longName: 'Tram 1 : Essey - Brabois',
    type: 'tram',
    color: '#0066CC',
    textColor: '#FFFFFF',
    osmRelations: {
      aller: 1234567,  // ⚠️ ID réel à récupérer sur OSM
      retour: 1234568, // ⚠️ ID réel à récupérer sur OSM
    },
  },
  // ... autres lignes
};
```

**Rôle** :
- Référence unique des lignes du réseau
- Lien vers les relations OSM (aller + retour)
- Métadonnées (nom, couleur, type)

---

### 2. **API Overpass**

**Endpoint** : `/api/osm/overpass`
**Fichier** : `app/api/osm/overpass/route.ts`

**Requête** :
```typescript
GET /api/osm/overpass?routeId=L1&direction=ALLER
```

**Workflow** :
1. Récupère l'ID de la relation OSM depuis `STAN_ROUTES[routeId].osmRelations[direction]`
2. Interroge Overpass API :
   ```
   [out:json];
   relation(1234567);
   (._;>;);
   out geom;
   ```
3. Parse la réponse :
   - Assemble les `ways` en `LineString` GeoJSON
   - Extrait les `nodes` de type `stop` → arrêts
4. Met en cache (15 min)
5. Retourne `OSMRelation`

**Réponse** :
```typescript
{
  id: 1234567,
  routeId: "L1",
  direction: "ALLER",
  path: [[6.18, 48.68], [6.19, 48.69], ...],
  stops: ["stop-001", "stop-002", ...],
  distance: 12500, // mètres
  fetchedAt: "2026-01-05T10:00:00Z"
}
```

---

### 3. **Géométries de Routes**

**Type** : `RouteGeometry`

```typescript
{
  routeId: "L1",
  direction: "ALLER",
  osmRelationId: 1234567,
  basePath: [...],          // Tracé OSM original
  activePath: [...],        // Tracé actif (avec déviations)
  stops: [...],
  activeDeviations: ["dev-001", "dev-002"]
}
```

**Store** : `networkSlice.ts`

```typescript
routes: Record<string, RouteGeometry>
```

**Chargement** :
```typescript
await loadRoute("L1", "ALLER");
// → Fetch depuis /api/osm/overpass
// → Parse et store dans networkSlice.routes["L1-ALLER"]
```

---

### 4. **Déviations**

**Type** : `Deviation`

```typescript
{
  id: "dev-001",
  routeId: "L1",
  direction: "ALLER",
  segment: {
    startPointIndex: 120,  // Index dans basePath
    endPointIndex: 180,    // Index dans basePath
    alternativePath: [...]  // Nouveau tracé entre ces 2 points
  },
  reason: "Travaux rue Saint-Jean",
  active: true,
  createdAt: Date,
  createdBy: "regulateur-001"
}
```

**Application** :
```typescript
function applyDeviations(basePath: GeoPoint[], deviations: Deviation[]): GeoPoint[] {
  let activePath = [...basePath];

  // Trier par ordre décroissant pour éviter conflits d'index
  const sorted = deviations
    .filter(d => d.active)
    .sort((a, b) => b.segment.startPointIndex - a.segment.startPointIndex);

  for (const dev of sorted) {
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

---

### 5. **Mouvement des Bus**

**Type** : `Bus`

```typescript
{
  id: "bus-001",
  assignedRouteId: "L1",
  assignedDirection: "ALLER",
  activePath: [...],        // Tracé à suivre (avec déviations)
  distanceOnPath: 3450,     // Mètres parcourus depuis le début
  currentStopIndex: 5,      // Arrêt actuel
  speed: 30,                // km/h
  ...
}
```

**Algorithme** (Phase 3.1) :
```typescript
function updateBusPosition(bus: Bus, deltaTime: number) {
  // Convertir km/h → m/s
  const speedMs = (bus.speed * 1000) / 3600;

  // Incrémenter distance
  bus.distanceOnPath += speedMs * deltaTime;

  // Calculer position sur le tracé
  const lineString = turf.lineString(bus.activePath);
  const totalDistance = turf.length(lineString, { units: 'meters' });

  if (bus.distanceOnPath >= totalDistance) {
    // Terminus atteint
    bus.status = 'IDLE';
    bus.distanceOnPath = totalDistance;
  }

  // Position actuelle
  const currentPoint = turf.along(lineString, bus.distanceOnPath, { units: 'meters' });
  bus.segments[0].currentPosition = currentPoint.geometry.coordinates as GeoPoint;

  // Heading (angle de déplacement)
  const nextPoint = turf.along(lineString, bus.distanceOnPath + 10, { units: 'meters' });
  bus.segments[0].currentHeading = turf.bearing(currentPoint, nextPoint);
}
```

---

## 🔄 WORKFLOW COMPLET

### Initialisation d'une ligne

1. **Chargement des données OSM**
   ```typescript
   // Phase 3.2
   const { aller, retour } = await loadRouteFromOSM("L1");
   ```

2. **Stockage dans NetworkSlice**
   ```typescript
   set({
     routes: {
       "L1-ALLER": aller,
       "L1-RETOUR": retour
     }
   });
   ```

3. **Affectation des bus**
   ```typescript
   // Phase 3.1
   bus.assignedRouteId = "L1";
   bus.assignedDirection = "ALLER";
   bus.activePath = routes["L1-ALLER"].activePath;
   bus.distanceOnPath = 0;
   ```

### Création d'une déviation

1. **Régulateur dessine sur la carte** (Phase 3.12)
   ```typescript
   const deviation = {
     id: "dev-001",
     routeId: "L1",
     direction: "ALLER",
     segment: {
       startPointIndex: 120,
       endPointIndex: 180,
       alternativePath: [...points dessinés]
     },
     reason: "Travaux",
     active: true
   };
   ```

2. **Ajout au store**
   ```typescript
   networkSlice.addDeviation(deviation);
   ```

3. **Recalcul du tracé actif**
   ```typescript
   const route = routes["L1-ALLER"];
   route.activePath = applyDeviations(route.basePath, route.activeDeviations);
   ```

4. **Mise à jour des bus en service**
   ```typescript
   // Tous les bus sur L1-ALLER reçoivent le nouveau tracé
   for (const bus of buses.filter(b => b.assignedRouteId === "L1" && b.assignedDirection === "ALLER")) {
     bus.activePath = route.activePath;
     // Ajuster distanceOnPath si nécessaire
   }
   ```

---

## 📊 DONNÉES OSM REQUISES

### Relations OSM à récupérer

Pour chaque ligne Stan, trouver les 2 relations (aller + retour) :

**Méthode** :
1. Aller sur https://overpass-turbo.eu
2. Requête :
   ```
   [out:json][timeout:25];
   relation["network"="Stan"]["ref"="1"];
   out geom;
   ```
3. Noter les IDs des relations
4. Remplir dans `lib/constants/routes.ts`

**Exemple pour Ligne 1** :
- Relation aller : `1234567` (Nancy Gare → Jarville)
- Relation retour : `1234568` (Jarville → Nancy Gare)

### Arrêts

Extraire depuis les relations OSM :
- Nodes avec `public_transport=stop_position`
- Ou members de type `node` avec role `stop`

**Compléter avec GTFS** :
- Coordonnées précises si absentes d'OSM
- Codes arrêts, noms normalisés
- Horaires (stop_times.txt)

---

## ⚡ PERFORMANCE

### Cache

**Stratégie** :
1. **Serveur** : Cache en mémoire (Map) – 15 min
2. **Client** : IndexedDB – 24h
3. **Invalidation** : Manuel ou webhooks OSM

**Implémentation** :
```typescript
const cache = new Map<string, { data: OSMRelation, expiry: number }>();

async function fetchFromOverpass(relationId: number) {
  const cacheKey = `osm-${relationId}`;
  const cached = cache.get(cacheKey);

  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }

  const data = await queryOverpass(relationId);
  cache.set(cacheKey, {
    data,
    expiry: Date.now() + 15 * 60 * 1000 // 15 min
  });

  return data;
}
```

### Rate Limiting Overpass

**Limites** :
- 2 requêtes/seconde max
- Utiliser un queue system si besoin

```typescript
class OverpassQueue {
  private queue: Array<() => Promise<any>> = [];
  private isProcessing = false;

  async add(query: () => Promise<any>) {
    this.queue.push(query);
    if (!this.isProcessing) this.process();
  }

  private async process() {
    this.isProcessing = true;
    while (this.queue.length > 0) {
      const query = this.queue.shift()!;
      await query();
      await new Promise(r => setTimeout(r, 500)); // 2/sec max
    }
    this.isProcessing = false;
  }
}
```

---

## 🚀 PROCHAINES ÉTAPES

### Phase 3.2 : Implémenter l'API Overpass

1. Créer `app/api/osm/overpass/route.ts`
2. Parser les relations OSM → GeoJSON
3. Implémenter le cache
4. Tester avec une ligne réelle

### Phase 3.1 : Mouvement des bus

1. Utiliser `turf.along()` pour suivre le tracé
2. Mettre à jour `distanceOnPath` chaque tick
3. Gérer l'arrivée au terminus

### Phase 3.12 : Interface déviations

1. Mode dessin sur MapLibre
2. Calcul des index de segment
3. Application des déviations au tracé actif

---

**Documentation maintenue à jour**
Dernière modification : 2026-01-05
