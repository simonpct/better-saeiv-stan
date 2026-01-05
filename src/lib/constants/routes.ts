/**
 * DÉFINITIONS DES LIGNES STAN NANCY - TEMPO
 *
 * Liste hard-coded des lignes Tempo du réseau Stan avec leurs relations OSM.
 * Chaque ligne a 2 relations : une pour l'aller, une pour le retour.
 *
 * Les lignes Tempo sont des lignes de bus à haut niveau de service.
 */

import { RouteDefinition } from '@/types';

/**
 * Lignes Tempo du réseau Stan Nancy
 */
export const STAN_ROUTES: Record<string, RouteDefinition> = {
  // ========================================
  // LIGNES TEMPO
  // ========================================
  T1: {
    id: 'T1',
    shortName: 'T1',
    longName: 'Tempo 1 : Essey Mouzimpré → Vandœuvre Brabois - Hôpitaux',
    type: 'trolleybus',
    color: '#D90011',
    textColor: '#FFFFFF',
    osmRelations: {
      aller: 2074460, // Essey Mouzimpré → Vandœuvre Brabois - Hôpitaux
      retour: 2074461, // Vandœuvre Brabois - Hôpitaux → Essey Mouzimpré
    },
  },
  T2: {
    id: 'T2',
    shortName: 'T2',
    longName: 'Tempo 2 : Laneuveville Centre → Laxou Sapinière',
    type: 'bus',
    color: '#0067b2',
    textColor: '#FFFFFF',
    osmRelations: {
      aller: 3318606, // Laneuveville Centre → Laxou Sapinière
      retour: 3318608, // Laxou Sapinière → Laneuveville Centre
    },
  },
  T3: {
    id: 'T3',
    shortName: 'T3',
    longName: 'Tempo 3 : Villers Campus Sciences → Seichamps Haie Cerlin',
    type: 'bus',
    color: '#0e9340',
    textColor: '#FFFFFF',
    osmRelations: {
      aller: 3220295, // Villers Campus Sciences → Seichamps Haie Cerlin
      retour: 3220296, // Seichamps Haie Cerlin → Villers Campus Sciences
    },
  },
  T4: {
    id: 'T4',
    shortName: 'T4',
    longName: 'Tempo 4 : Laxou Champ le Boeuf → Houdemont Porte Sud',
    type: 'bus',
    color: '#Fcd526',
    textColor: '#000000',
    osmRelations: {
      aller: 3187722, // Laxou Champ le Boeuf → Houdemont Porte Sud
      retour: 3187723, // Houdemont Porte Sud → Laxou Champ le Boeuf
    },
  },
  T5: {
    id: 'T5',
    shortName: 'T5',
    longName: 'Tempo 5 : Maxéville Meurthe-Canal → Vandœuvre Roberval',
    type: 'bus',
    color: '#4b2783',
    textColor: '#FFFFFF',
    osmRelations: {
      aller: 19527868, // Maxéville Meurthe-Canal → Vandœuvre Roberval
      retour: 19539366, // Vandœuvre Roberval → Maxéville Meurthe-Canal
    },
  },
};

/**
 * Récupère une définition de ligne par son ID
 */
export function getRouteDefinition(routeId: string): RouteDefinition | undefined {
  return STAN_ROUTES[routeId];
}

/**
 * Récupère toutes les lignes Tempo (bus)
 */
export function getTempoRoutes(): RouteDefinition[] {
  return Object.values(STAN_ROUTES);
}

/**
 * Récupère toutes les lignes
 */
export function getAllRoutes(): RouteDefinition[] {
  return Object.values(STAN_ROUTES);
}
