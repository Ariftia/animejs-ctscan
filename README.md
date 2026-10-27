# Inside a CT scanner

A scroll-driven educational CT scanner experience built with Next.js 15, React 19, React Three Fiber, Three.js, and Anime.js. The root route follows acquisition through reconstruction; `/lab` previews model assets.

## Local development

Install the pinned dependencies with `npm ci`, then run `npm run dev` and open `http://localhost:3000`. No application credentials are required. The project uses Node.js; a supported version policy has not been established.

Development diagnostics are hidden by default. Append `?debug=1` to the root URL to show the panel during development. The panel is omitted in production, and the Next.js development badge is disabled.

## Verification

Run `npm run lint`, `npm run typecheck`, and `npm run build`. Start the application before running `node scripts/qa.mjs`; `QA_BASE_URL` overrides the default `http://127.0.0.1:3000`. Playwright requires Chromium (`npx playwright install chromium`). `npm run start` serves a production build.

The QA script checks a stationary story camera in development, fixed mobile canvas bounds through explorer entry, transparent explorer surfaces, component selection, single-open accordion explanations, keyboard collapse, responsive layout including the 320×568 explorer, mid-story reduced-motion preference changes, and shared phantom slice geometry/tissue contrast.

For visual changes, inspect forward/reverse scrolling, resizing, mobile layout, reduced motion, and browser console output. Contribution and asset conventions are in [AGENTS.md](AGENTS.md).

## Local artifacts

Build output, TypeScript caches (`*.tsbuildinfo`), test reports, package-manager logs, local environment/key files, generated showcase videos (`public/videos/`), and local recording experiments (`scripts/local/`) are ignored by Git. Recording experiments are local utilities, not maintained application scripts; keep exported videos outside commits unless intentionally publishing an asset.

## Project context

- [Requirements](PRD.md)
- [Design](DESIGN.md)
- [Current state](STATE.md)
- [Worklog](WORKLOG.md)
- [Exterior asset provenance](public/reference/ct-product-references.md)

The scanner and anatomy are educational illustrations, not dimensionally accurate clinical devices or diagnostic images. Browser support beyond the tested Chromium environment is not established.

## GitHub Actions and Coolify

`.github/workflows/deploy-coolify.yml` runs lint, TypeScript, a production build, and Playwright QA for pull requests and pushes to `main`. Successful pushes to `main` trigger Coolify; the workflow can also be run manually on `main`. Pull requests never receive deployment credentials.

Configure these **repository Actions secrets**, never files in this public repository:

- `COOLIFY_DEPLOY_WEBHOOK`: the application's HTTPS **Webhooks → Deploy Webhook (auth required)** URL.
- `COOLIFY_TOKEN`: an API token for the application's Coolify team, preferably restricted to deployment permission.

From an authenticated local terminal, `gh secret set COOLIFY_DEPLOY_WEBHOOK` and `gh secret set COOLIFY_TOKEN` prompt for their values without putting them in command history. Enable Coolify API access and ensure the instance is reachable from GitHub-hosted runners. The application must use this repository's `main` branch, Nixpacks, `npm run build`, `npm run start`, and port 3000. Disable Coolify's separate deploy-on-push trigger if deployments should wait for these CI checks.

The workflow uses GitHub's secret store, sends the token only in an HTTPS Authorization header, refuses redirects, and does not log the webhook or response body. Missing secrets skip deployment with a notice while CI still runs. An accepted request means deployment was triggered; confirm the resulting deployment finishes and the public application works in Coolify. If a request times out, inspect deployment state before retrying.

Setup follows [Coolify's deploy webhook documentation](https://coolify.io/docs/core/automation/deploy-webhooks). Coolify activation is deferred for now. The target instance, application, and credentials still need to be configured; they are intentionally absent from the source tree.
