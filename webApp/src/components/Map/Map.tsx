import 'mapbox-gl/dist/mapbox-gl.css';
import './Map.css';

import mapboxgl from 'mapbox-gl';
import { EventSource } from 'eventsource';
import { useEffect, useRef, useState } from 'react';
import type { Device } from 'shared';
import { config } from '../../config.ts';
import { useAuth } from '../AuthProvider/AuthProvider.tsx';
import { DEFAULT_CENTER, DEFAULT_ZOOM } from './MapContext.ts';

mapboxgl.accessToken = config.mapboxAccessToken;

const GLOBE_CENTER: [number, number] = [134, 0];
const GLOBE_ZOOM = 2;
const GLOBE_SECONDS_PER_REVOLUTION = 720;

interface LocationEventPayload {
  deviceId: string;
  location: { coordinates: unknown };
}

// Backend's PointSerializer writes [point.getY(), point.getX(), altitude?] —
// i.e. [latitude, longitude], not GeoJSON's [longitude, latitude] convention.
// Confirmed against a live SSE payload.
function extractLngLat(coordinates: unknown): [number, number] | null {
  if (Array.isArray(coordinates) && coordinates.length >= 2) {
    const [lat, lng] = coordinates;
    if (typeof lat === 'number' && typeof lng === 'number') return [lng, lat];
  }
  console.warn('Map: unrecognised location coordinates shape', coordinates);
  return null;
}

interface MapProps {
  devices: Device[];
  selectedDeviceId: string | null;
  onMapChange: (map: mapboxgl.Map | null) => void;
}

// How close to zoom in when focusing a selected device — never zooms out if
// the user is already closer than this.
const FOCUS_ZOOM = 15;

// How long a marker takes to glide to a newly-received location, instead of
// teleporting there instantly.
const MARKER_ANIMATION_MS = 800;

// Fraction of the viewport, measured in from each edge, that counts as the
// "margin" — once a selected device's marker enters this margin, the camera
// recentres. Keeps the view still while the marker is well within frame,
// rather than re-centring on every single location update.
const EDGE_MARGIN_RATIO = 0.2;

// Whether `lngLat` falls within the edge margin of the map's current
// viewport (or outside it entirely).
function isNearViewportEdge(map: mapboxgl.Map, lngLat: [number, number]): boolean {
  const point = map.project(lngLat);
  const canvas = map.getCanvas();
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const marginX = width * EDGE_MARGIN_RATIO;
  const marginY = height * EDGE_MARGIN_RATIO;
  return point.x < marginX || point.x > width - marginX || point.y < marginY || point.y > height - marginY;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Animates a marker from its current position to `to` over `duration` ms.
// Returns a cancel function so a fresh update can interrupt an in-flight
// animation without fighting over the marker's position.
function animateMarkerTo(marker: mapboxgl.Marker, to: [number, number], duration: number): () => void {
  const from = marker.getLngLat();
  const fromLngLat: [number, number] = [from.lng, from.lat];
  const start = performance.now();
  let frameId: number;

  const step = (now: number) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = easeInOutCubic(t);
    marker.setLngLat([
      fromLngLat[0] + (to[0] - fromLngLat[0]) * eased,
      fromLngLat[1] + (to[1] - fromLngLat[1]) * eased,
    ]);
    if (t < 1) frameId = requestAnimationFrame(step);
  };
  frameId = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frameId);
}

