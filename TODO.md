# TODO List

- Adopt ADR-0001 decision: Keep Next.js UI; consolidate business logic in Kotlin Multiplatform (shared). Align web with Kotlin by consuming KMP JS artifacts and (optionally) generating TypeScript declarations. 

- Web + KMP integration (near term):
  - Build JS library: `npm run kmp:js`.
  - Create a `packages/shared-js` wrapper that re-exports KMP outputs and add workspace to package.json.
  - Import `greeting` from the wrapper and display it in `app/page.tsx` to validate end-to-end.
  - Investigate generating `.d.ts` from Kotlin/JS for stronger type safety at the boundary (tooling spike).

- Optional spike (Kotlin/JS UI pilot):
  - Create a minimal Kotlin/JS UI module (kotlin-react or Compose Web) rendering a simple page calling `shared.greeting()`.
  - Keep isolated from production Next.js until viability is confirmed.

- Mobile/Desktop consumers:
  - Prepare Android/iOS consumer sample projects (or docs) showing how to use `shared`.
  - Consider adding a JVM desktop target in `shared` for desktop client logic.

- CI/CD (Pipelines as Code - Tekton):
  - Adopt Tekton Pipelines as Code for CI/CD workflows.
  - Bootstrap repository configuration for Pipelines as Code (PaC) with `.tekton/` folder and pipeline YAMLs.
  - Define PR validation pipeline: build `:shared` (all targets) and Next.js, run linters/tests.
  - Define release pipeline: tag-based or main-branch releases, build and publish artifacts as needed.
  - Configure required status checks on PRs tied to Tekton runs.

- Documentation (Writerside):
  - Standardize all user and maintainer documentation using Writerside under `Writerside/`.
  - Establish docs structure (Home, Getting Started, Architecture, Contributing, ADR index).
  - Add a docs contribution guide and local preview instructions.
  - Set up publishing workflow (local or CI) to generate and publish docs artifacts.

- Issue Tracking (YouTrack):
  - Use JetBrains YouTrack for all issue tracking and project management.
  - Create project, map states/workflows, and define issue types and templates.
  - Integrate VCS with YouTrack (commit messages, branches) and link PRs to issues.
  - Document conventions: issue keys in branch names/commits, board layout, and release process.