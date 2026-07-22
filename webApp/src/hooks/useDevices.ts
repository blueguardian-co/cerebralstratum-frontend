import { useCallback, useEffect, useState } from 'react';
import type { Device } from 'shared';
import { apiClient } from '../api/client.ts';
import { useAuth } from '../components/AuthProvider/AuthProvider.tsx';

export interface UseDevicesResult {
  devices: Device[];
  isLoading: boolean;
  error: string | null;
  /** Re-fetch the device list (e.g. after login or a manual refresh). */
  refetch: () => void;
}

/**
 * Fetches the current user's devices via the shared KMP API client.
 *
 * The actual HTTP call, headers and JSON mapping are handled in `shared`
 * (Ktor); this hook only adapts the returned Promise into React state.
 *
 * Waits for Keycloak's check-sso to resolve before fetching — firing
 * immediately on mount raced against auth initialization (whichever finished
 * first won), so an authenticated user could still see "Failed to fetch
 * devices" if the device request happened to resolve before the token was
 * set.
 */
export function useDevices(): UseDevicesResult {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(() => {
    if (authLoading) {
      return () => {};
    }

    if (!isAuthenticated) {
      setDevices([]);
      setError(null);
      setIsLoading(false);
      return () => {};
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    apiClient
      .getDevices()
      .then((result: Device[]) => {
        if (!cancelled) {
          setDevices(result);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          console.error('Error fetching devices:', e);
          // TEMPORARY: surface the real error instead of a generic message
          // while debugging — no browser devtools access on the reporting device.
          const detail = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
          setError(`Failed to fetch devices — ${detail}`);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated]);

  useEffect(() => fetchDevices(), [fetchDevices]);

  return { devices, isLoading, error, refetch: fetchDevices };
}