export default function Map({ devices, selectedDeviceId, onMapChange }: MapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const navControlAddedRef = useRef(false);
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({});
  const markerAnimationsRef = useRef<Record<string, () => void>>({});
  const selectedDeviceIdRef = useRef<string | null>(null);
  const { isAuthenticated, isLoading: authLoading, token } = useAuth();

  useEffect(() => {
    selectedDeviceIdRef.current = selectedDeviceId;
  }, [selectedDeviceId]);

  // Read the live token at fetch-time instead of closing over it, so a
  // silent OIDC refresh (AuthProvider re-runs kc.updateToken every 30s)
  // doesn't retrigger the EventSource-creation effect below and tear down
  // every open connection + wipe all markers just because the token string
  // changed.
  const tokenRef = useRef<string | null>(null);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  // Mount the map once.
  useEffect(() => {
    if (!containerRef.current) return;

    const mapInstance = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      // Default AttributionControl anchors bottom-right, the same corner as
      // the custom zoom/recenter cluster (see Map.css) — moved to the empty
      // bottom-left corner instead, full text kept as-is.
      attributionControl: false,
    });
    mapInstance.addControl(new mapboxgl.AttributionControl(), 'bottom-left');
    setMap(mapInstance);
    onMapChange(mapInstance);

    const resizeObserver = new ResizeObserver(() => mapInstance.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      mapInstance.remove();
      setMap(null);
      onMapChange(null);
    };
    // `onMapChange` is expected to be a stable `useState` setter (see Dashboard),
    // so this only needs to run once per mount despite the dependency.
  }, [onMapChange]);

  // Switch between the spinning globe (unauthenticated) and the normal
  // authenticated view. Correctly depends on both `map` and
  // `isAuthenticated` — no stale-closure workaround needed.
  //
  // Waits on `authLoading` too: on a fresh full page load (e.g. a bookmarked
  // filtered URL), `isAuthenticated` starts out false while Keycloak's
  // check-sso is still resolving, indistinguishable at that point from an
  // actually-signed-out user. Deciding the projection off `isAuthenticated`
  // alone spun up the globe every time, only to immediately snap back to
  // the normal map a moment later once auth resolved true — skip straight
  // to the real state instead of showing that transient wrong one.
  useEffect(() => {
    if (!map || authLoading) return;

    if (!isAuthenticated) {
      map.setProjection('globe');
      map.setCenter(GLOBE_CENTER);
      map.setZoom(GLOBE_ZOOM);
      map.scrollZoom.disable();
      map.once('style.load', () => map.setFog({}));

      const distancePerSecond = 360 / GLOBE_SECONDS_PER_REVOLUTION;
      const spin = () => {
        const center = map.getCenter();
        center.lng -= distancePerSecond;
        map.easeTo({ center, duration: 1000, easing: (n) => n });
      };
      const interval = setInterval(spin, 1000);
      return () => clearInterval(interval);
    }

    map.setProjection('mercator');
    map.scrollZoom.enable();
    map.setCenter(DEFAULT_CENTER);
    map.setZoom(DEFAULT_ZOOM);
    if (!navControlAddedRef.current) {
      // Compass only — zoom is already covered by the custom cs-map-controls
      // cluster (bottom-right), which is also where this docks (see Map.css)
      // to stay clear of the top ribbon.
      map.addControl(new mapboxgl.NavigationControl({ showZoom: false, showCompass: true }), 'bottom-right');
      navControlAddedRef.current = true;
    }
  }, [map, isAuthenticated, authLoading]);

  // Keyed on the device UUIDs joined into a string rather than the `devices`
  // array itself — same reasoning as the status hook in useDevices.ts: a
  // status-only update produces a new `devices` array reference without
  // adding/removing a device, and depending on `devices` directly would tear
  // down and reopen the location stream on every unrelated status push.
  const deviceIds = devices.map((d) => d.uuid).join(',');

  // Live location markers, fed by a single multiplexed SSE stream covering
  // every device instead of one connection per device — with N devices that
  // used to mean N persistent connections competing (along with the status
  // stream's own N connections) for the browser's per-origin connection cap,
  // starving out whichever stream lost the race.
  useEffect(() => {
    if (!map || !isAuthenticated || !tokenRef.current || !deviceIds) return;

    const params = deviceIds
      .split(',')
      .map((id) => `devices=${encodeURIComponent(id)}`)
      .join('&');
    const source = new EventSource(`${config.backendApi}/api/v1/devices/locations?${params}`, {
      fetch: (url, init) =>
        fetch(url, {
          ...init,
          headers: { ...init.headers, Authorization: `Bearer ${tokenRef.current}` },
        }),
    });

    source.onmessage = (event) => {
      const payload = JSON.parse(event.data) as LocationEventPayload;
      const lngLat = extractLngLat(payload.location?.coordinates);
      if (!lngLat) return;

      const existing = markersRef.current[payload.deviceId];
      if (existing) {
        markerAnimationsRef.current[payload.deviceId]?.();
        markerAnimationsRef.current[payload.deviceId] = animateMarkerTo(existing, lngLat, MARKER_ANIMATION_MS);
      } else {
        markersRef.current[payload.deviceId] = new mapboxgl.Marker().setLngLat(lngLat).addTo(map);
      }

      // Only recentre a selected device's camera once its marker nears the
      // edge of the current viewport — otherwise the view stays put while
      // the marker glides around inside it. Zoom is left alone here; the
      // selection-change effect below owns the initial focus-in.
      if (payload.deviceId === selectedDeviceIdRef.current) {
        if (!existing) {
          map.flyTo({ center: lngLat, zoom: Math.max(map.getZoom(), FOCUS_ZOOM) });
        } else if (isNearViewportEdge(map, lngLat)) {
          map.easeTo({ center: lngLat, duration: MARKER_ANIMATION_MS });
        }
      }
    };

    return () => {
      source.close();
      Object.values(markerAnimationsRef.current).forEach((cancel) => cancel());
      markerAnimationsRef.current = {};
      Object.values(markersRef.current).forEach((marker) => marker.remove());
      markersRef.current = {};
    };
    // token intentionally excluded — read via tokenRef so a silent refresh
    // doesn't tear down every open EventSource connection (see tokenRef above).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, deviceIds, isAuthenticated]);

  // Focus the map on a device as soon as it's selected, if its location is
  // already known.
  useEffect(() => {
    if (!map || !selectedDeviceId) return;
    const marker = markersRef.current[selectedDeviceId];
    if (!marker) return;
    map.flyTo({ center: marker.getLngLat(), zoom: Math.max(map.getZoom(), FOCUS_ZOOM) });
  }, [map, selectedDeviceId]);

  return <div ref={containerRef} className="cs-map-container" />;
}
