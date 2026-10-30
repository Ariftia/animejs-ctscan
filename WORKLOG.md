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

## 2026-10-26 (Asia/Jakarta) — Enrich the signal-to-image story

- Request: Enhance content and animation creatively.
- Content: Expand the chapter explanations from beam generation through attenuation, detector conversion, projection profiles, sinograms, and reconstructed cross-sections. Add a closing reassembly chapter before the explorer. Identify the anatomy/reconstruction as illustrative.
- Motion: Add a four-stage SVG signal path that follows normalized progress using the existing scroll loop and centralized ranges. Reduced motion uses discrete stage fills. Resolve the existing 15 synthetic slices progressively and gather their spacing into a compact volume; remove the capsule/block overlay and hide unresolved/background pixels instead of drawing dark occluding planes. Reduced motion fixes slice spacing/orientation and omits the traveling reveal.
- Accessibility: Announce selected component details through a polite live region. Preserve the fixed story camera, one canvas, existing explorer controls, and reduced-motion support.
- Verification: Lint, TypeScript, and production build passed. Expanded production Playwright QA passed at http://127.0.0.1:3001: forward/reverse signal progression, reduced-motion stages, scene changes, projection labels, mobile framing/clearance, component selection, responsive headings at 320–1920px, one canvas, and no captured console/request errors. Inspected desktop/mobile captures plus a completed volume capture; a dark unreconstructed-region artifact found during visual inspection was corrected before the final suite passed.
- Environment: Browser plugin unavailable; used the repository Playwright workflow. Chromium and the preview server needed execution outside the process sandbox. Production preview remains on port 3001. No added dependencies or external assets; existing 15-texture generation remains, while two overlay meshes including a physical transmission material were removed.
- Documentation: Updated README, PRD, DESIGN, and STATE. Preserve the pre-existing tsconfig.tsbuildinfo modification outside this task's commit.
- Limits: Headless Chromium only; physical touch devices and other browser engines remain unverified. No push or deployment.

## 2026-10-26 (Asia/Jakarta) — Remove the signal track and match acquisition/reconstruction

- Request: Remove the progressive X-ray-beam-to-volume track (clarified by the user), make the explorer transparent, keep the CT scanner steady, and match the scanned object to the resulting 3D volume.
- UI/framing: Remove the signal SVG, its CSS, and its scroll property. Keep the full-size canvas unchanged through reassembly/explorer; use one fixed mobile framing offset and scale orbit limits with that framing to prevent entry zoom clamping. Remove root-angle timeline changes. Make the WebGL/explorer surfaces transparent. Empty explorer space passes input through, while buttons and text preserve selection/page scrolling. Internal explanatory motion and slice reveal remain.
- Shared geometry: Replace the unrelated acquisition capsule with an extrusion of PHANTOM's body, two lungs, and spine. PHANTOM_VOLUME centralizes center, depth, raster bounds, and slice count; the reconstruction uses the same geometry and model-space dimensions. Remove artificial heart/ribs/taper and enlarged, rotated, drifting reconstruction transforms. Generate explicit transparent pixels outside the body, retaining dark lungs within the shared outline. The 15 existing 512px slices remain; no added assets or dependencies.
- Regression checks: Validate actual phantom rasterizer output for lung/body/spine contrast, outside transparency, and identical first/last silhouettes. Browser assertions cover removed track, invariant forward/reverse mobile canvas bounds including explorer entry, transparent explorer surfaces, selection, and reverse page scrolling over explorer text.
- Verification: Lint, TypeScript, production build, and the final production QA suite passed at http://127.0.0.1:3001 with no captured console/request errors. Desktop/mobile/reduced-motion and 320–1920px heading checks passed. Additional Playwright checks passed drag rotation, wheel zoom without page scrolling, and 800×844 rendering. Inspected acquisition/final-volume captures plus desktop/mobile explorer captures; corrected mobile heading/table clearance before the final pass.
- Documentation: Updated README, PRD, DESIGN, and STATE. Leave the pre-existing tsconfig.tsbuildinfo modification outside the task commit.
- Limits: Chromium only; physical touch devices and other browser engines remain unverified. Reconstruction remains a synthetic educational phantom, not a clinical reconstruction pipeline. No push or deployment.

## 2026-10-26 (Asia/Jakarta) — Part 12 zoom and collapsible component explanations

