'use client';

import { useEffect } from 'react';
import { usePCCStore } from '@/store';

/**
 * HOOK DE SIMULATION
 *
 * Gère la boucle de temps virtuel (game loop)
 * - Tick du temps virtuel
 * - Mise à jour de la physique des véhicules
 */

export function useSimulation() {
  const { virtualTime, timeScale, isPaused, tick, updateVehiclesLogic } = usePCCStore();

  useEffect(() => {
    if (isPaused) return;

    let lastTime = performance.now();
    let animationId: number;

    const loop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000; // secondes
      lastTime = currentTime;

      // Calculate virtual delta time (with time scale applied)
      const virtualDeltaTime = deltaTime * timeScale;

      // Update virtual time
      tick(virtualDeltaTime);

      // Update vehicle positions along routes
      updateVehiclesLogic(virtualDeltaTime);

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationId);
  }, [isPaused, timeScale, tick, updateVehiclesLogic]);

  return { virtualTime, timeScale, isPaused };
}
