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
  assignedRouteId?: string; // ID de la ligne (ex: "L1", "T1")
  assignedDirection?: Direction; // Sens de circulation actuel
  assignedTripId?: string; // ID du trip GTFS en cours
  currentStopIndex?: number; // Index de l'arrêt actuel dans le tracé
  activePath?: GeoPoint[]; // Tracé actif suivi (avec déviations appliquées)
  distanceOnPath?: number; // Distance parcourue sur le tracé actif (en mètres)
  parkingSpaceId?: string; // ID OSM de la place de parking (si IDLE)
  speed: number; // km/h
}

// ============================================================================
// OSM & RÉSEAU
// ============================================================================

/**
 * Direction d'une ligne
 */
export type Direction = 'ALLER' | 'RETOUR';

/**
 * Arrêt de bus (depuis OSM ou GTFS)
 */
export interface Stop {
  id: string; // ID unique (peut être OSM node ID ou GTFS stop_id)
  osmId?: string; // ID du node OSM si disponible
  name: string;
  position: GeoPoint;
  code?: string; // Code physique affiché à l'arrêt (ex: "STA001")
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
  direction: Direction; // Sens du trip
  serviceId: string; // Calendrier (weekday, weekend, etc.)
  stopTimes: StopTime[];
  shapeId?: string;
}

/**
 * Définition d'une ligne de transport
 * Utilisée pour la liste hard-coded des lignes Stan
 */
export interface RouteDefinition {
  id: string; // ID interne (ex: "L1", "T1")
  shortName: string; // Nom court : "1", "T1", "A"
  longName: string; // Nom complet : "Ligne 1 : Essey-lès-Nancy - Villers"
  type: 'tram' | 'bus' | 'trolleybus'; // Type de véhicule
  color: string; // Couleur hex "#FF6600"
  textColor: string; // Couleur texte "#FFFFFF"
  osmRelations: {
    aller: number; // ID de la relation OSM pour l'aller
    retour: number; // ID de la relation OSM pour le retour
  };
}

/**
 * Relation OSM parsée depuis Overpass
 */
export interface OSMRelation {
  id: number; // ID de la relation OSM
  routeId: string; // Lien vers RouteDefinition
  direction: Direction;
  path: GeoPoint[]; // LineString coordinates du tracé
  stops: string[]; // IDs des stops dans l'ordre
  distance: number; // Distance totale en mètres
  fetchedAt: Date; // Timestamp du cache
}

/**
 * Géométrie active d'une route (avec déviations appliquées)
 */
export interface RouteGeometry {
  routeId: string;
  direction: Direction;
  osmRelationId: number; // Relation OSM source
  basePath: GeoPoint[]; // Tracé OSM original
  activePath: GeoPoint[]; // Tracé actif (avec déviations si applicable)
  stops: string[]; // IDs des stops dans l'ordre
  activeDeviations: string[]; // IDs des déviations actives sur ce tracé
}

/**
 * Segment de déviation
 * Permet de définir précisément où commence et finit la déviation
 */
export interface DeviationSegment {
  startPointIndex: number; // Index dans le path original
  endPointIndex: number; // Index dans le path original
  alternativePath: GeoPoint[]; // Nouveau tracé entre ces 2 points
}

/**
 * Déviation de tracé (modification temporaire)
 */
export interface Deviation {
  id: string;
  routeId: string;
  direction: Direction; // La déviation s'applique à un sens spécifique
  segment: DeviationSegment;
  reason?: string; // Raison de la déviation (travaux, accident, etc.)
  active: boolean;
  createdAt: Date;
  createdBy?: string; // ID du régulateur qui l'a créée
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
 * Réponse de l'API /api/routes (liste des lignes Stan)
 */
export interface RoutesListResponse {
  routes: RouteDefinition[];
  totalCount: number;
}

/**
 * Réponse de l'API /api/osm/overpass (tracé OSM d'une ligne)
 */
export interface OSMRouteResponse {
  route: RouteDefinition;
  relations: {
    aller: OSMRelation;
    retour: OSMRelation;
  };
  stops: Stop[];
}

/**
 * Réponse de l'API /api/gtfs/route/[id] (données GTFS pour horaires)
 */
export interface GTFSRouteDetailResponse {
  route: RouteDefinition;
  trips: Trip[];
  stops: Stop[];
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