- Request: Zoom the selected component in part 12 and add collapsible explanation details within its list row.
- Interaction: Use the existing selection context for a single-open accordion, with expanded-state buttons, labelled regions, plus/minus icons, and keyboard activation. Move the component summary and a longer explanation into its row. Closing it restores the complete scanner overview; model picking shares the same selection state.
- Camera: Name the rendered part groups and frame their actual world bounds, fitting the desktop model lane or mobile upper lane. Interpolate camera/OrbitControls target through refs; reduced motion switches immediately. Direct orbit input interrupts the transition. Close inspection hides surrounding components and the floor shadow; a rotation-system selection includes its tube and detector. Story framing stays fixed. No added assets or dependencies.
- Verification: Lint, TypeScript, production build, and expanded production QA passed at http://127.0.0.1:3001 without captured console/request errors. Tests cover each row, one open region at a time, keyboard collapse, mobile selection, reduced-motion selection, forward/reverse story scrolling, fixed canvas bounds, and responsive headings at 320–1920px. Captured and inspected every focused component plus restored overview at 1440×900 and 390×844. An initial visual check exposed surrounding geometry crossing the copy during small-part zoom; component isolation and hiding the floor shadow corrected it before the final pass.
- Picking regression: Hidden housing geometry intercepted clicks on isolated parts because Three.js raycasting includes invisible objects. Filter hits with hidden ancestors at the canvas event boundary, and assert that clicking the isolated source closes its row.
- Documentation: Updated PRD, DESIGN, README, and STATE. Keep the pre-existing tsconfig.tsbuildinfo change outside the task commit.
- Limits: Chromium only; physical touch devices and other browser engines remain unverified. No push or deployment.

## 2026-10-27 (UTC) — Ponytail audit corrections

- Model: Not available.
- Request: Fix all three findings from the repository audit.
- Timeline: Restore original motion values before rebuilding Anime.js tracks when reduced-motion preferences change, and seek immediately to the current progress. Remove the unused timeline ref. This prevents the exploded scanner or reconstruction state from becoming the new hero baseline.
- Mobile: Bound explorer copy to the lower viewport and allow internal scrolling, keeping expanded explanations clear of the fixed model and navigation at 320×568. Native scroll chaining preserves return to earlier chapters.
- Cleanup: Delete unused ProceduralParts.tsx and the superseded PatientTable function in EngineeredParts.tsx. No new dependencies or assets.
- Regression checks: Compare the actual hero canvas before/after changing reduced motion in both directions mid-story; verify short-mobile copy bounds and access to the final component row. The audit reproduced the broken timeline and overlapping short-mobile view before implementation.
- Verification: npm run lint, npm run typecheck, npm run build, and QA_BASE_URL=http://127.0.0.1:3002 node scripts/qa.mjs passed against the production build, with no captured console/request errors. Existing forward/reverse scroll, resize, selection, keyboard, and reduced-motion checks also passed. Inspected 320×568 and 390×844 explorer captures.
- Documentation: Updated README, DESIGN, and STATE. Preserved the pre-existing TypeScript cache contents, recording scripts, and videos outside this task.
- Limits: Browser plugin unavailable; used repository Playwright with headless Chromium. Physical touch devices and other browser engines remain unverified. No push or deployment.

## 2026-10-27 (Asia/Jakarta) — GitHub Actions deployment to Coolify

- Model: Not available.
- Request: Commit/push the fixes and set up automatic Coolify deployment, keeping secrets out of the public repository.
- Workflow: Verify pull requests and main pushes using npm ci, lint, TypeScript, production build, and production Playwright QA on Node 22. Only successful main pushes/manual main runs can trigger the authenticated Coolify webhook. Official checkout/setup-node actions are pinned to resolved commit hashes; checkout does not persist credentials.
- Credentials: COOLIFY_DEPLOY_WEBHOOK and COOLIFY_TOKEN are repository Actions secrets. The deploy job has no repository permissions or checkout. HTTPS is required, embedded URL credentials and redirects are refused, and response bodies/credentials are not logged. A deployment UUID must be returned. Missing secrets fail explicitly; uncertain network outcomes require inspecting Coolify before retrying. Ignore local .env files.
- Verification: actionlint, lint, TypeScript, nine isolated deployment-client cases, and a credential-pattern scan passed. Existing application production build and complete Playwright suite passed earlier in the same session with the same application source. GitHub authentication and remote main were verified; no existing repository Actions secrets, variables, environments, or webhooks were found.
- Blocker: No configured Coolify CLI, connector, instance/application identity, or API credentials are available. Requested secure configuration of the two Actions secrets; live deployment is not verified. README documents setup, the application branch/build/start/port settings, disabling duplicate deploy-on-push triggers when CI should gate deployment, and post-trigger verification.
- Scope: Preserve the existing TypeScript cache change, recording scripts, and videos. No credentials or generated assets are included in the task commit.

### Coolify activation deferred

- User requested skipping Coolify configuration for now. Keep CI and the deployment workflow ready, but skip the webhook step with a notice while either Actions secret is missing. No live deployment is attempted.
- Verification: actionlint and shell checks for absent, partial, and complete secret configuration passed.

## 2026-10-27 (Asia/Jakarta) — Repository artifact cleanup

