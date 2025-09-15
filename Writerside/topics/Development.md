# Development

## Definitions and Policies

### Critical modules

#### Critical modules (definition)
Critical modules are areas where defects can compromise security, data integrity, availability, or contractual behavior. In this project, that includes:
- Security/auth (authentication/authorization, token/session handling, input validation)
- Data/persistence (DB/KV layers, schema/migrations, caching/invalidation, PII handling)
- Contracts/serialization (DTOs/schemas, JSON serialization, API compatibility; KMP ↔ JS models)
- Concurrency/state (coroutines/flows, threading/synchronization, retries/idempotency)
- Platform boundaries (KMP expect/actual bridges, platform shims, feature flags/config gates)
- Payments/business rules (if present)

#### Critical modules (policy)
- Coverage: ≥ 90% line and ≥ 80% branch; enforced in CI. Drops require a waiver (YouTrack link) and CODEOWNERS approval.
- Diff coverage: ≥ 90% on changed lines for PRs; same waiver process for exceptions.
- Reviews/change control: CODEOWNERS review required. Breaking contract/schema changes must include migration + rollback notes in `Writerside`.
- Test scope: unit + contract/integration first; property-based tests where valuable. Keep E2E to the smoke suite.
- Observability: add/update logs/metrics for key failure modes impacted by the change.
- Waivers: temporary, YouTrack-linked, and recorded in `Writerside` release notes or tech-debt logs.