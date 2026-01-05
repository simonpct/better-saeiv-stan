'use client';

import { useEffect } from 'react';
import { usePCCStore } from '@/store';

/**
 * HOOK DE SIMULATION
 *
 * Gère la boucle de temps virtuel (game loop)
 *
 * TODO Phase 2: Implémenter la logique de tick
 * TODO Phase 3: Ajouter updateVehiclesLogic
 */

export function useSimulation() {
  const { virtualTime, timeScale, isPaused, tick } = usePCCStore();

  useEffect(() => {
    if (isPaused) return;

    let lastTime = performance.now();
    let animationId: number;

    const loop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000; // secondes
      lastTime = currentTime;

      // Tick avec la vitesse de simulation
      tick(deltaTime * timeScale);

      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationId);
  }, [isPaused, timeScale, tick]);

  return { virtualTime, timeScale, isPaused };
}
