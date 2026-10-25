# Project state

Updated: 2026-10-25 (Asia/Jakarta).
Current task: Fix scanner jumps during scrolling and polish reconstruction.

## Current behavior

Camera lane changes now blend from normalized progress instead of snapping when the active scene changes. Mobile canvas size interpolates through reassembly in both directions. Reconstruction uses one sharper synthetic slice and crossfades the hardware away; transparent surfaces no longer write occluding depth.

The bed assembly has been raised by 0.30 model units to align the pedestal floor with the gantry and clear the lower bore rim. Geometry calculations, lint, TypeScript, production build, and the complete browser QA suite passed. The dev preview is running on port 3000; device-side port forwarding is not confirmed.

Scanner framing reserves space opposite story copy, fits exploded geometry and data displays, and initializes the explorer view on entry/resize. Responsive headings and metadata fit 320–1920px widths. Labels follow the model side; right-aligned body text shares the heading edge. Component selection has visible keyboard focus and pressed-state semantics. Scene notifications follow centralized timeline ranges.

## Verified

- `npm run lint`, `npm run typecheck`, and `npm run build`: passed.
- `node scripts/qa.mjs`: passed against the running development preview after the production build. Camera continuity across 10,001 progress samples and forward/reverse mobile framing checks also passed. Desktop/mobile/reduced-motion rendering, one canvas, no page overflow or framework overlay, forward/reverse scene changes, component selection, heading fit at 320/800/1024/1920px, and no captured console/request errors.
- Mechanical design scan: two incumbent font-style warnings; typography intentionally preserved as documented in [DESIGN.md](DESIGN.md).

## Verification limits

Explorer orbit drag, wheel zoom without page scrolling, mobile component details, and resize inspection passed. The final production QA rerun passed, including an assertion that the compact mobile explorer clears its heading. Browser coverage is limited to headless Chromium; physical touch devices and other browser engines remain unverified. No new application dependencies or assets were added.

See [PRD.md](PRD.md), [DESIGN.md](DESIGN.md), [README.md](README.md), and [WORKLOG.md](WORKLOG.md).

## Next step

Scroll transitions and reconstruction polish are verified. Camera continuity tests, lint, TypeScript, production build, and expanded browser QA passed. The development preview is running on port 3000.
