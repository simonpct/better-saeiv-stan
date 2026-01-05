import { StateCreator } from 'zustand';
import { TimeScale } from '@/types';

export interface TemporalSlice {
  // State
  virtualTime: Date;
  timeScale: TimeScale;
  isPaused: boolean;

  // Actions
  tick: (deltaTime: number) => void;
  setSpeed: (speed: TimeScale) => void;
  togglePause: () => void;
  seekTime: (target: Date) => void;
}

export const createTemporalSlice: StateCreator<
  TemporalSlice,
  [],
  [],
  TemporalSlice
> = (set, get) => ({
  // État initial
  virtualTime: new Date('2026-01-05T08:00:00'), // Lundi 8h
  timeScale: 1,
  isPaused: true,

  // TODO Phase 2: Implémenter la logique temporelle
  // Voir specs.md section "TemporalStore"
  tick: (deltaTime: number) => {
    const state = get();
    if (state.isPaused) return;

    set({
      virtualTime: new Date(state.virtualTime.getTime() + deltaTime * 1000),
    });
  },

  setSpeed: (speed: TimeScale) => {
    set({ timeScale: speed });
  },

  togglePause: () => {
    set((state) => ({ isPaused: !state.isPaused }));
  },

  seekTime: (target: Date) => {
    set({ virtualTime: target });
  },
});
