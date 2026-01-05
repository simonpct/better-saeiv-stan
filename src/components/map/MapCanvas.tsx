'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { usePCCStore } from '@/store';
import { getRouteDefinition } from '@/lib/constants/routes';

/**
 * COMPOSANT MAPLIBRE PRINCIPAL
 *
 * Responsabilités:
 * - Init MapLibre avec style
 * - Afficher les bus (layers)
 * - Afficher les tracés de lignes (LineString)
 * - Afficher les arrêts (markers)
 * - Gérer le LOD selon zoom
 * - Interactions (clic, drag)
 */

export default function MapCanvas() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const { vehicles, updateLOD, routes, stops } = usePCCStore();

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

  // Add route layers when map loads
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    const currentMap = map.current;

    // Add source for routes
    if (!currentMap.getSource('routes')) {
      currentMap.addSource('routes', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      // Add layer for route lines
      currentMap.addLayer({
        id: 'route-lines',
        type: 'line',
        source: 'routes',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 4,
          'line-opacity': 0.8,
        },
      });

      // Add layer for route outlines (for better visibility)
      currentMap.addLayer(
        {
          id: 'route-lines-outline',
          type: 'line',
          source: 'routes',
          paint: {
            'line-color': '#000000',
            'line-width': 6,
            'line-opacity': 0.4,
          },
        },
        'route-lines' // Insert below the main line layer
      );
    }

    // Add source for stops
    if (!currentMap.getSource('stops')) {
      currentMap.addSource('stops', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      });

      // Add layer for stop circles
      currentMap.addLayer({
        id: 'stop-circles',
        type: 'circle',
        source: 'stops',
        paint: {
          'circle-radius': 6,
          'circle-color': '#ffffff',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#1e293b',
        },
      });

      // Add layer for stop labels
      currentMap.addLayer({
        id: 'stop-labels',
        type: 'symbol',
        source: 'stops',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 11,
          'text-offset': [0, 1.5],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1,
        },
        minzoom: 14, // Only show labels when zoomed in
      });

      // Click event on stops
      currentMap.on('click', 'stop-circles', (e) => {
        const stopId = e.features?.[0]?.properties?.id;
        const stopName = e.features?.[0]?.properties?.name;
        if (stopId && stopName) {
          // Create popup
          new maplibregl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(`<div class="font-bold">${stopName}</div><div class="text-sm text-gray-400">${stopId}</div>`)
            .addTo(currentMap);
        }
      });

      // Change cursor on hover
      currentMap.on('mouseenter', 'stop-circles', () => {
        currentMap.getCanvas().style.cursor = 'pointer';
      });

      currentMap.on('mouseleave', 'stop-circles', () => {
        currentMap.getCanvas().style.cursor = '';
      });
    }
  }, [isMapLoaded]);

  // Update route geometries when routes change
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    const source = map.current.getSource('routes') as maplibregl.GeoJSONSource;
    if (!source) return;

    // Convert routes to GeoJSON features
    const features = Object.values(routes).map((route) => {
      const routeDef = getRouteDefinition(route.routeId);

      return {
        type: 'Feature' as const,
        geometry: {
          type: 'LineString' as const,
          coordinates: route.activePath,
        },
        properties: {
          routeId: route.routeId,
          direction: route.direction,
          color: routeDef?.color || '#3b82f6',
        },
      };
    });

    source.setData({
      type: 'FeatureCollection',
      features,
    });
  }, [routes, isMapLoaded]);

  // Update stops when stops change
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    const source = map.current.getSource('stops') as maplibregl.GeoJSONSource;
    if (!source) return;

    // Convert stops to GeoJSON features
    const features = Object.values(stops).map((stop) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: stop.position,
      },
      properties: {
        id: stop.id,
        name: stop.name,
        code: stop.code,
      },
    }));

    source.setData({
      type: 'FeatureCollection',
      features,
    });
  }, [stops, isMapLoaded]);

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
