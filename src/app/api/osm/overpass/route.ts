/**
 * API OVERPASS - RÉCUPÉRATION DES TRACÉS OSM
 *
 * Endpoint: GET /api/osm/overpass?routeId=T1&direction=aller
 *
 * Récupère le tracé géographique d'une ligne Stan depuis OpenStreetMap
 * via l'API Overpass. Les résultats sont cachés en mémoire (15 min).
 *
 * Query params:
 * - routeId: ID de la ligne (T1, T2, etc.)
 * - direction: 'aller' ou 'retour'
 *
 * Response:
 * {
 *   routeId: string;
 *   direction: string;
 *   geometry: GeoPoint[]; // LineString coordinates
 *   stops: Stop[];
 *   totalDistance: number; // mètres
 *   source: 'cache' | 'overpass';
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRouteDefinition } from '@/lib/constants/routes';
import type { GeoPoint, Stop } from '@/types';

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
// Utiliser l'instance française d'Overpass (plus rapide pour Nancy)
const OVERPASS_ENDPOINT = 'https://overpass.kumi.systems/api/interpreter';
const REQUEST_TIMEOUT = 60000; // 60 secondes (relations OSM peuvent être grosses)

interface CacheEntry {
  data: OverpassRouteResponse;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

// ============================================================================
// TYPES
// ============================================================================

interface OverpassRouteResponse {
  routeId: string;
  direction: string;
  geometry: GeoPoint[];
  stops: Stop[];
  totalDistance: number;
  source: 'cache' | 'overpass';
}

interface OSMNode {
  type: 'node';
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

interface OSMWay {
  type: 'way';
  id: number;
  nodes: number[];
  tags?: Record<string, string>;
  geometry?: Array<{ lat: number; lon: number }>;
}

interface OSMRelation {
  type: 'relation';
  id: number;
  members: Array<{
    type: 'node' | 'way' | 'relation';
    ref: number;
    role: string;
  }>;
  tags?: Record<string, string>;
}

interface OverpassResponse {
  version: number;
  elements: Array<OSMNode | OSMWay | OSMRelation>;
}

// ============================================================================
// OVERPASS QUERY BUILDER
// ============================================================================

/**
 * Construit une requête Overpass pour récupérer une relation complète
 * avec sa géométrie et ses membres
 */
function buildOverpassQuery(relationId: number): string {
  return `
[out:json][timeout:50];
relation(${relationId});
(._;>;);
out geom;
  `.trim();
}

// ============================================================================
// OSM PARSER
// ============================================================================

/**
 * Parse une réponse Overpass et extrait le tracé + les arrêts
 */
function parseOverpassResponse(
  response: OverpassResponse,
  routeId: string,
  direction: string
): Omit<OverpassRouteResponse, 'source'> {
  const { elements } = response;

  // 1. Identifier la relation principale
  const relation = elements.find(
    (el): el is OSMRelation => el.type === 'relation'
  );

  if (!relation) {
    throw new Error('No relation found in Overpass response');
  }

  // 2. Extraire les ways qui composent le tracé
  const wayMembers = relation.members
    .filter((m) => m.type === 'way' && (m.role === '' || m.role === 'forward' || m.role === 'backward'))
    .map((m) => m.ref);

  // 3. Récupérer les géométries des ways
  const ways = elements.filter(
    (el): el is OSMWay => el.type === 'way' && wayMembers.includes(el.id)
  );

  // 4. Assembler le LineString en respectant l'ordre des ways
  const geometry: GeoPoint[] = [];
  const wayMap = new Map(ways.map((w) => [w.id, w]));

  for (const wayRef of wayMembers) {
    const way = wayMap.get(wayRef);
    if (way && way.geometry) {
      // Convertir les coords OSM [lat, lon] en GeoJSON [lon, lat]
      const coords: GeoPoint[] = way.geometry.map(
        (point) => [point.lon, point.lat] as GeoPoint
      );

      // Éviter les doublons au point de jonction
      if (geometry.length > 0 && coords.length > 0) {
        const lastPoint = geometry[geometry.length - 1];
        const firstPoint = coords[0];
        // Si le dernier point == premier point du way suivant, on skip
        if (lastPoint[0] === firstPoint[0] && lastPoint[1] === firstPoint[1]) {
          geometry.push(...coords.slice(1));
        } else {
          geometry.push(...coords);
        }
      } else {
        geometry.push(...coords);
      }
    }
  }

  // 5. Extraire les arrêts (nodes avec role='stop' ou tag public_transport)
  const stopNodeRefs = relation.members
    .filter((m) => m.type === 'node' && (m.role === 'stop' || m.role === 'platform'))
    .map((m) => m.ref);

  const stopNodes = elements.filter(
    (el): el is OSMNode => el.type === 'node' && stopNodeRefs.includes(el.id)
  );

  const stops: Stop[] = stopNodes.map((node) => ({
    id: `osm-node-${node.id}`,
    name: node.tags?.name || node.tags?.['ref:FR:STAN'] || `Arrêt ${node.id}`,
    position: [node.lon, node.lat] as GeoPoint,
    code: node.tags?.['ref:FR:STAN'] || node.tags?.ref,
  }));

  // 6. Calculer la distance totale (approximation simple)
  let totalDistance = 0;
  for (let i = 1; i < geometry.length; i++) {
    const [lon1, lat1] = geometry[i - 1];
    const [lon2, lat2] = geometry[i];
    // Distance euclidienne approximative (pour un LineString OSM c'est suffisant)
    const dx = (lon2 - lon1) * 111320 * Math.cos((lat1 * Math.PI) / 180);
    const dy = (lat2 - lat1) * 110540;
    totalDistance += Math.sqrt(dx * dx + dy * dy);
  }

  return {
    routeId,
    direction,
    geometry,
    stops,
    totalDistance,
  };
}

