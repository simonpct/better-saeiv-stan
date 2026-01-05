'use client';

/**
 * TIME CONTROLS
 *
 * Contrôles de la simulation temporelle (pause, play, vitesse)
 *
 * TODO Phase 2: Connecter au store temporal
 * TODO Phase 2: Implémenter boutons play/pause
 */

export default function TimeControls() {
  return (
    <div className="flex items-center gap-4">
      <div className="text-sm font-mono">08:00:00</div>
      <button className="px-3 py-1 bg-blue-600 rounded text-sm">Play</button>
      <select className="px-2 py-1 bg-gray-800 rounded text-sm">
        <option>×1</option>
        <option>×10</option>
        <option>×30</option>
        <option>×60</option>
      </select>
    </div>
  );
}
