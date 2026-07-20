# CLAUDE.md

> **Authoritative guidance:** Project policies (CI/CD, security/supply-chain, testing
> thresholds, deployment/GitOps, documentation) are defined in [`.junie/guidelines.md`](.junie/guidelines.md)
> and authored in [`Writerside`](Writerside). This file is a developer quick-reference; where it
> overlaps with those sources, the stricter Junie guidelines take precedence.

## Project Overview

**CEREBRAL STRATUM Frontend** — A Kotlin Multiplatform (KMP) project targeting Web, Desktop (JVM), Android, and iOS.

- **Package namespace:** `co.blueguardian.cerebralstratum.frontend`
- **Active branch:** `kotlin`

## Architecture

### Modules

| Module | Purpose |
|---|---|
| `shared/` | KMP shared library — `expect`/`actual` platform abstractions, exported to JS |
| `composeApp/` | Compose Multiplatform UI — Android, Desktop (JVM), and common composables |
| `webApp/` | React + TypeScript web app, consumes Kotlin/JS output from `shared/` |
| `iosApp/` | iOS native entry point (Swift/Xcode) |

### Shared Module Targets
- `androidMain`, `iosMain` (ARM64 + Simulator), `jvmMain`, `jsMain` (browser)
- Generates TypeScript definitions for JS interop (`@JsExport`)

## Tech Stack

| Layer | Technology |
|---|---|
| Shared logic | Kotlin 2.3.0, Kotlin Multiplatform |
| Mobile/Desktop UI | Compose Multiplatform 1.10.0, Material3 |
| Web UI | React 18, TypeScript 5, Vite 7 |
| Build | Gradle 8.14 (KTS), AGP 8.12.0 |
| Coroutines | Kotlinx Coroutines 1.10.2 |
| Android SDK | Min 24, Target/Compile 36 |

## Build & Run

### Prerequisites
- JDK 11+
- Node.js + npm
- Android SDK (for Android targets)
- Xcode (for iOS)

### Web App (React, port 8080)
```bash
./gradlew :shared:jsBrowserDevelopmentLibraryDistribution
npm install
npm run start        # dev server at http://localhost:8080
npm run build        # production build
```

### Android
```bash
./gradlew :composeApp:assembleDebug
```

### Desktop (JVM)
```bash
./gradlew :composeApp:run
```

### iOS
Open `iosApp/` in Xcode and run from the IDE.

> **Distribution note:** Desktop (JVM) and native apps above are supported for local
> development only. Per project policy, desktop applications are **not published** — the
> web version is the distribution channel and is published as signed container images
> (Red Hat UBI base) to Quay. iOS/iPadOS/watchOS ship via App Store Connect and Android
> via Google Play Console. See [`.junie/guidelines.md`](.junie/guidelines.md) for details.

### Tests
```bash
./gradlew test
```
Test sources live in `shared/src/commonTest/` and `composeApp/src/commonTest/`.

## Dependency Management

- **Kotlin/Gradle deps:** `gradle/libs.versions.toml` (version catalog)
- **npm deps:** `webApp/package.json`; root `package.json` defines the npm workspace

## Key Conventions

### Kotlin
- `expect`/`actual` pattern for platform-specific code
- `@JsExport` + `@OptIn(ExperimentalJsExport::class)` to expose Kotlin to JS
- Composable UI with `@Composable`; state via `remember` + `mutableStateOf`

### TypeScript/React
- Strict TypeScript (`strict: true`, no unused locals/params)
- Kotlin/JS interop: `import { Greeting as KotlinGreeting } from 'shared'`
- Functional components with hooks

### Gradle
- All plugin and library versions centralised in `gradle/libs.versions.toml`
- Configuration cache and build cache enabled (`gradle.properties`)
- JVM args: Kotlin daemon 3072 MB, Gradle 4096 MB

## Gradle Performance Flags (`gradle.properties`)
```
kotlin.code.style=official
kotlin.daemon.jvmargs=-Xmx3072M
org.gradle.jvmargs=-Xmx4096M -Dfile.encoding=UTF-8
org.gradle.configuration-cache=true
org.gradle.caching=true
android.nonTransitiveRClass=true
android.useAndroidX=true
```

## YouTrack Bridge (ADRs & Implementation Tracking)

YouTrack (`https://youtrack.blueguardian.co`) is the authoritative source for
tasks, lines of effort, and ADR staging. This repo's `Writerside/topics/ADRs/`
directory is the authoritative source for **merged** ADR content. Claude Code is
the bridge between the two — Claude (claude.ai) drafts, Claude Code commits.

### ADR lifecycle

1. **Draft** — An ADR is drafted in a claude.ai session and created as a
   YouTrack **article** under this component's root article (see
   `YOUTRACK_ROOT_ARTICLE` below), tagged `status: draft`.
2. **Migrate** — When asked to "sync ADRs" or "pull ADR <id>", Claude Code:
   - Fetches the article via YouTrack MCP (`get_article`).
   - Writes it to `Writerside/topics/ADRs/0XXX-<slug>.md` in this repo,
     preserving the Context / Decision / Alternatives Considered / Consequences
     / Open Items / Forward Pointers structure verbatim.
   - Registers the new topic under the `ADRs.md` toc-element in `cs-f.tree`.
   - Commits with message `docs(adr): add ADR-0XX <title>`.
   - Reports back the commit SHA and file path.
3. **Close the loop** — Claude (claude.ai) updates the source article: tag
   flips to `status: merged`, and a line is appended noting the repo path and
   commit link. The article remains as a searchable index entry; the
   `Writerside/topics/ADRs/` file is the canonical content going forward — do
   not edit the article further after this point. Corrections happen in-repo
   via normal PR flow.

`YOUTRACK_ROOT_ARTICLE`: [CSPROD-A-11](https://youtrack.blueguardian.co/articles/CSPROD-A-11) — "Frontend" (child of Architecture Decision Records, `CSPROD-A-5`).

### Implementation tracking (issues)

Each ADR that requires implementation work gets a matching **Epic** in
YouTrack (same project as the article, `Type: Epic`), linked to the article
by ID in its description. Concrete work is filed as `Task` / `Sub-task`
issues under that Epic.

Fields in use (CSPROD project):
- `Type`: Epic, Story, Task, Sub-task, Bug, New Feature, Bug Fix
- `Subsystem`: backend, frontend, iOS, firmware, infra
- `State`: Backlog, Selected for Development, In Progress, Fixed, Done,
  Open, Duplicate
- `Priority`: Highest, High, Medium, Low, Lowest

**Claude Code's responsibility during implementation work:**
- When starting work on a ticket, move `State` to `In Progress`
  (`update_issue`).
- When a PR lands that implements a ticket, move `State` to `Fixed` (or
  `Done` for Epics once all children are closed) and reference the commit/PR
  in a comment or the issue description.
- Do not close/re-prioritize tickets outside the scope of the current task —
  only touch the ticket(s) explicitly being worked.
- If work reveals the ADR itself needs revision (an Open Item gets resolved,
  a Consequence turns out wrong), flag this back rather than silently
  editing `Writerside/topics/ADRs/*.md` — ADR amendments are a deliberate
  decision-first step, same as original drafting.

This gives a real feedback loop: ticket state in YouTrack reflects actual
implementation progress against the ADR, not just intent.

---

## Governance & Quality Gates

These cross-cutting requirements live in [`.junie/guidelines.md`](.junie/guidelines.md) and
[`Writerside`](Writerside); summarised here so they aren't overlooked:

- **Docs:** Developer/maintainer/end-user docs are authored in `Writerside` (canonical); this
  `README.md`/`CLAUDE.md` link to it.
- **Testing:** `kotlin.test` + `kover` (KMP) and `vitest`/`jest` + RTL (web); enforce coverage
  thresholds (≥ 80% baseline, ≥ 90% diff coverage; critical modules ≥ 90% line / ≥ 80% branch).
- **Quality/style:** Kotlin via `ktlint`/`detekt`/`spotless`; TS/JS via `eslint`/`prettier`
  (strict TypeScript). Pin all toolchains and dependencies.
- **Supply chain:** Generate CycloneDX SBOMs, sign artifacts/images with `cosign`, require
  SLSA/in-toto provenance (Tekton Chains), and run vulnerability scans in CI.
- **Process:** Trunk-based development with short-lived branches; signed commits on protected
  branches; PRs must pass linters, tests, SBOM, signing, provenance, and scans.
- **Deploy:** GitOps via Argo CD + Argo Rollouts to OpenShift; pin images by immutable
  tag/digest (no `latest`).
