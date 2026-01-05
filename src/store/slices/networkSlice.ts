import { StateCreator } from 'zustand';
import { RouteGeometry, Stop, Deviation } from '@/types';

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
  NetworkSlice,
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
    // À implémenter en Phase 3
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
