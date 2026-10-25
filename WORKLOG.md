# Worklog

## 2026-10-25 (Asia/Jakarta) — CT scanner placement polish

- Model: Not available.
- Request: Polish the CT scanner, including placement.
- Changes: Reserve camera lanes opposite story copy; pull back for the exploded assembly and data displays; recenter the sinogram; finish reassembly at the explorer pose and initialize framing on explorer entry/resize. Match the inclusive 800px breakpoint across camera/model/CSS; give the mobile explorer a compact canvas below navigation so the model clears the heading. Fit headings and metadata to narrow screens; align right-side paragraphs and model annotations. Add selection focus/pressed state and improve selected-text contrast.
- Bug fix: Scene updates previously used equal twelfths despite nonuniform timeline boundaries. They now use centralized `sceneAt`, with a forward/reverse boundary regression check.
- Verification: `npm run lint`, `npm run typecheck`, and `npm run build` passed. Production `node scripts/qa.mjs` passed desktop/mobile/reduced-motion rendering, forward/reverse scenes, component selection, single canvas, overflow/heading checks at 320–1920px, and console/request health. Inspected hero, exploded, X-ray, sinogram, reconstruction, and explorer captures. Mechanical design scan reported only two existing font-style warnings; existing typography is deliberately retained.
- Documentation: Initialized absent README, PRD, DESIGN, STATE, and WORKLOG using bundled templates and verified repository behavior. AGENTS already provides contribution/check guidance.
- Limits: Chromium only; no physical touch-device verification. No application dependencies or asset downloads added; browser tooling required installing the matching Chromium version.
- Additional verification: Temporary Playwright interaction checks passed orbit drag, wheel zoom without scrolling the page, mobile detector selection/detail visibility, and explorer resize. The mobile explorer capture exposed a model/heading overlap at the end of the story; a compact explorer canvas and a permanent QA geometry assertion address it. Final production QA rerun passed, including the mobile model/heading clearance assertion.
- Delivery: Implementation and verification complete; ready for the local task commit.

## 2026-10-25 (Asia/Jakarta) — Align the patient bed

- Model: Not available.
- Request: Correct the bed placement and start a local development preview on port 3000.
- Change: Raised the table assembly from -1.34 to -1.04 model units in both its initial transform and animated position. This aligns the pedestal floor with the gantry base and moves the tabletop through the open bore instead of the lower enclosure. Existing explosion offsets remain relative to the corrected assembled position.
- Geometry check: Pedestal and gantry floor heights differ by 0.0075 model units; the tabletop's lower corner radius is 1.1870, inside the 1.19 bore liner radius.
- Verification: Lint, TypeScript, production build, and the complete Playwright QA script passed with no captured browser errors. The updated hero capture shows the bed entering the opening with its head pad visible; forward/reverse scenes, explorer selection, mobile, resize, and reduced-motion checks passed.
- Preview: Development server started on 0.0.0.0:3000; HTTP 200 confirmed. Side-panel browser opening queued. No port-forwarding tool is exposed, so a device-side tunnel is unverified.
- Remaining limits: Chromium only; physical devices and other engines unverified.

## 2026-10-25 (Asia/Jakarta) — Fix scrolling discontinuities

- Model: Not available.
- Request: Fix the CT scanner glitching during scroll and polish reconstruction.
- Root cause: Camera framing switched between left/right lanes immediately on active-scene changes. The mobile canvas also changed height immediately at the explorer boundary. These discrete updates caused visible jumps despite continuous timeline values. Shell, ring, and table visibility also used hard progress cutoffs.
- Change: Added a smooth, progress-derived camera offset using centralized scene ranges. Mobile canvas height/top now interpolate through reassembly without replacing the canvas. Shell, ring, and table now fade through centralized scene ranges and are hidden only when nearly transparent. Transparent scanner surfaces stop writing depth while faded; scanner hardware crossfades out during reconstruction. Replaced seven overlapping opaque slice planes with one sharper 512px synthetic axial image, stable shader uniforms, and a matching caption.
- Regression checks: Added camera continuity checks at every scene boundary and 10,001 forward/reverse progress samples, plus browser assertions that mobile framing shrinks monotonically and retraces its path in reverse. Existing selection, single-canvas, responsiveness, and reduced-motion checks remain.
- Verification: Camera continuity self-check, lint, TypeScript, production build, and the expanded Playwright QA suite passed with no captured console/request errors. Browser inspection verified progressive mobile canvas heights of approximately 387/295/203/142/127px and the same values on reverse scroll, plus a clean reconstruction capture. The development preview was restarted on port 3000 after the build.
- Limits: Headless Chromium; no physical touch-device or other browser-engine verification. No new dependencies or external assets.

## 2026-10-25 (Asia/Jakarta) — Reduce excessive scanner motion

- Model: Not available.
- Request: The CT scanner moves too much; clarify the floating cyan bars in the projection scene.
- Change: Keep one fixed camera pose, scale, target, and machine angle through the story. Put all desktop copy on the left and keep the model on the right, removing lane swaps, camera pans, and automatic zooms. Reduce explosion and scroll-driven rotation to 55% of the former amount (18% with reduced motion); slow live acquisition rotation from 0.65 to 0.2 radians/second. Manual explorer orbit and existing part fades remain.
- Projection clarification: Label fixed-angle attenuation profiles, align rows on a common baseline, increase contrast, and hold each sampled view steady. Precompute detector profiles instead of recalculating moving bar heights each frame.
- Cleanup: Remove the unused camera lane interpolation, its dedicated test, and obsolete alternating-layout styles. Extend browser QA to compare the story camera pose before and after scrolling in development.
- Verification: Lint, TypeScript, production build, and complete Playwright QA passed. The development camera pose remained identical between hero and reconstruction. Projection labels matched all five sampled angles and fit the mobile viewport; desktop/mobile captures, reverse scrolling, reduced motion, and explorer selection passed with no captured browser errors. The dev preview remains on port 3000.
- Limits: Chromium only; physical devices and other browser engines remain unverified. No new dependencies or assets.

## 2026-10-25 (Asia/Jakarta) — Hide preview diagnostics

- Model: Not available.
- Request: Hide the progress/scene/camera/FPS panel shown in the screenshot.
- Change: Hide the diagnostics panel by default; development diagnostics can be explicitly opened with `?debug=1`. Production still omits the panel entirely. Disable the Next.js development indicator through its supported configuration.
- Verification: Lint, TypeScript, production build, and complete browser QA passed with no captured browser errors. Visually confirmed the normal preview contains neither the panel nor the Next.js badge. Added a browser assertion that the normal page has no visible debug panel; hidden readouts preserve the existing stationary-camera regression check.
- Limits: Browser verification uses Chromium.
