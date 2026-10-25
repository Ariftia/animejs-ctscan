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
