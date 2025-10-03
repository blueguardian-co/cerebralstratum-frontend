Monorepo: Next.js UI + Kotlin Multiplatform shared code.

This repository contains a Next.js web UI and a Kotlin Multiplatform (KMP) module under shared/ for cross‑platform business logic shared by Web, Android, iOS, and Desktop (JVM).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Kotlin Multiplatform module (shared/)

Build all targets:

```bash
./gradlew :shared:build
```

Example common API defined in shared/src/commonMain:
- function: com.cerebralstratum.shared.greeting(AppInfo)

JS target produces a library artifact (IR). Initial integration plan with Next.js:
1. Build JS library: `./gradlew :shared:jsBrowserProductionLibraryDistribution` (or `:shared:build`).
2. Consume artifact in Next.js via a local package step (to be set up next), or through a simple wrapper published to an internal registry.

Android and iOS targets build a library/framework that native apps can consume. Desktop can be added later as a JVM target if needed.

## Architecture Decision Records
- ADR-0001 — Web Stack Decision: keep Next.js for Web UI initially while using KMP for shared logic. See Writerside: Writerside/topics/adrs/0001-web-stack-decision.md.
- ADR-0002 — Kotlin Multiplatform Migration Plan: phased plan to deliver Web (Kotlin/Wasm), Desktop (JVM), iOS, Android, and decommission Next.js after cutover. See Writerside: Writerside/topics/adrs/0002-kmp-migration-plan.md.

## Documentation
Writerside is the canonical documentation source for this repository. The site is published to GitHub Pages:
- https://cerebralstratum-frontend.github.io

Edit docs under Writerside/. Writerside should also output llms.txt as part of the build.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
