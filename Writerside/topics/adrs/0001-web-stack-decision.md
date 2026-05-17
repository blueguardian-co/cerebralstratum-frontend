# ADR-0001: Web Stack Decision

## Status

Superseded by [ADR-0003](0003-kmp-shared-logic.md)

## Context

The CEREBRAL STRATUM Frontend required a modern, maintainable web stack that supports:
- Server-side rendering (SSR) and static site generation (SSG)
- Strong TypeScript support
- A rich ecosystem for UI components and mapping libraries
- Active community and long-term support

## Decision

Next.js 15 with React 18 and TypeScript was selected as the primary web stack.

### Key choices:
- **Next.js**: SSR/SSG, file-based routing, API routes
- **React 18**: Concurrent features, hooks-based development
- **TypeScript**: Type safety across the codebase
- **Keycloak JS**: Authentication via OpenID Connect
- **Google Maps** (`@vis.gl/react-google-maps`): Map rendering

## Consequences

### Positive
- Fast time-to-market with well-known tooling
- Large ecosystem of components (PatternFly)
- SSR improves initial page load performance

### Negative
- Next.js is web-only; business logic cannot be shared with native Android/iOS clients
- Led to ADR-0002 and ultimately ADR-0003 (migration to KMP)

## Supersession Note

This decision has been superseded by ADR-0003. The web UI layer has been migrated from Next.js to **React + Vite** (`webApp/`), with shared business logic moved to the Kotlin Multiplatform `shared/` module. Google Maps has been replaced by Mapbox GL JS (see ADR-0005).
