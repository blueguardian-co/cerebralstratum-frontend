# ADR 0002: Kotlin Multiplatform Migration Plan — Web, Desktop (JVM), iOS, Android

Date: 2025-10-03

Status: Accepted

Supersedes/Amends: ADR-0001 (clarifies long-term path; retains ADR-0001 for near-term pragmatism during Phase 1)

## Context
- Current state: Web UI is a Next.js (React/TypeScript) app. KMP `shared/` module exists and is consumed by mobile targets; Desktop is not yet productized. Web consumes backend services from a separate project.
- Requirement: Provide a concrete plan to migrate this project to a Kotlin Multiplatform (KMP) codebase that supports Web UI, Desktop (JVM), iOS, and Android.
- Constraints:
  - Backend remains out-of-scope.
  - Security/supply-chain policies in the Guidelines must be satisfied (SBOM, signing, provenance, vulnerability scanning, immutability, etc.).
  - Documentation is authored in Writerside; ADRs under Writerside/topics/adrs.

## Goals
- Unify as much application logic and UI patterns as practical using Kotlin Multiplatform to reduce duplication across platforms.
- Deliver platform applications:
  1) Web UI (Kotlin/Wasm via Compose Multiplatform for Web)
  2) Desktop (JVM) via Compose Multiplatform Desktop
  3) iOS via Compose Multiplatform iOS target
  4) Android via Compose Multiplatform Android target
- Maintain delivery velocity and reduce risk via phased migration with rollback strategies.

## Non‑Goals
- Replacing or modifying backend services.
- Migrating infra repos (GitOps environment-specific configs live elsewhere) beyond adding new images and app entries needed for Web/Desktop publication.

## Target Architecture (High Level)
- Shared: `shared/` Kotlin Multiplatform module containing domain models, networking, serialization, validation, and feature logic. Strict API boundaries, stable DTOs, and contract tests.
- UI Layer: Compose Multiplatform for all platforms to maximize reuse of UI components and state management.
  - Web: Kotlin/Wasm + Compose Multiplatform for Web (served as static assets via containerized web server; no SSR required).
  - Desktop: Compose Desktop (JVM).
  - Android: Compose for Android.
  - iOS: Compose Multiplatform iOS target (UIKit integration; use Skiko/Metal under the hood).
- Platform Adapters: Small shims for auth (Keycloak/OIDC), storage, navigation, and any OS integrations. Expect/actual bridges in KMP where necessary.
- CI/CD: Tekton PaC builds per-platform; Chains provide provenance attestation; images signed with cosign; SBOM via CycloneDX; vulnerability scans (e.g., Trivy/Grype) enforced.

## Phased Migration Plan

### Phase 0 — Readiness (1–2 weeks)
- Establish Kotlin/Compose Multiplatform toolchains with pinned versions (JDK, Kotlin, Gradle, Android Gradle Plugin, Node/npm for Web packaging) and Gradle dependency locks.
- Expand `shared/` to include any missing domain logic required across platforms; confirm serialization formats and HTTP client abstractions.
- Writerside documentation updates: this ADR, development setup, and CI/CD notes.
- CI scaffolding in Tekton for matrix builds (Web/Desktop/Android/iOS) with SBOM, signing, provenance, and vulnerability scans.

### Phase 1 — Coexistence with Next.js (2–4 weeks)
- Keep Next.js in production while introducing new KMP UI as a pilot.
- Create `webApp-kmp/` (Kotlin/Wasm + Compose Web) implementing a minimal, non-critical slice (e.g., read-only dashboard). Deploy as an internal feature preview under a separate route or subdomain.
- Implement OIDC auth flow for Web (Keycloak) via JavaScript interop in Kotlin/Wasm or via a thin JS helper bridged to Kotlin.
- Validate shared module parity and networking/contracts in Web via contract/integration tests.

### Phase 2 — Feature Parity for Web and Desktop (4–8 weeks)
- Incrementally port Next.js pages/flows to Compose Web. Maintain a checklist mapping routes/features.
- Introduce Desktop app via Compose Desktop, reusing the same UI screens/state where possible.
- Build shared design system components in Compose to ensure consistent look & feel across Web/Desktop.
- Performance hardening: measure Web/Wasm bundle size, FPS, input latency; adopt code splitting and resource optimization.

