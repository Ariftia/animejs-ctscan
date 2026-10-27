# Project state

Updated: 2026-10-27 (UTC).
Current task: Ponytail audit corrections.

## Current behavior

Changing reduced-motion preferences mid-story now rebuilds the timeline from the original motion values and seeks immediately to the current progress. Returning to the hero restores the assembled scanner. Mobile explorer copy scrolls within a bounded lower panel, keeping expanded explanations clear of the fixed model/navigation on short screens. Unused legacy procedural parts and the superseded patient table are removed.

Part 12 component buttons now open an explanation directly below the row and focus the camera on that component's actual world bounds. Selection isolates the part, including hiding the floor shadow; closing returns to the complete scanner overview. Model clicks share that selection. Only one labelled panel is expanded at once, with keyboard-operable controls. Reduced motion switches camera pose immediately and direct orbit input interrupts animated focusing.


The beam-to-volume progress track is removed. The scanner canvas remains full size through the story and explorer, with one fixed mobile view offset. Camera-scaled orbit limits prevent the explorer entry zoom clamp; root scanner rotation no longer changes with scroll. Explorer and canvas backgrounds are transparent; empty overlay space passes interaction through to the model.

The scanned object and 15 reconstructed slices now share the PHANTOM body, two lung regions, spine, axial orientation, center, and full depth. Unrelated capsule geometry and synthetic heart/ribs/taper are removed. Slice reveal remains; the result no longer rotates, drifts, or changes scale as it resolves.

The diagnostics panel is hidden by default and is available only with `?debug=1` during development. The Next.js development badge is disabled. Lint, TypeScript, production build, and browser QA passed; the normal preview capture shows neither the panel nor the Next.js badge.

The camera, scanner position, and machine angle stay fixed throughout the story; all desktop copy remains on the left. Automatic story camera pans and zooms are removed; explicit explorer selection can focus the camera. Explosion/scroll-driven rotation are reduced 45%, and live acquisition rotation slows from 0.65 to 0.2 radians per second. Mobile canvas size remains fixed through reassembly in both directions. The projection chart now labels fixed 0°/45°/90°/135°/180° attenuation profiles with detector position and holds their values steady. Reconstruction uses a synthetic slice stack and crossfades the hardware away; transparent surfaces no longer write occluding depth.

The bed assembly has been raised by 0.30 model units to align the pedestal floor with the gantry and clear the lower bore rim. Geometry calculations, lint, TypeScript, production build, and the complete browser QA suite passed.

Scanner framing reserves space opposite story copy, fits exploded geometry and data displays, and preserves the explorer framing on entry and adapts to resize. Responsive headings and metadata fit 320–1920px widths. Labels follow the model side; right-aligned body text shares the heading edge. Component rows have visible keyboard focus, expanded-state controls, and labelled explanation regions. Scene notifications follow centralized timeline ranges.

## Verified

- Audit corrections (2026-10-27 UTC): lint, TypeScript, production build, and expanded production Playwright QA passed at http://127.0.0.1:3002 with no captured console/request errors. Both directions of mid-story motion-preference switching restore the identical hero canvas. At 320×568, expanded explorer copy remains below navigation/model space and the last component is reachable. Inspected short-mobile and standard-mobile captures.

- `npm run lint`, `npm run typecheck`, and `npm run build`: passed.
- `QA_BASE_URL=http://127.0.0.1:3001 node scripts/qa.mjs`: passed against the final production build. Shared phantom tissue contrast/silhouettes and transparent exterior pixels, progress-track removal, fixed forward/reverse mobile canvas bounds, transparent explorer pointer behavior, page scrolling over explorer text, component selection, projection labels, one canvas, responsive headings at 320/800/1024/1920px, and no captured console/request errors. Desktop 1440×900, mobile 390×844, and reduced motion 1280×720.
- Explorer accordion checks passed all five rows, single-open explanation regions, keyboard collapse, mobile selection, reduced-motion selection, and direct model-click collapse without hidden-geometry interception. Additional captures verified all five component close-ups and overview restoration on desktop/mobile.
- Earlier rendered checks passed explorer drag/rotation, wheel zoom without page scrolling, and an 800×844 explorer layout. Inspected matched-object and final-volume captures: both occupy the same position and share the same silhouette, two lung regions, and spine.
- Mechanical design scan: two incumbent font-style warnings; typography intentionally preserved as documented in [DESIGN.md](DESIGN.md).

## Verification limits

Browser coverage is limited to headless Chromium; physical touch devices and other browser engines remain unverified. No new application dependencies or external assets were added. The explicit development-only camera readout assertion is not run against production; the production suite checks fixed canvas bounds, with all five component focus poses and overview restoration inspected visually.

See [PRD.md](PRD.md), [DESIGN.md](DESIGN.md), [README.md](README.md), and [WORKLOG.md](WORKLOG.md).

## Next step

All required checks passed. Physical touch devices and other browser engines remain the next verification gap.
