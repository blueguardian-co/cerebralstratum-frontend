import { EventSource } from 'eventsource';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Device } from 'shared';
import type { DeviceStatus } from 'shared';
import { apiClient } from '../api/client.ts';
import { config } from '../config.ts';
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
  const { isAuthenticated, isLoading: authLoading, token } = useAuth();
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

  // Read the live token at connect-time instead of closing over it, so a
  // silent OIDC refresh (AuthProvider re-runs kc.updateToken every 30s)
  // doesn't retrigger the EventSource-creation effect below — same pattern
  // as the location EventSource in Map.tsx.
  const tokenRef = useRef<string | null>(null);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  // Live per-device status. Keyed on the device UUIDs joined into a string
  // rather than the `devices` array itself: merging a status update into
  // `devices` via setDevices produces a new array reference on every
  // message, and depending on `devices` directly would tear down and
  // reopen every connection in reaction to its own updates. The joined
  // string is only unequal (by value) when a device is actually added or
  // removed.
  const deviceIds = devices.map((d) => d.uuid).join(',');

  // Stop-gap for the delay between mount and the first SSE status message
  // (the EventSource below only opens once `deviceIds` is known, then still
  // has to wait for the backend to push): seed each device's status once
  // from the last-known value over REST, so the panel doesn't sit on
  // "Offline"/no battery for a few seconds on every page load. Guarded by
  // `d.status == null` in the setDevices updater so a status that already
  // arrived (via this same fetch or a fast SSE message) is never clobbered
  // with a stale REST response.
  useEffect(() => {
    if (!isAuthenticated || !deviceIds) return;
    let cancelled = false;

    deviceIds.split(',').forEach((uuid) => {
      apiClient
        .getLatestDeviceStatus(uuid)
        .then((status) => {
          if (cancelled || status == null) return;
          setDevices((prev) =>
            prev.map((d) =>
              d.uuid === uuid && d.status == null
                ? new Device(d.uuid, d.name, d.description, d.keycloak_user_id, d.keycloak_org_id, d.image_path, status)
                : d
            )
          );
        })
        .catch(() => {});
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, deviceIds]);

  // A single multiplexed SSE stream covering every device, instead of one
  // connection per device — with N devices that used to mean N persistent
  // connections competing (along with the location stream's own N
  // connections in Map.tsx) for the browser's per-origin connection cap,
  // starving out whichever stream lost the race for a slot.
  useEffect(() => {
    if (!isAuthenticated || !deviceIds) return;

    const params = deviceIds
      .split(',')
      .map((id) => `devices=${encodeURIComponent(id)}`)
      .join('&');
    const source = new EventSource(`${config.backendApi}/api/v1/devices/statuses?${params}`, {
      fetch: (url, init) =>
        fetch(url, {
          ...init,
          headers: { ...init.headers, Authorization: `Bearer ${tokenRef.current}` },
        }),
    });

    source.onmessage = (event) => {
      let payload: { deviceId: string; status: DeviceStatus };
      try {
        payload = JSON.parse(event.data) as { deviceId: string; status: DeviceStatus };
      } catch {
        console.warn('useDevices: unparseable status SSE payload', event.data);
        return;
      }
      // Device is a Kotlin/JS data class exported as a real class (getters,
      // no plain own-enumerable properties), so object-spread can't produce
      // a well-typed copy — go through the constructor instead.
      setDevices((prev) =>
        prev.map((d) =>
          d.uuid === payload.deviceId
            ? new Device(d.uuid, d.name, d.description, d.keycloak_user_id, d.keycloak_org_id, d.image_path, payload.status)
            : d
        )
      );
    };

    return () => {
      source.close();
    };
    // token intentionally excluded — read via tokenRef so a silent refresh
    // doesn't tear down every open EventSource connection (see tokenRef above).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, deviceIds]);

  return { devices, isLoading, error, refetch: fetchDevices };
}