### Phase 3 — Mobile Expansion (parallel 4–8 weeks)
- Android app: wire navigation, permissions, and platform-specific services; align theming with shared design system.
- iOS app: integrate Compose iOS target with UIKit hosting; set up signing, provisioning, and TestFlight.
- Shared integration tests to validate feature parity across mobile and Web/Desktop.

### Phase 4 — Cutover and Decommission (2–3 weeks)
- Execute a controlled cutover from Next.js to Web KMP UI using progressive exposure (feature flags, cohort-based rollouts).
- Freeze Next.js to critical fixes only. After a stable period and SLO confirmation, decommission Next.js and remove it from builds.
- Update GitOps manifests to promote KMP Web image as primary; ensure immutable tags and digests.

## Build, Packaging, and Publication
- Web:
  - Output: static assets (Wasm + JS) served via container image (UBI base). Apply OCI labels: repo URL, VCS SHA, semver, build date, SBOM URL, maintainers.
  - Publish to Quay: quay.io/blueguardian-co/cerebral-stratum/frontend
- Desktop (JVM):
  - Distribute as signed installers or archives as needed for internal users; no public desktop publication. Artifacts attached to releases with SBOM and signatures.
- Android:
  - AAB signed for Google Play; integrate Play Console release tracks; CI handles signing via secure key management.
- iOS:
  - IPA signed and uploaded via App Store Connect; Fastlane or equivalent can be triggered from Tekton.

## Security and Supply Chain
- SBOM: Generate CycloneDX for each platform build; attach to artifacts and annotate container images.
- Signing: cosign for container images (keyless OIDC via Tekton Chains). Sign mobile/desktop artifacts per platform practices.
- Provenance: Require SLSA/in‑toto attestations; verify at admission.
- Vulnerability scanning: Trivy/Grype in CI; fail on critical findings.
- Admission policies (GitOps/cluster): signed images from approved registries, immutable tags, runAsNonRoot, allowPrivilegeEscalation=false, resource limits, readOnlyRootFilesystem, seccompProfile=RuntimeDefault, minimal capabilities.

## Testing Strategy
- Unit + integration tests for shared module; contract tests for serialization and HTTP boundaries.
- UI tests per platform: Android (Robolectric/Instrumented + Compose UI testing), iOS (XCTest), Desktop (compose-ui-test), Web (Playwright/Cypress for a small smoke suite).
- Coverage: enforce ≥ 80% repo-wide; ≥ 90% line and ≥ 80% branch for critical modules; diff coverage ≥ 90%.
- Flake control: quarantine and fix with time-boxing; keep E2E smoke small and stable.

## Work Breakdown Structure (WBS)
1. Tooling pin + Gradle lockfiles; CI matrix and caches.
2. Shared module audit and gaps closure (DTOs, auth models, networking).
3. Create webApp-kmp skeleton; Hello World + auth bootstrap.
4. Build desktop app; share design system and navigation primitives.
5. Port top 3 flows from Next.js to Compose Web; add tests.
6. Android/iOS shells; integrate shared UI screens; platform services.
7. Observability and performance tuning (Web bundle size, FPS; Desktop memory; Mobile startup time).
8. Cutover plan, feature flags, progressive rollout; decommission Next.js.

## Risks & Mitigations
- Web/Wasm performance or library gaps: Mitigate via interop to existing JS libs and careful performance testing; stage rollout.
- Auth edge cases between platforms: Centralize OIDC logic in shared where possible; maintain platform adapters with contract tests.
- Team ramp-up on Compose: Provide internal templates and pair programming; keep initial scope small.

## Rollback Strategy
- Keep Next.js deployable through Phase 2. If regression metrics degrade, revert traffic to Next.js and iterate.

## Success Metrics
- Feature parity checklist completion.
- Error rates and performance within SLOs across platforms.
- Reduced duplicated UI/business logic and lower defect rates across platform-specific code.

## Documentation
- Writerside is the canonical source; update Developer/maintainer docs as phases progress.
- Ensure Writerside build outputs llms.txt and publish to GitHub Pages.

## Notes
- This ADR does not immediately remove Next.js; it provides the plan to transition and ultimately decommission it when risk is acceptable.
