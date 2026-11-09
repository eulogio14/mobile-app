import { useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';

const SHAKE_THRESHOLD = 1.8;
const SHAKE_COOLDOWN_MS = 2500;

export function useAccelerometer(onShake: () => void) {
  const lastShakeRef = useRef(0);
  const lastRef = useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;
    let active = true;

    (async () => {
      try {
        const available = await Accelerometer.isAvailableAsync();
        if (!available || !active) return;
        Accelerometer.setUpdateInterval(150);
        subscription = Accelerometer.addListener(({ x, y, z }) => {
          const last = lastRef.current;
          const delta = Math.abs(x - last.x) + Math.abs(y - last.y) + Math.abs(z - last.z);
          lastRef.current = { x, y, z };
          if (delta > SHAKE_THRESHOLD) {
            const now = Date.now();
            if (now - lastShakeRef.current > SHAKE_COOLDOWN_MS) {
              lastShakeRef.current = now;
              onShake();
            }
          }
        });
      } catch {
        // Sensor no disponible: no activar, sin error.
      }
    })();

    return () => {
      active = false;
      if (subscription) subscription.remove();
    };
  }, [onShake]);
}
