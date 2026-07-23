# ADR-0005: Mapbox GL JS for Web Map Rendering

Date: 2026-03-23

## Status

Accepted

## Context

The web UI requires an interactive map to display real-time device positions. The `main` branch used `@vis.gl/react-google-maps` (Google Maps Platform). The `kotlin` branch `webApp/` currently has no map dependency. A new choice is required for the KMP web MVP.

## Options Considered

### A. Google Maps (`@vis.gl/react-google-maps`)
- Used on the main branch.
- Requires a Google Maps Platform API key with billing enabled.
- Good React integration via `@vis.gl/react-google-maps`.
- Limited offline/self-hosted options.

### B. Mapbox GL JS (`mapbox-gl ^3`, direct)
- High-performance vector tile rendering; excellent dark-mode styles (`mapbox://styles/mapbox/dark-v11`).
- Commercial licence required for production use beyond the free tier.
- Imperative API gives fine-grained control over markers, popups, and SSE-driven real-time updates.
- TypeScript types via `@types/mapbox-gl`.
- No React wrapper needed — a `MapProvider` context holds the `mapboxgl.Map` instance.

### C. MapLibre GL JS (`maplibre-gl`)
- Open-source MIT-licenced fork of Mapbox GL JS 1.x.
- API-compatible with most Mapbox GL JS patterns; near drop-in replacement.
- No commercial licence required for the library itself (tile sources still require a provider key).
- Slightly behind Mapbox GL JS v3 in features (globe projection, some style specifications).

## Decision

Use **Mapbox GL JS v3** (`mapbox-gl ^3`) directly.

Rationale:
- The best-available map rendering quality and style ecosystem for an IoT tracking application.
- The imperative `mapboxgl.Map` API maps well to the SSE-driven real-time marker update pattern.
- MapLibre GL JS is documented as the preferred migration path if the Mapbox commercial licence becomes a constraint (the `mapbox-gl` surface used is compatible with MapLibre).

## Implementation

- CSS: `import 'mapbox-gl/dist/mapbox-gl.css'` in the map component.
- Access token: read from `window.__env__.MAPBOX_ACCESS_TOKEN` at runtime (see ADR-0006).
- `MapProvider` React context: initialises `mapboxgl.Map`, holds `mapRef`, exposes via `useMap()` hook.
- Markers: `mapboxgl.Marker` instances, keyed by device UUID, updated on SSE events.
- Map rendering is entirely in `webApp/`; the Kotlin `shared/` module has no map dependency.

## Consequences

- Google Maps dependency (`@vis.gl/react-google-maps`) is not carried forward.
- If MapLibre is adopted later: replace `mapbox-gl` import with `maplibre-gl`; style URL syntax differs slightly; most component code is unchanged.
- Mapbox access token must be provisioned per deployment environment.

## Forward Pointers

- CSPROD-182: once the backend SSE stream was actually delivering live location data end-to-end (see `cerebralstratum-backend` ADR-0010), the marker-update pattern described above had two bugs that meant markers never rendered — a `[lng, lat]`/`[lat, lon]` coordinate-order mismatch, and the location-EventSource effect depending on the raw auth token (which `AuthProvider` silently refreshes every ~30s), tearing down every connection and wiping all markers on each refresh. Both fixed in `Map.tsx`; the `mapboxgl.Marker`-keyed-by-device-UUID pattern itself is unchanged.
