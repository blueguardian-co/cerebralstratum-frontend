import { createContext, useContext } from 'react';
import type { Map as MapboxMap } from 'mapbox-gl';

// Deliberately its own tiny file with only a type-only mapbox-gl import
// (erased at compile time) so consumers like Dashboard's zoom/locate buttons
// don't pull in the full mapbox-gl runtime just to read the map instance —
// that stays confined to the lazy-loaded Map.tsx.
export interface MapContextValue {
  map: MapboxMap | null;
}

// Placeholder default view until there's a real "home base" concept
// (e.g. org HQ, first device, last-viewed position). Shared between Map.tsx
// (heavy, lazy-loaded) and Dashboard.tsx's locate button (must not statically
// import anything from Map.tsx, or it would defeat the lazy-loading).
export const DEFAULT_CENTER: [number, number] = [149.09108, -35.44665];
export const DEFAULT_ZOOM = 16;

export const MapContext = createContext<MapContextValue | undefined>(undefined);

export function useMap(): MapContextValue {
  const ctx = useContext(MapContext);
  if (!ctx) throw new Error('useMap must be used within a MapContext.Provider');
  return ctx;
}