- Model: Not available.
- Request: Clean up the repository and create a local commit.
- Change: Stop tracking tsconfig.tsbuildinfo and ignore generated TypeScript caches. Preserve local showcase scripts unchanged under ignored scripts/local/ and ignore generated public/videos/ exports. No application source, model assets, or credentials are added.
- Preservation: Checked both scripts' SHA-256 hashes before/after moving; videos remain in place. The local TypeScript cache remains on disk. README documents the local-artifact policy.
- Verification: Lint, TypeScript, production build, diff whitespace checks, and ignore-rule checks passed. QA_BASE_URL=http://127.0.0.1:3002 node scripts/qa.mjs passed against the production build with no captured browser errors. Confirmed prior GitHub run 40501841592 passed and skipped the Coolify webhook step.
- Scope: Local commit only; no push or deployment. Recording experiments were preserved rather than run or published. Browser coverage remains limited to Chromium.

## 2026-10-27 (Asia/Jakarta) — Complete artifact ignore rules

- Model: Not available.
- Request: Verify generated TypeScript caches are removed from Git and finish .gitignore cleanup.
- Confirmed: The previous local cleanup commit records deletion of tsconfig.tsbuildinfo; the file is absent from the current index. That local commit has not been pushed.
- Change: Group ignore rules for dependencies, build/cache output, test reports, local credentials/deployment metadata, logs, recording experiments, and OS metadata. Preserve .env.example and tracked application assets.
- Verification: Checked 22 artifact paths are ignored and seven source/example paths remain eligible; git ls-files reports no tracked ignored files or TypeScript cache files. Diff whitespace checks passed. Application source is unchanged; lint, TypeScript, production build, and complete Playwright QA passed in the preceding cleanup.
- Scope: Local commit only. No files containing credentials were added, and local recordings remain preserved.

## 2026-10-28 (Asia/Jakarta) — Unused asset/catalog and credential cleanup

- Model: Not available.
- Request: Clean up unused files/modules and look for sensitive credentials.
- Change: Remove the unreferenced 2,331,576-byte ct-slice-stack.glb; reconstruction already generates slices from the shared phantom. Remove unused model/transform fields and their type declarations from the explorer component catalog. Preserve all five /lab models, visual references, and ignored local recordings.
- Investigation: Used the indexed graph with coverage checks and source verification; ignored scripts/local was checked directly. A TypeScript AST import traversal from Next.js routes, configuration, and QA found no unreachable source modules. Direct dependencies were checked against imports, framework/configuration use, and type tooling; none identified as unused. All remaining GLBs have source references.
- Credentials: Redacted pattern scan covered all 56 pre-cleanup tracked files, three additional local text files, and 192 reachable Git history blobs. No matches for private keys, common provider tokens, JWTs, literal credential assignments, or credential-bearing service URLs. No credential values were printed. No tracked files match ignore rules.
- Verification: npm run lint, npm run typecheck, stricter TypeScript unused-local/parameter checks, npm run build, git diff --check, and QA_BASE_URL=http://127.0.0.1:3002 node scripts/qa.mjs passed. QA captured no browser errors and covered desktop/mobile, reverse scrolling, resizing, explorer selection/keyboard behavior, and reduced motion.
- Limits: Pattern matching cannot rule out every secret format; unreachable Git objects and external secret stores were not inspected. Browser checks use headless Chromium. Deleting the unused asset reduces the current checkout by about 2.22 MiB; its prior Git history remains. Local commit only; no push or deployment.

## 2026-10-30 (UTC) — Synchronized opening entrance

- Model: Not available.
- Request: Add an opening loading animation so the text and scanner land together.
- Change: Keep the existing loader visible until the complete scanner scene has rendered a frame, then animate the canvas stage and opening copy together using the same 800ms descending/fading CSS entrance. The canvas fallback signals readiness too. Track entrance completion so later motion-preference changes and reverse scrolling cannot replay it. Reduced motion skips the spatial movement; a noscript override preserves the readable story without JavaScript. No dependencies or assets were added.
- Regression coverage: Extend scripts/qa.mjs to require loader dismissal, entrance completion, identical scanner/copy start times and durations, a reduced-motion alternative, and no replay after scrolling/motion-preference changes. The replay assertion exposed a preference-change restart during implementation; completion now removes the entrance styles.
- Verification: npm run lint, npm run typecheck, npm run build, git diff --check, and QA_BASE_URL=http://127.0.0.1:3002 node scripts/qa.mjs passed against the final application build with no captured browser errors. The suite covers desktop/mobile (including 320×568), resize, reverse scrolling, component controls, motion-preference changes, and the synchronized entrance. A delayed-script load check confirmed the loader covers the pending scene. Paused desktop/mobile landing captures verified identical opacity (0.877174) and vertical translation (-3.43912px) at the same animation time; final compositions were inspected. A JavaScript-disabled browser check confirmed the loader is hidden and story opacity is 1. Mechanical design detection reported only the two incumbent font warnings documented in DESIGN.md.
- Limits: Browser plugin unavailable; browser verification uses local Playwright/Chromium. No push or deployment.
