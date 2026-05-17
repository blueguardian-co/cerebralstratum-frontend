# CLAUDE.md

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
org.gradle.jvmargs=-Xmx4096m
kotlin.daemon.jvm.options=-Xmx3072m
org.gradle.configuration-cache=true
org.gradle.caching=true
android.useAndroidX=true
android.nonTransitiveRClass=true
```
