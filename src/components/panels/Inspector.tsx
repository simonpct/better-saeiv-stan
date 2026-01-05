'use client';

/**
 * INSPECTOR PANEL
 *
 * Affiche les détails de l'entité sélectionnée (bus, arrêt, etc.)
 *
 * TODO Phase 2: Afficher télémétrie du bus
 * TODO Phase 3: Afficher infos arrêt
 */

export default function Inspector() {
  return (
    <div className="h-full p-4">
      <h2 className="text-lg font-bold mb-4">Inspector</h2>
      <p className="text-sm text-gray-400">Sélectionnez une entité sur la carte</p>
    </div>
  );
}
