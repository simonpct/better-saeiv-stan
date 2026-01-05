import { StateCreator } from 'zustand';
import { LogEntry } from '@/types';

export interface LogSlice {
  // State
  logs: LogEntry[];
  virtualTime: Date; // Référence au temps virtuel

  // Actions
  addLog: (entry: Omit<LogEntry, 'id' | 'virtualTimestamp'>) => void;
  clearLogs: () => void;
}

export const createLogSlice: StateCreator<
  LogSlice,
  [],
  [],
  LogSlice
> = (set, get) => ({
  logs: [],
  virtualTime: new Date('2026-01-05T08:00:00'),

  addLog: (entry) => {
    const virtualTime = get().virtualTime;
    const newLog: LogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random()}`,
      virtualTimestamp: virtualTime,
    };

    set((state) => ({
      logs: [...state.logs, newLog],
    }));
  },

  clearLogs: () => {
    set({ logs: [] });
  },
});
