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
