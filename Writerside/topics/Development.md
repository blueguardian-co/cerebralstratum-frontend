# Development

## Prerequisites

- JDK 11+
- Node.js 20+ and npm 10+
- Android SDK (for Android targets)
- Xcode (for iOS targets)

## Project Structure

| Module | Purpose |
|---|---|
| `shared/` | KMP shared library — data models, API client, auth state |
| `composeApp/` | Compose Multiplatform UI — Android and Desktop |
| `webApp/` | React + TypeScript web app, consumes `shared/` Kotlin/JS output |
| `iosApp/` | iOS native entry point (Swift/Xcode) |

## Web App

The web app (`webApp/`) is a Vite + React + TypeScript SPA served on port 8080.
It imports domain types and API client logic from the Kotlin `shared/` module via the npm workspace.

### Build and run

```bash
# 1. Compile the Kotlin shared module to JS
./gradlew :shared:jsBrowserDevelopmentLibraryDistribution

# 2. Install npm dependencies (first time or after dependency changes)
npm install

# 3. Start the Vite dev server (http://localhost:8080)
cd webApp && npm run start
```

### Environment variables

All configuration is injected at **runtime** via `webApp/public/env.js` (see [ADR-0006](0006-runtime-environment-variables.md)).
Copy `webApp/.env.example` to understand the available variables; do not rely on build-time env vars.

| Variable | Description | Default |
|---|---|---|
| `KEYCLOAK_URL` | Keycloak server URL | `http://localhost:8080` |
| `KEYCLOAK_REALM` | Keycloak realm name | `cerebralstratum` |
| `KEYCLOAK_CLIENT_ID` | Keycloak public client ID | `cerebralstratum-frontend` |
| `BACKEND_API` | Backend REST API base URL | `http://localhost:6443` |
| `MAPBOX_ACCESS_TOKEN` | Mapbox GL JS access token | _(empty)_ |

### Production build

```bash
./gradlew :shared:jsBrowserDevelopmentLibraryDistribution
cd webApp && npm run build
# Output: webApp/dist/
```

## Android

```bash
./gradlew :composeApp:assembleDebug
```

## Desktop (JVM)

```bash
./gradlew :composeApp:run
```

## iOS

Open `iosApp/` in Xcode and run from the IDE.

## Tests

```bash
./gradlew test
```

Test sources: `shared/src/commonTest/`, `composeApp/src/commonTest/`.
