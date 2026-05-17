# About

CEREBRAL STRATUM Frontend is the user interface for the CEREBRAL STRATUM IoT management platform.

## Purpose

The application provides:
- Real-time device tracking and monitoring on an interactive map
- Device management and filtering
- Notifications for device events
- Secure authentication via Keycloak (OpenID Connect)

## Technology

Built with Kotlin Multiplatform (KMP) for shared business logic, and React 18 + TypeScript + Vite for the web UI layer.
Native Android, iOS, and Desktop clients share core logic via the `shared/` KMP module.
