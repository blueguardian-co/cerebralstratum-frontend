# ADR 0001: Web Stack Decision — Keep Next.js UI, Use Kotlin Multiplatform for Shared Logic

Date: 2025-09-15

Status: Accepted

## Context
We are building a Kotlin Multiplatform (KMP) monorepo to share business logic across Android, iOS, Web, and Desktop. The current web UI is a Next.js (React/TypeScript) application leveraging:
- PatternFly React components
- Mapbox GL
- Keycloak JS for auth
- Axios

The current app uses the App Router client-side only (no SSR/SSG/API routes observed), dynamic import for Map, and general client-only patterns. The `shared/` module builds KMP artifacts for Android, iOS, and JS (IR library).

The question is whether to replace Next.js with Kotlin/JS to align more closely with Kotlin for maintainability.

## Options

### A. Keep Next.js for UI; use KMP JS for shared business logic
- Pros
  - Leverages mature React/Next ecosystem, PatternFly, Mapbox GL, Keycloak integrations.
  - Minimal churn; faster delivery and hiring reach (TS/React experience is common).
  - KMP keeps core domain, models, networking, and validation in Kotlin, shared across all platforms.
  - Easy interop: consume `shared` JS artifact directly; optional generation of TypeScript declarations for type safety.
- Cons
  - UI remains in TypeScript, not Kotlin.
  - Two languages in the repo for Web (Kotlin for logic, TS for UI).

### B. Move to Kotlin/JS UI (kotlin-react wrappers or Compose Multiplatform for Web)
- Pros
  - One primary language (Kotlin) across business logic and UI.
  - Compose Multiplatform enables shared UI paradigms across Desktop/Web.
- Cons
  - Ecosystem friction: PatternFly React and some JS libs (Keycloak, Mapbox) require wrappers or direct JS interop; maintenance cost rises.
  - Smaller community and fewer ready-made components compared to React ecosystem.
  - Potentially higher risk and slower velocity migrating existing UI and auth flows.

## Decision
Choose Option A: Keep Next.js for the web UI and continue consolidating domain logic in the KMP `shared/` module. This balances maintainability (Kotlin for core logic) with ecosystem maturity (React/Next for UI), minimizing migration risk while preserving the ability to incrementally introduce Kotlin/JS where beneficial.

We will:
1. Consume the `shared` JS artifact in Next.js via a local workspace wrapper/package.
2. Optionally generate TypeScript definitions from Kotlin/JS to improve type safety at the UI boundary when feasible in our toolchain.
3. Consider a parallel pilot (spike) for a small Kotlin/JS UI module (kotlin-react or Compose Web) to evaluate long-term viability, without blocking delivery.

## Consequences
- Web UI continues in React/Next, ensuring compatibility with current UI libraries and auth.
- Core business logic, models, and networking are authored in Kotlin and shared across platforms.
- The team can reevaluate Kotlin/JS UI in the future as libraries mature or if a greenfield module benefits from Kotlin-first UI.

## Future Revisit Criteria
Revisit moving more of the Web UI to Kotlin/JS if:
- Kotlin/JS wrappers exist or are created for PatternFly, Mapbox GL, and Keycloak with sustainable maintenance.
- Compose Multiplatform for Web matures for our component needs and performance criteria.
- We need deeper UI sharing between Desktop (Compose) and Web to reduce duplication.

## Implementation Notes (Immediate Next Steps)
- Build JS library: `npm run kmp:js`.
- Create `packages/shared-js` wrapper package to re-export the compiled KMP outputs and wire it via npm workspaces.
- Import a shared function (e.g., `greeting`) in Next.js (app/page.tsx) to validate end-to-end.
- Later: explore generating `.d.ts` from Kotlin/JS for safer interop.
