// Thin web-side wrapper around the Kotlin Multiplatform `shared` module.
//
// All networking, request construction and response mapping lives in
// `shared` (Ktor). This file only holds the singleton instances and exposes
// the auth-token hook that the (future) Keycloak layer will call.
//
// See ADR-0003: domain logic and the API client are owned by `shared`; the
// web app is responsible only for UI and browser-only concerns (auth SDK,
// map rendering).
import { JsApiClient, JsAuthState } from 'shared';
import { config } from '../config.ts';

// Single shared auth state for the whole app. Until the Keycloak layer is
// wired up (separate Phase 1 task), this holds no token and the backend will
// reject protected calls — handled gracefully by the UI.
export const authState = new JsAuthState();

export const apiClient = new JsApiClient(config.backendApi, authState);

/**
 * Update the bearer token used for all subsequent API calls.
 * The Keycloak browser SDK will call this once login completes / refreshes.
 */
export function setAuthToken(token: string): void {
  authState.updateToken(token);
}

/** Clear the bearer token (e.g. on logout / token expiry). */
export function clearAuthToken(): void {
  authState.clearToken();
}
