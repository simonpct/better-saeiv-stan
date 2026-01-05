'use client';

import { usePCCStore } from '@/store';
import { TimeScale } from '@/types';

/**
 * TIME CONTROLS
 *
 * Contrôles de la simulation temporelle (pause, play, vitesse)
 */

export default function TimeControls() {
  const { virtualTime, timeScale, isPaused, togglePause, setSpeed } = usePCCStore();

  // Format time as HH:MM:SS
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="flex items-center gap-4">
      {/* Virtual time display */}
      <div className="text-sm font-mono bg-ops-panel px-3 py-1 rounded border border-ops-border">
        {formatTime(virtualTime)}
      </div>

      {/* Play/Pause button */}
      <button
        onClick={togglePause}
        className={`px-4 py-1 rounded text-sm font-medium transition-colors ${
          isPaused
            ? 'bg-ops-success hover:bg-ops-success/80 text-white'
            : 'bg-ops-warning hover:bg-ops-warning/80 text-white'
        }`}
      >
        {isPaused ? '▶ Play' : '⏸ Pause'}
      </button>

      {/* Speed selector */}
      <select
        value={timeScale}
        onChange={(e) => setSpeed(Number(e.target.value) as TimeScale)}
        className="px-3 py-1 bg-ops-panel border border-ops-border rounded text-sm hover:border-ops-accent transition-colors cursor-pointer"
      >
        <option value={1}>×1</option>
        <option value={10}>×10</option>
        <option value={30}>×30</option>
        <option value={60}>×60</option>
      </select>

      {/* Speed indicator */}
      <div className="text-xs text-gray-400">
        {isPaused ? 'En pause' : `Vitesse ×${timeScale}`}
      </div>
    </div>
  );
}
