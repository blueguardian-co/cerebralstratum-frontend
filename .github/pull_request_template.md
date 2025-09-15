## Summary
- What does this change do and why?
- Linked YouTrack issue: CSPROD-####

## Risk assessment
- Touches critical modules? (auth, persistence, serialization, concurrency, platform bridge, security boundary, payments/business rules)
    - [ ] No
    - [ ] Yes → list modules/packages:

## Checks
- Tests
    - [ ] Unit/integration tests added or updated
    - [ ] Diff coverage ≥ 90% on changed lines (CI will verify)
    - [ ] If critical modules were changed: ≥ 90% line and ≥ 80% branch coverage maintained (CI will verify)
    - [ ] E2E/UI smoke tests pass (if applicable)
- Quality
    - [ ] Kotlin: ktlint/detekt pass
    - [ ] JS/TS: eslint/prettier pass
- Security & supply chain (CI will verify most of these)
    - [ ] SBOM (CycloneDX) generated/attached to artifacts/images
    - [ ] Image signing with cosign and provenance (Tekton Chains) present
    - [ ] Vulnerability scan passed (no Critical; Highs reviewed/waived with justification)
- GitOps/Deployment (if manifests changed)
    - [ ] No `latest` tags; immutable tags used and, where possible, pinned by digest
    - [ ] OCI labels applied (repo URL, commit SHA, version, build date, SBOM ref, maintainers)
- Documentation
    - [ ] Writerside docs updated (user/dev/ops as applicable)
    - [ ] ADR or migration/rollback notes are added if contracts or schemas are changed
- Governance
    - [ ] Commits are signed
    - [ ] CODEOWNERS approvals obtained
    - [ ] Any temporary waivers are documented with a YouTrack link

## Screenshots / UI notes (if applicable)
<!-- Add before/after images or a brief note on UI changes -->

## Rollout / Backout
- Rollout plan:
- Backout plan: