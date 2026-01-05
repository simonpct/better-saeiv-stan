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
