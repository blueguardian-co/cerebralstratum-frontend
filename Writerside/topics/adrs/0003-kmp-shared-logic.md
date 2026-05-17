# ADR-0003: KMP as Shared Logic Layer

Date: 2026-03-23

## Status

Accepted

Supersedes: ADR-0001 (web stack, in scope), ADR-0002 (migration plan, now executing Phase 1)

## Context

The `kotlin` branch establishes a KMP monorepo with four modules:

| Module | Role |
|---|---|
| `shared/` | KMP library — domain models, API client, auth token state |
| `composeApp/` | Compose Multiplatform UI for Android and Desktop |
| `webApp/` | React + TypeScript SPA, consumes `shared/` Kotlin/JS output |
| `iosApp/` | iOS native entry point (Swift/Xcode) |

The `shared/` module compiles to Kotlin/JS (ES2015, browser target) and generates TypeScript definitions via `generateTypeScriptDefinitions()`. The output is consumed by `webApp/` via an npm workspace symlink at `shared/build/dist/js/developmentLibrary`.

ADR-0001 and ADR-0002 described this as proposed or near-term pragmatic. This ADR formalises it as the accepted architecture.

## Decision

The `shared/` Kotlin Multiplatform module is the canonical location for:
- Domain data models (`Device`, `DeviceStatus`, etc.)
- API client logic (HTTP calls, request construction, response mapping via Ktor)
- Auth token management (`AuthStateProvider` interface + `JsAuthState` JS implementation)
- Any business rules that must be consistent across Android, iOS, Desktop, and Web

The `webApp/` React + Vite app is the canonical Web UI layer and is responsible for:
- React component rendering and DOM interactions
- Keycloak browser SDK initialisation (`keycloak-js`, browser-only)
- Mapbox GL JS map rendering (JS-only library)
- UI state management (hooks, context providers)

## Rationale

- `@JsExport` + `generateTypeScriptDefinitions()` gives the React layer full TypeScript type safety at the KMP boundary.
- Keeping networking and models in Kotlin enables direct reuse in `composeApp/` (Android/Desktop) and `iosApp/` without duplication.
- The Kotlin compiler produces ES2015 module output (`shared.mjs`) natively compatible with Vite's ESM bundler.
- Platform-specific engine selection (Ktor `OkHttp` on Android, `Darwin` on iOS, `Js` on web, `CIO` on JVM) is handled by source set targets with no impact on `commonMain` code.

## Consequences

- All new domain types and API calls are added to `shared/src/commonMain/` first.
- JS-specific bindings (Promise wrappers for `suspend` functions) go in `shared/src/jsMain/`.
- The React app imports domain logic from `'shared'` only; TypeScript types are never duplicated.
- `./gradlew :shared:jsBrowserDevelopmentLibraryDistribution` must run before `npm run start`.
