/**
 * BUS MOVEMENT ENGINE
 *
 * Gère le mouvement des bus le long des tracés OSM.
 * Utilise Turf.js pour les calculs géographiques.
 */

import * as turf from '@turf/turf';
import { GeoPoint, Bus, BusSegment, DEFAULT_BUS_SPEED } from '@/types';

/**
 * Calculate the new position of a bus along a route path
 *
 * @param currentDistanceOnPath - Current distance along the path (meters)
 * @param speed - Current speed (km/h)
 * @param deltaTime - Time elapsed since last update (seconds)
 * @param path - The route geometry (array of GeoPoints)
 * @returns New distance along the path (meters)
 */
export function calculateNewDistance(
  currentDistanceOnPath: number,
  speed: number,
  deltaTime: number,
  path: GeoPoint[]
): number {
  // Convert speed from km/h to m/s
  const speedMetersPerSecond = (speed * 1000) / 3600;

  // Calculate distance traveled in this tick
  const distanceTraveled = speedMetersPerSecond * deltaTime;

  // New distance along path
  return currentDistanceOnPath + distanceTraveled;
}

/**
 * Get the position and heading of a bus at a specific distance along a path
 *
 * @param distanceOnPath - Distance along the path (meters)
 * @param path - The route geometry (array of GeoPoints)
 * @returns Object with position and heading, or null if invalid
 */
export function getPositionAtDistance(
  distanceOnPath: number,
  path: GeoPoint[]
): { position: GeoPoint; heading: number } | null {
  if (path.length < 2) {
    console.warn('[Movement] Path too short (< 2 points)');
    return null;
  }

  try {
    // Create a LineString from the path
    const line = turf.lineString(path);
    const totalLength = turf.length(line, { units: 'meters' });

    // Clamp distance to path bounds
    const clampedDistance = Math.max(0, Math.min(distanceOnPath, totalLength));

    // Get point at distance along line
    const point = turf.along(line, clampedDistance, { units: 'meters' });
    const position = point.geometry.coordinates as GeoPoint;

    // Calculate heading (bearing)
    // We need two points to calculate bearing - current point and a point slightly ahead
    const lookAheadDistance = Math.min(10, totalLength - clampedDistance); // 10 meters ahead
    const nextPoint = turf.along(line, clampedDistance + lookAheadDistance, {
      units: 'meters',
    });

    const heading = turf.bearing(point, nextPoint);

    // Convert from -180/180 to 0-360
    const normalizedHeading = (heading + 360) % 360;

    return {
      position,
      heading: normalizedHeading,
    };
  } catch (error) {
    console.error('[Movement] Error calculating position:', error);
    return null;
  }
}

/**
 * Update a bus's position along its assigned route
 *
 * @param bus - The bus to update
 * @param path - The route geometry
 * @param deltaTime - Time elapsed (seconds)
 * @param currentDistanceOnPath - Current distance along path (meters)
 * @returns Updated bus and new distance on path
 */
export function updateBusPosition(
  bus: Bus,
  path: GeoPoint[],
  deltaTime: number,
  currentDistanceOnPath: number
): { updatedBus: Bus; newDistanceOnPath: number } {
  // Calculate new distance
  const newDistance = calculateNewDistance(
    currentDistanceOnPath,
    bus.speed,
    deltaTime,
    path
  );

  // Get position and heading at new distance
  const positionData = getPositionAtDistance(newDistance, path);

  if (!positionData) {
    // Return unchanged if we can't calculate position
    return { updatedBus: bus, newDistanceOnPath: currentDistanceOnPath };
  }

  // Update the bus segments (for now, only update the first segment - tracteur)
  // TODO Phase 3.9: Calculate articulated segment positions
  const updatedSegments: BusSegment[] = bus.segments.map((segment, index) => {
    if (index === 0) {
      // Update tracteur (first segment)
      return {
        ...segment,
        currentPosition: positionData.position,
        currentHeading: positionData.heading,
      };
    }
    // For articulated buses, keep other segments unchanged for now
    return segment;
  });

  const updatedBus: Bus = {
    ...bus,
    segments: updatedSegments,
  };

  return {
    updatedBus,
    newDistanceOnPath: newDistance,
  };
}

/**
 * Check if a bus has reached the end of its route
 *
 * @param distanceOnPath - Current distance (meters)
 * @param path - The route geometry
 * @param threshold - Distance threshold from end (meters, default 50m)
 * @returns True if bus is at the end
 */
export function hasReachedEnd(
  distanceOnPath: number,
  path: GeoPoint[],
  threshold: number = 50
): boolean {
  if (path.length < 2) return true;

  try {
    const line = turf.lineString(path);
    const totalLength = turf.length(line, { units: 'meters' });

    return distanceOnPath >= totalLength - threshold;
  } catch (error) {
    console.error('[Movement] Error checking end of route:', error);
    return false;
  }
}

/**
 * Get the total length of a path
 *
 * @param path - The route geometry
 * @returns Total length in meters
 */
export function getPathLength(path: GeoPoint[]): number {
  if (path.length < 2) return 0;

  try {
    const line = turf.lineString(path);
    return turf.length(line, { units: 'meters' });
  } catch (error) {
    console.error('[Movement] Error calculating path length:', error);
    return 0;
  }
}
