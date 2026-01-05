import MapCanvas from '@/components/map/MapCanvas';
import Inspector from '@/components/panels/Inspector';
import MainCourante from '@/components/panels/MainCourante';
import Synoptic from '@/components/panels/Synoptic';
import TimeControls from '@/components/controls/TimeControls';

/**
 * PAGE PRINCIPALE DU PCC
 *
 * Layout 5 zones:
 * - Header avec horloge et contrôles
 * - Inspector (gauche)
 * - Map (centre)
 * - Main Courante (droite)
 * - Synoptic (bas, rétractable)
 */

export default function PCCPage() {
  return (
    <div className="h-screen flex flex-col bg-ops-bg text-ops-text">
      {/* Header */}
      <header className="h-16 bg-ops-panel border-b border-ops-border px-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">SAEIV - Supervision Transport</h1>
        <TimeControls />
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Inspector (gauche) */}
        <aside className="w-80 bg-ops-panel border-r border-ops-border overflow-y-auto">
          <Inspector />
        </aside>

        {/* Map (centre) */}
        <main className="flex-1">
          <MapCanvas />
        </main>

        {/* Main Courante (droite) */}
        <aside className="w-96 bg-ops-panel border-l border-ops-border overflow-y-auto">
          <MainCourante />
        </aside>

        {/* Synoptic (bas, rétractable - position fixed) */}
        <Synoptic />
      </div>
    </div>
  );
}
