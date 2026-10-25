# Project state

Updated: 2026-10-26 (Asia/Jakarta).
Current task: Enhance educational content and signal-to-image animation.

## Current behavior

The story now explains the complete beam-to-volume journey and includes a closing reassembly chapter. Acquisition chapters show a reversible four-stage signal diagram driven by the existing scroll loop. Reconstruction resolves 15 synthetic cross-sections and gathers them into a compact stack, replacing the capsule/block overlay; reduced motion uses fixed spacing/orientation and fully resolved slice textures. Explorer selection descriptions are announced politely. No dependencies or external assets were added.

The diagnostics panel is hidden by default and is available only with `?debug=1` during development. The Next.js development badge is disabled. Lint, TypeScript, production build, and browser QA passed; the normal preview capture shows neither the panel nor the Next.js badge.

The camera, scanner position, and machine angle stay fixed throughout the story; all desktop copy remains on the left. Automatic camera pans and zooms are removed. Explosion/scroll-driven rotation are reduced 45%, and live acquisition rotation slows from 0.65 to 0.2 radians per second. Mobile canvas size interpolates through reassembly in both directions. The projection chart now labels fixed 0°/45°/90°/135°/180° attenuation profiles with detector position and holds their values steady. Reconstruction uses a synthetic slice stack and crossfades the hardware away; transparent surfaces no longer write occluding depth.

The bed assembly has been raised by 0.30 model units to align the pedestal floor with the gantry and clear the lower bore rim. Geometry calculations, lint, TypeScript, production build, and the complete browser QA suite passed. The production preview for this task runs on port 3001; device-side port forwarding is not confirmed.

Scanner framing reserves space opposite story copy, fits exploded geometry and data displays, and initializes the explorer view on entry/resize. Responsive headings and metadata fit 320–1920px widths. Labels follow the model side; right-aligned body text shares the heading edge. Component selection has visible keyboard focus and pressed-state semantics. Scene notifications follow centralized timeline ranges.

## Verified

- `npm run lint`, `npm run typecheck`, and `npm run build`: passed.
- `QA_BASE_URL=http://127.0.0.1:3001 node scripts/qa.mjs`: passed against the final production build. Signal progression/reversal and discrete reduced-motion stages, projection labels, mobile label fit, reversible mobile framing, component selection, one canvas, no overflow/overlay, headings at 320/800/1024/1920px, and no captured console/request errors. Desktop 1440×900, mobile 390×844, and reduced motion 1280×720.
- Visually inspected the source/measurement diagrams, mobile layout, partial reconstruction reveal, and resolved 15-slice volume.
- Mechanical design scan: two incumbent font-style warnings; typography intentionally preserved as documented in [DESIGN.md](DESIGN.md).

## Verification limits

Explorer orbit drag, wheel zoom without page scrolling, mobile component details, and resize inspection passed. The final production QA rerun passed, including an assertion that the compact mobile explorer clears its heading. Browser coverage is limited to headless Chromium; physical touch devices and other browser engines remain unverified. No new application dependencies or assets were added.

See [PRD.md](PRD.md), [DESIGN.md](DESIGN.md), [README.md](README.md), and [WORKLOG.md](WORKLOG.md).

## Next step

All required checks passed. Review the enhanced experience at http://localhost:3001. Other browser engines and physical touch devices remain unverified.
