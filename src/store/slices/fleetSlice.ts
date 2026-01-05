import { StateCreator } from 'zustand';
import {
  Bus,
  VehicleStatus,
  LODLevel,
  LOD_ZOOM_THRESHOLDS,
  Direction,
  DEFAULT_BUS_SPEED,
} from '@/types';
import { updateBusPosition, hasReachedEnd } from '@/lib/engine/movement';
import type { PCCStore } from '../index';

export interface FleetSlice {
  // State
  vehicles: Record<string, Bus>;
  selectedEntityId: string | null;
  lodLevel: LODLevel;

  // Actions
  updateVehiclesLogic: (deltaTime: number) => void;
  setVehicleStatus: (id: string, status: VehicleStatus) => void;
  toggleDoors: (id: string, doorIndex: number) => void;
  selectEntity: (id: string | null) => void;
  updateLOD: (zoom: number) => void;
  assignBusToRoute: (
    busId: string,
    routeId: string,
    direction: Direction,
    startDistance?: number
  ) => void;
}

export const createFleetSlice: StateCreator<
  PCCStore,
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
      speed: DEFAULT_BUS_SPEED, // Set default speed
      assignedRouteId: 'T1', // Assigned to T1 line
      assignedDirection: 'ALLER',
      distanceOnPath: 0, // Start at beginning
    },
  },
  selectedEntityId: null,
  lodLevel: 'full',

  /**
   * Update vehicle positions along their routes
   * Called every simulation tick
   */
  updateVehiclesLogic: (deltaTime: number) => {
    const state = get();
    const { routes } = state;

    // Update each vehicle
    const updatedVehicles: Record<string, Bus> = {};

    Object.values(state.vehicles).forEach((bus) => {
      // Skip if not in service or not assigned to a route
      if (bus.status !== 'IN_SERVICE' || !bus.assignedRouteId || !bus.assignedDirection) {
        updatedVehicles[bus.id] = bus;
        return;
      }

      // Get the route geometry
      const routeKey = `${bus.assignedRouteId}-${bus.assignedDirection}`;
      const routeGeometry = routes[routeKey];

      if (!routeGeometry?.activePath) {
        // Route not loaded yet, skip
        updatedVehicles[bus.id] = bus;
        return;
      }

      // Get current distance (default to 0 if not set)
      const currentDistance = bus.distanceOnPath ?? 0;

      // Check if bus has reached the end
      if (hasReachedEnd(currentDistance, routeGeometry.activePath)) {
        console.log(`[FleetSlice] Bus ${bus.id} reached end of route ${routeKey}`);
        // For now, just stop the bus
        // TODO Phase 3.13: Implement terminus handling (reverse direction, return to depot, etc.)
        updatedVehicles[bus.id] = {
          ...bus,
          speed: 0,
          status: 'IDLE',
        };
        return;
      }

      // Update bus position using movement engine
      const { updatedBus, newDistanceOnPath } = updateBusPosition(
        bus,
        routeGeometry.activePath,
        deltaTime,
        currentDistance
      );

      // Update distance and odometer
      const distanceTraveledKm = (newDistanceOnPath - currentDistance) / 1000;

      updatedVehicles[bus.id] = {
        ...updatedBus,
        distanceOnPath: newDistanceOnPath,
        telemetry: {
          ...updatedBus.telemetry,
          odometer: updatedBus.telemetry.odometer + distanceTraveledKm,
        },
      };
    });

    // Update state
    set({ vehicles: updatedVehicles });
  },

  /**
   * Assign a bus to a route and direction
   */
  assignBusToRoute: (busId, routeId, direction, startDistance = 0) => {
    set((state) => {
      const bus = state.vehicles[busId];
      if (!bus) {
        console.warn(`[FleetSlice] Bus ${busId} not found`);
        return state;
      }

      console.log(
        `[FleetSlice] Assigning bus ${busId} to route ${routeId} (${direction}), starting at ${startDistance}m`
      );

      return {
        vehicles: {
          ...state.vehicles,
          [busId]: {
            ...bus,
            assignedRouteId: routeId,
            assignedDirection: direction,
            distanceOnPath: startDistance,
            speed: DEFAULT_BUS_SPEED,
            status: 'IN_SERVICE',
          },
        },
      };
    });
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
