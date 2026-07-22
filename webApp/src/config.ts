declare global {
  interface Window {
    __env__: Record<string, string>;
  }
}

const env = (key: string, fallback = ''): string =>
  window.__env__?.[key] || fallback;

export const config = {
  keycloakUrl:       env('KEYCLOAK_URL',       'http://localhost:8080'),
  keycloakRealm:     env('KEYCLOAK_REALM',      'cerebralstratum'),
  keycloakClientId:  env('KEYCLOAK_CLIENT_ID',  'cerebralstratum-frontend'),
  backendApi:        env('BACKEND_API',          'http://localhost:6443'),
  mapboxAccessToken: env('MAPBOX_ACCESS_TOKEN',  ''),
};