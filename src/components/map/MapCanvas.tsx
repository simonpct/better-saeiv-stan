'use client';

/**
 * COMPOSANT MAPLIBRE PRINCIPAL
 *
 * Responsabilités:
 * - Init MapLibre avec style
 * - Afficher les bus (layers)
 * - Gérer le LOD selon zoom
 * - Interactions (clic, drag)
 *
 * TODO Phase 2: Implémenter MapLibre init
 * TODO Phase 3: Ajouter layers bus (LOD)
 */

export default function MapCanvas() {
  return (
    <div className="w-full h-full bg-slate-900">
      {/* TODO: MapLibre container */}
      <div id="map" className="w-full h-full"></div>
    </div>
  );
}
