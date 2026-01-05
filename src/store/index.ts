/**
 * STORE RACINE ZUSTAND
 *
 * Combine tous les slices dans un seul store global.
 * Pattern: https://docs.pmnd.rs/zustand/guides/typescript#slices-pattern
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createTemporalSlice, TemporalSlice } from './slices/temporalSlice';
import { createFleetSlice, FleetSlice } from './slices/fleetSlice';
import { createNetworkSlice, NetworkSlice } from './slices/networkSlice';
import { createLogSlice, LogSlice } from './slices/logSlice';

export type PCCStore = TemporalSlice & FleetSlice & NetworkSlice & LogSlice;

export const usePCCStore = create<PCCStore>()(
  devtools(
    (...a) => ({
      ...createTemporalSlice(...a),
      ...createFleetSlice(...a),
      ...createNetworkSlice(...a),
      ...createLogSlice(...a),
    }),
    { name: 'PCC Store' }
  )
);
