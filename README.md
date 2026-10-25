# Inside a CT scanner

A scroll-driven educational CT scanner experience built with Next.js 15, React 19, React Three Fiber, Three.js, and Anime.js. The root route follows acquisition through reconstruction; `/lab` previews model assets.

## Local development

Install the pinned dependencies with `npm ci`, then run `npm run dev` and open `http://localhost:3000`. No application credentials are required. The project uses Node.js; a supported version policy has not been established.

Development diagnostics are hidden by default. Append `?debug=1` to the root URL to show the panel during development. The panel is omitted in production, and the Next.js development badge is disabled.

## Verification

Run `npm run lint`, `npm run typecheck`, and `npm run build`. Start the application before running `node scripts/qa.mjs`; `QA_BASE_URL` overrides the default `http://127.0.0.1:3000`. Playwright requires Chromium (`npx playwright install chromium`). `npm run start` serves a production build.

The QA script checks a stationary story camera in development and reversible mobile framing transitions, along with selection, responsive layout, reversible signal-path progress, and reduced-motion stage fills.

For visual changes, inspect forward/reverse scrolling, resizing, mobile layout, reduced motion, and browser console output. Contribution and asset conventions are in [AGENTS.md](AGENTS.md).

## Project context

- [Requirements](PRD.md)
- [Design](DESIGN.md)
- [Current state](STATE.md)
- [Worklog](WORKLOG.md)
- [Exterior asset provenance](public/reference/ct-product-references.md)

The scanner and anatomy are educational illustrations, not dimensionally accurate clinical devices or diagnostic images. Browser support beyond the tested Chromium environment is not established.
