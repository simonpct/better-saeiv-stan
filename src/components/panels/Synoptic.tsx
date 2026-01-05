'use client';

/**
 * SYNOPTIC - VUE LINÉAIRE DE LA LIGNE
 *
 * Panneau rétractable en bas de l'écran qui affiche la ligne "à plat"
 * pour visualiser l'espacement entre les bus et faciliter la régulation.
 *
 * Comportement:
 * - Se déplie automatiquement lors de la sélection d'une ligne
 * - Affiche les arrêts de la ligne de manière linéaire (gauche à droite)
 * - Affiche les bus positionnés sur leur portion de ligne
 * - Permet de visualiser le cadencement (espacement régulier ou irrégulier)
 *
 * TODO Phase 2 (Régulation): Implémenter la vue linéaire
 * TODO Phase 2: Connecter au selectedRouteId du NetworkStore
 * TODO Phase 2: Calculer positions relatives des bus sur la ligne
 * TODO Phase 3: Ajouter indicateurs de retard/avance
 * TODO Phase 3: Animation smooth des bus sur le synoptique
 */

import { useState } from 'react';

export default function Synoptic() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-ops-panel border-t border-ops-border transition-all duration-300 ${
        isExpanded ? 'h-32' : 'h-8'
      }`}
    >
      {/* Toggle header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full h-8 flex items-center justify-between px-4 hover:bg-ops-border/30 transition-colors"
      >
        <span className="text-sm font-semibold">
          Synoptique {isExpanded ? '▼' : '▲'}
        </span>
        <span className="text-xs text-gray-400">
          {isExpanded ? 'Cliquer pour réduire' : 'Vue linéaire de la ligne'}
        </span>
      </button>

      {/* Content (only visible when expanded) */}
      {isExpanded && (
        <div className="h-24 p-4 overflow-x-auto">
          <div className="text-sm text-gray-400">
            Sélectionnez une ligne pour afficher la vue linéaire
          </div>
          {/* TODO Phase 2: Afficher ici la timeline avec arrêts et bus */}
        </div>
      )}
    </div>
  );
}
