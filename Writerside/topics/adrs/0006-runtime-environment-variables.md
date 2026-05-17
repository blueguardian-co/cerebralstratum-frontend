# ADR-0006: Runtime Environment Variable Injection

Date: 2026-03-23

## Status

Accepted

## Context

The web app (`webApp/`) is built with Vite, which bakes `import.meta.env.VITE_*` variables into the JavaScript bundle at compile time. This is incompatible with containerised deployments where the same Docker image must run against different environments (dev, staging, production) with different API URLs and Keycloak configurations.

The `main` branch (Next.js) solved this with a `public/env.js` file containing `window.__env__` with shell-style placeholder values (`"${VARIABLE_NAME}"`), loaded via a `<script>` tag in the HTML shell, and replaced at container startup using `envsubst`.

## Decision

Adopt the same `window.__env__` pattern for the `webApp/` Vite SPA.

## Implementation

### 1. `webApp/public/env.js`

A static file committed to the repo containing placeholder values:

```javascript
window.__env__ = {
  KEYCLOAK_URL: "${KEYCLOAK_URL}",
  KEYCLOAK_REALM: "${KEYCLOAK_REALM}",
  KEYCLOAK_CLIENT_ID: "${KEYCLOAK_CLIENT_ID}",
  BACKEND_API: "${BACKEND_API}",
  MAPBOX_ACCESS_TOKEN: "${MAPBOX_ACCESS_TOKEN}"
};
```

### 2. `webApp/index.html`

Load the script before the React bundle:

```html
<head>
  <script src="/env.js"></script>
</head>
```

### 3. `webApp/src/config.ts`

A typed config module that reads from `window.__env__` with fallbacks:

```typescript
declare global {
  interface Window {
    __env__: Record<string, string>;
  }
}

const env = (key: string, fallback = ''): string =>
  window.__env__?.[key] || fallback;

export const config = {
  keycloakUrl:        env('KEYCLOAK_URL',        'http://localhost:8080'),
  keycloakRealm:      env('KEYCLOAK_REALM',       'cerebralstratum'),
  keycloakClientId:   env('KEYCLOAK_CLIENT_ID',   'cerebralstratum-frontend'),
  backendApi:         env('BACKEND_API',           'http://localhost:6443'),
  mapboxAccessToken:  env('MAPBOX_ACCESS_TOKEN',  ''),
};
```

All components and providers import from `config.ts` — never from `import.meta.env` directly.

### 4. Container entrypoint

At container startup, before serving the app, run:

```bash
envsubst < /usr/share/nginx/html/env.js > /tmp/env.js \
  && mv /tmp/env.js /usr/share/nginx/html/env.js
```

This replaces `${KEYCLOAK_URL}` etc. with the actual values from the container environment.

### 5. `webApp/.env.example`

Documents the expected environment variable names for operators:

```bash
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=cerebralstratum
KEYCLOAK_CLIENT_ID=cerebralstratum-frontend
BACKEND_API=http://localhost:6443
MAPBOX_ACCESS_TOKEN=pk.your_token_here
```

Note: these are **not** `VITE_` prefixed. They are passed to the container, not to the Vite build.

## Consequences

- The same Docker image runs unchanged across all environments; only the container environment variables differ.
- `import.meta.env.VITE_*` is not used anywhere in the application code.
- Local development requires either running `envsubst` manually, or providing a pre-populated `webApp/public/env.js` (not committed with real values — add `webApp/public/env.js` to `.gitignore`, keeping only the template).
- The `envsubst` step must be part of the container `ENTRYPOINT` or an init script.
