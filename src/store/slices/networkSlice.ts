import { StateCreator } from 'zustand';
import { RouteGeometry, Stop, Deviation, Direction, GeoPoint } from '@/types';
import { getRouteDefinition } from '@/lib/constants/routes';

export interface NetworkSlice {
  // State
  routes: Record<string, RouteGeometry>;
  stops: Record<string, Stop>;
  activeDeviations: Deviation[];
  selectedRouteId: string | null;
  loadingRoutes: Record<string, boolean>; // Track loading state per route
  routeErrors: Record<string, string | null>; // Track errors per route

  // Actions
  loadRoute: (routeId: string, direction: Direction) => Promise<void>;
  addDeviation: (routeId: string, deviation: Deviation) => void;
  selectRoute: (routeId: string | null) => void;
}

/**
 * Response type from /api/osm/overpass endpoint
 */
interface OverpassAPIResponse {
  routeId: string;
  direction: string;
  geometry: GeoPoint[];
  stops: Stop[];
  totalDistance: number;
  source: 'cache' | 'overpass';
}

export const createNetworkSlice: StateCreator<
  NetworkSlice,
  [],
  [],
  NetworkSlice
> = (set, get) => ({
  routes: {},
  stops: {},
  activeDeviations: [],
  selectedRouteId: null,
  loadingRoutes: {},
  routeErrors: {},

  /**
   * Load a route from OSM Overpass API
   * Fetches the route geometry and stops, stores them in the state
   */
  loadRoute: async (routeId: string, direction: Direction) => {
    const routeKey = `${routeId}-${direction}`;

    // Check if already loaded
    if (get().routes[routeKey]) {
      console.log(`[NetworkSlice] Route ${routeKey} already loaded, skipping`);
      return;
    }

    // Check if route definition exists
    const routeDef = getRouteDefinition(routeId);
    if (!routeDef) {
      const error = `Route ${routeId} not found in route definitions`;
      console.error(`[NetworkSlice] ${error}`);
      set((state) => ({
        routeErrors: { ...state.routeErrors, [routeKey]: error },
      }));
      return;
    }

    // Set loading state
    set((state) => ({
      loadingRoutes: { ...state.loadingRoutes, [routeKey]: true },
      routeErrors: { ...state.routeErrors, [routeKey]: null },
    }));

    try {
      // Fetch from Overpass API
      const directionParam = direction.toLowerCase(); // 'aller' or 'retour'
      const url = `/api/osm/overpass?routeId=${routeId}&direction=${directionParam}`;

      console.log(`[NetworkSlice] Fetching route ${routeKey} from ${url}`);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: OverpassAPIResponse = await response.json();

      console.log(
        `[NetworkSlice] Loaded ${routeKey}: ${data.geometry.length} points, ` +
        `${data.stops.length} stops, ${(data.totalDistance / 1000).toFixed(2)} km ` +
        `(source: ${data.source})`
      );

      // Get OSM relation ID
      const osmRelationId = direction === 'ALLER'
        ? routeDef.osmRelations.aller
        : routeDef.osmRelations.retour;

      // Create RouteGeometry object
      const routeGeometry: RouteGeometry = {
        routeId,
        direction,
        osmRelationId,
        basePath: data.geometry,
        activePath: data.geometry, // Initially same as basePath (no deviations)
        stops: data.stops.map(s => s.id),
        activeDeviations: [],
      };

      // Store stops in the stops record
      const newStops: Record<string, Stop> = {};
      data.stops.forEach(stop => {
        newStops[stop.id] = stop;
      });

      // Update state
      set((state) => ({
        routes: { ...state.routes, [routeKey]: routeGeometry },
        stops: { ...state.stops, ...newStops },
        loadingRoutes: { ...state.loadingRoutes, [routeKey]: false },
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[NetworkSlice] Failed to load route ${routeKey}:`, errorMessage);

      set((state) => ({
        loadingRoutes: { ...state.loadingRoutes, [routeKey]: false },
        routeErrors: { ...state.routeErrors, [routeKey]: errorMessage },
      }));
    }
  },

  addDeviation: (_routeId, deviation) => {
    set((state) => ({
      activeDeviations: [...state.activeDeviations, deviation],
    }));
  },

  selectRoute: (routeId) => {
    set({ selectedRouteId: routeId });
  },
});
