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
  // Bus de test statique à Nancy - Place Stanislas
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
        alerts: {
          abs: false,
          overheat: false,
        },
        odometer: 12450,
      },
      speed: 0,
    },
  },
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
