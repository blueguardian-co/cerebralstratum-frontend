# ADR-0002: Kotlin Multiplatform Migration Plan

## Status

In Progress — Phase 1 active on the `kotlin` branch (see [ADR-0003](0003-kmp-shared-logic.md))

## Context

Following ADR-0001, the project was built on Next.js/React. However, the broader product roadmap includes native Android and iOS clients sharing core business logic (device management, API clients, data models) with the web frontend.

Maintaining separate Kotlin (Android), Swift (iOS), and TypeScript (Web) implementations of the same logic introduces:
- Duplicated effort and divergence risk
- Inconsistent behaviour across platforms
- Higher maintenance overhead

## Decision

Incrementally migrate shared logic to **Kotlin Multiplatform (KMP)**, targeting:
- `androidMain` — Android native
- `iosMain` — iOS (ARM64 + Simulator)
- `jsMain` — Kotlin/JS for the web app
- `jvmMain` — JVM desktop

### Migration phases

1. **Phase 1 (current):** Introduce `shared/` KMP module. Migrate data models and API client. Replace Next.js web app with React + Vite (`webApp/`). Establish `@JsExport` / TypeScript definitions bridge.
2. **Phase 2:** Migrate Android client to Compose Multiplatform using `composeApp/` with shared logic from `shared/`.
3. **Phase 3:** iOS client via `iosApp/` consuming `shared/` as a framework.
4. **Phase 4:** Evaluate Compose Multiplatform for UI layer sharing across Android and Desktop.

## Consequences

### Positive
- Single source of truth for business logic across all platforms
- Type-safe API contracts shared between web, Android, and iOS
- Reduced duplication and maintenance burden long-term

### Negative
- Increased build complexity (Gradle KMP + npm interop)
- Kotlin/JS suspend function interop requires JS Promise wrappers in `jsMain`
- Team must be proficient in both Kotlin and TypeScript
- Initial migration cost before benefits are realised
