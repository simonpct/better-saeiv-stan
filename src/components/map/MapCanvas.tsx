'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { usePCCStore } from '@/store';

/**
 * COMPOSANT MAPLIBRE PRINCIPAL
 *
 * Responsabilités:
 * - Init MapLibre avec style
 * - Afficher les bus (layers)
 * - Gérer le LOD selon zoom
 * - Interactions (clic, drag)
 */

export default function MapCanvas() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const { vehicles, updateLOD } = usePCCStore();

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://api.maptiler.com/maps/019b84b4-d9a6-77b2-bdfc-ebaba7957a4b/style.json?key=BPzMB1jeMqToVdXDvhUP',
      center: [6.18, 48.68], // Nancy - Place Stanislas
      zoom: 13,
      pitch: 0,
      bearing: 0,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Add scale
    map.current.addControl(
      new maplibregl.ScaleControl({
        maxWidth: 100,
        unit: 'metric',
      }),
      'bottom-left'
    );

    // Map loaded event
    map.current.on('load', () => {
      setIsMapLoaded(true);
    });

    // Update LOD on zoom
    map.current.on('zoom', () => {
      if (map.current) {
        updateLOD(map.current.getZoom());
      }
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [updateLOD]);

  // Add bus layer on map load
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    const currentMap = map.current;

    // Add source for buses
    if (!currentMap.getSource('fleet')) {
      currentMap.addSource('fleet', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      // Add layer for buses
      currentMap.addLayer({
        id: 'buses',
        type: 'circle',
        source: 'fleet',
        paint: {
          'circle-radius': 10,
          'circle-color': '#3b82f6',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      // Click event on buses
      currentMap.on('click', 'buses', (e) => {
        const busId = e.features?.[0]?.properties?.id;
        if (busId) {
          usePCCStore.getState().selectEntity(busId);
        }
      });

      // Change cursor on hover
      currentMap.on('mouseenter', 'buses', () => {
        currentMap.getCanvas().style.cursor = 'pointer';
      });

      currentMap.on('mouseleave', 'buses', () => {
        currentMap.getCanvas().style.cursor = '';
      });
    }
  }, [isMapLoaded]);

  // Update bus positions when vehicles change
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    const source = map.current.getSource('fleet') as maplibregl.GeoJSONSource;
    if (!source) return;

    // Convert vehicles to GeoJSON features
    const features = Object.values(vehicles).map((bus) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: bus.segments[0].currentPosition,
      },
      properties: {
        id: bus.id,
        type: bus.type,
        status: bus.status,
        speed: bus.speed,
      },
    }));

    source.setData({
      type: 'FeatureCollection',
      features,
    });
  }, [vehicles, isMapLoaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Loading indicator */}
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-ops-bg">
          <div className="text-ops-text">Chargement de la carte...</div>
        </div>
      )}
    </div>
  );
}
