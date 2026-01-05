'use client';

import { usePCCStore } from '@/store';

/**
 * INSPECTOR PANEL
 *
 * Affiche les détails de l'entité sélectionnée (bus, arrêt, etc.)
 */

export default function Inspector() {
  const { vehicles, selectedEntityId, selectEntity } = usePCCStore();

  const selectedBus = selectedEntityId ? vehicles[selectedEntityId] : null;

  if (!selectedBus) {
    return (
      <div className="h-full p-4">
        <h2 className="text-lg font-bold mb-4">Inspector</h2>
        <p className="text-sm text-gray-400">Cliquez sur un bus pour voir ses détails</p>
      </div>
    );
  }

  const statusColors = {
    IDLE: 'text-gray-400',
    IN_SERVICE: 'text-ops-success',
    HLP: 'text-ops-warning',
    EMERGENCY: 'text-ops-critical',
    OFF_LINE: 'text-gray-500',
  };

  return (
    <div className="h-full p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Inspector</h2>
        <button
          onClick={() => selectEntity(null)}
          className="text-xs text-gray-400 hover:text-ops-text"
        >
          ✕ Fermer
        </button>
      </div>

      {/* Bus ID */}
      <div className="mb-6">
        <div className="text-2xl font-bold text-ops-accent">{selectedBus.id}</div>
        <div className={`text-sm font-semibold ${statusColors[selectedBus.status]}`}>
          {selectedBus.status}
        </div>
      </div>

      {/* Type & Speed */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-xs text-gray-400 mb-1">Type</div>
          <div className="text-sm font-medium">{selectedBus.type}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Vitesse</div>
          <div className="text-sm font-medium">{selectedBus.speed} km/h</div>
        </div>
      </div>

      {/* Telemetry */}
      <div className="mb-6">
        <h3 className="text-sm font-bold mb-3 text-ops-accent">Télémétrie</h3>

        {/* Energy Level */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Énergie ({selectedBus.telemetry.energyType})</span>
            <span>{selectedBus.telemetry.energyLevel}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                (() => {
                  if (selectedBus.telemetry.energyLevel > 50) return 'bg-ops-success';
                  if (selectedBus.telemetry.energyLevel > 20) return 'bg-ops-warning';
                  return 'bg-ops-critical';
                })()
              }`}
              style={{ width: `${selectedBus.telemetry.energyLevel}%` }}
            />
          </div>
        </div>

        {/* Engine Temp */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Température moteur</span>
            <span>{selectedBus.telemetry.engineTemp}°C</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                (() => {
                  if (selectedBus.telemetry.engineTemp < 80) return 'bg-ops-success';
                  if (selectedBus.telemetry.engineTemp < 95) return 'bg-ops-warning';
                  return 'bg-ops-critical';
                })()
              }`}
              style={{ width: `${Math.min((selectedBus.telemetry.engineTemp / 100) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Odometer */}
        <div className="text-xs text-gray-400 mb-1">
          Kilométrage: <span className="text-ops-text font-medium">{selectedBus.telemetry.odometer.toLocaleString()} km</span>
        </div>
      </div>

      {/* Doors */}
      <div className="mb-6">
        <h3 className="text-sm font-bold mb-2 text-ops-accent">Portes</h3>
        <div className="grid grid-cols-4 gap-2">
          {selectedBus.telemetry.doors.map((isOpen, index) => (
            <div
              key={`door-${selectedBus.id}-${index}`}
              className={`p-2 rounded text-center text-xs font-medium ${
                isOpen
                  ? 'bg-ops-success/20 text-ops-success border border-ops-success'
                  : 'bg-gray-700 text-gray-400 border border-gray-600'
              }`}
            >
              P{index + 1}
              <div className="text-[10px] mt-1">{isOpen ? 'Ouverte' : 'Fermée'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {(selectedBus.telemetry.alerts.abs || selectedBus.telemetry.alerts.overheat) && (
        <div className="mb-4">
          <h3 className="text-sm font-bold mb-2 text-ops-critical">Alertes</h3>
          <div className="space-y-1">
            {selectedBus.telemetry.alerts.abs && (
              <div className="text-xs bg-ops-critical/20 text-ops-critical px-2 py-1 rounded border border-ops-critical">
                ⚠ Défaut ABS
              </div>
            )}
            {selectedBus.telemetry.alerts.overheat && (
              <div className="text-xs bg-ops-critical/20 text-ops-critical px-2 py-1 rounded border border-ops-critical">
                ⚠ Surchauffe moteur
              </div>
            )}
          </div>
        </div>
      )}

      {/* Position */}
      <div className="text-xs text-gray-400 pt-4 border-t border-ops-border">
        Position: {selectedBus.segments[0].currentPosition[1].toFixed(4)}°N, {selectedBus.segments[0].currentPosition[0].toFixed(4)}°E
      </div>
    </div>
  );
}