// ============================================================================
// CACHE HELPERS
// ============================================================================

function getCacheKey(routeId: string, direction: string): string {
  return `${routeId}-${direction}`;
}

function getFromCache(routeId: string, direction: string): OverpassRouteResponse | null {
  const key = getCacheKey(routeId, direction);
  const entry = cache.get(key);

  if (!entry) return null;

  // Vérifier si le cache est expiré
  const age = Date.now() - entry.timestamp;
  if (age > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return { ...entry.data, source: 'cache' };
}

function setCache(routeId: string, direction: string, data: OverpassRouteResponse): void {
  const key = getCacheKey(routeId, direction);
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

// ============================================================================
// API HANDLER
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // 1. Valider les paramètres
    const { searchParams } = new URL(request.url);
    const routeId = searchParams.get('routeId');
    const direction = searchParams.get('direction');

    if (!routeId || !direction) {
      return NextResponse.json(
        { error: 'Missing required parameters: routeId and direction' },
        { status: 400 }
      );
    }

    if (direction !== 'aller' && direction !== 'retour') {
      return NextResponse.json(
        { error: 'direction must be "aller" or "retour"' },
        { status: 400 }
      );
    }

    // 2. Récupérer la définition de la ligne
    const routeDef = getRouteDefinition(routeId);
    if (!routeDef) {
      return NextResponse.json(
        { error: `Unknown route: ${routeId}` },
        { status: 404 }
      );
    }

    // 3. Vérifier le cache
    const cached = getFromCache(routeId, direction);
    if (cached) {
      console.log(`[Overpass] Cache HIT for ${routeId} ${direction}`);
      return NextResponse.json(cached);
    }

    // 4. Récupérer l'ID de la relation OSM
    const osmRelationId = routeDef.osmRelations[direction];
    console.log(`[Overpass] Fetching relation ${osmRelationId} for ${routeId} ${direction}`);

    // 5. Construire et exécuter la requête Overpass
    const query = buildOverpassQuery(osmRelationId);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(OVERPASS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status} ${response.statusText}`);
    }

    const overpassData: OverpassResponse = await response.json();

    // 6. Parser la réponse
    const parsed = parseOverpassResponse(overpassData, routeId, direction);

    const result: OverpassRouteResponse = {
      ...parsed,
      source: 'overpass',
    };

    // 7. Mettre en cache
    setCache(routeId, direction, result);

    console.log(
      `[Overpass] SUCCESS: ${result.geometry.length} points, ${result.stops.length} stops, ${(result.totalDistance / 1000).toFixed(2)} km`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Overpass] Error:', error);

    // Gestion des erreurs spécifiques
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout (30s exceeded)' },
          { status: 504 }
        );
      }

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
