import { StateCreator } from 'zustand';
import { Bus, VehicleStatus, LODLevel, LOD_ZOOM_THRESHOLDS } from '@/types';

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
  FleetSlice,
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
    // À implémenter en Phase 2
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
    set((state) => {
      const vehicle = state.vehicles[id];
      if (!vehicle) return state;

      const newDoors = [...vehicle.telemetry.doors];
      newDoors[doorIndex] = !newDoors[doorIndex];

      return {
        vehicles: {
          ...state.vehicles,
          [id]: {
            ...vehicle,
            telemetry: {
              ...vehicle.telemetry,
              doors: newDoors,
            },
          },
        },
      };
    });
  },

  selectEntity: (id) => {
    set({ selectedEntityId: id });
  },

  updateLOD: (zoom) => {
    const level: LODLevel =
      zoom >= LOD_ZOOM_THRESHOLDS.FULL
        ? 'full'
        : zoom >= LOD_ZOOM_THRESHOLDS.SIMPLIFIED
        ? 'simplified'
        : 'minimal';
    set({ lodLevel: level });
  },
});
