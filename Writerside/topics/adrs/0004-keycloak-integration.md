# ADR-0004: Keycloak Integration Approach

Date: 2026-03-23

## Status

Accepted

## Context

The application requires OIDC authentication via Keycloak. Constraints:
- `keycloak-js` is a browser-only SDK with no Kotlin Multiplatform equivalent.
- The Kotlin `shared/` module must be able to attach bearer tokens to API requests across all platforms (Web, Android, iOS, Desktop).
- On Android/iOS/Desktop, native OIDC libraries will be used in future phases.

## Options Considered

### A. Auth entirely in React/TypeScript
React `AuthProvider` initialises `keycloak-js`, stores the token in React context, and passes it directly to fetch calls in TypeScript.

- Pros: simplest for the web MVP.
- Cons: token management logic (refresh, expiry) is not shared with native clients; `ApiClient` cannot be in `commonMain` if it needs direct token access.

### B. Kotlin `shared/` manages token state; React handles browser Keycloak init only
React `AuthProvider` initialises `keycloak-js`, extracts the token, and passes it to a Kotlin `JsAuthState` object exposed via `@JsExport`. Kotlin `ApiClient` in `commonMain` depends on an `AuthStateProvider` interface and reads the token from it for every request.

- Pros: token storage and auth-gated request logic lives in Kotlin, reusable on Android/iOS via platform-specific implementations of `AuthStateProvider`.
- Cons: slight complexity at the JS/Kotlin boundary for the token handoff.

## Decision

Option B. React handles browser-specific `keycloak-js` initialisation. Kotlin `JsAuthState` in `shared/jsMain` receives and stores the token. `ApiClient` in `shared/commonMain` depends on `AuthStateProvider` abstractly.

## Interface Contract

```kotlin
// shared/commonMain
interface AuthStateProvider {
    fun getToken(): String?
    fun isAuthenticated(): Boolean
}

// shared/jsMain
@JsExport
class JsAuthState : AuthStateProvider {
    fun updateToken(newToken: String)
    fun clearToken()
}
```

React `AuthProvider` calls `jsAuthState.updateToken(keycloak.token)` after each successful init or refresh, and `jsAuthState.clearToken()` on logout.

## Keycloak configuration

- Flow: `standard` (Authorization Code + PKCE)
- `onLoad`: `check-sso` (silent SSO check; `login()` called explicitly when needed)
- `pkceMethod`: `S256`
- `checkLoginIframe`: `false`
- Token refresh: every 30 seconds, `updateToken(90)` minimum validity

## Environment variables

Injected at runtime via `window.__env__` (see ADR-0006):
- `KEYCLOAK_URL`
- `KEYCLOAK_REALM`
- `KEYCLOAK_CLIENT_ID`

## Consequences

- `keycloak-js` is a `webApp/` npm dependency only; never imported into Kotlin.
- `AuthStateProvider` in `commonMain` allows Android/iOS to supply their own token implementations without touching `ApiClient`.
- The `ApiClient` constructor takes `baseUrl: String` and `authState: AuthStateProvider`.
