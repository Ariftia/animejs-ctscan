# Inside a CT scanner — Design

Updated: 2026-10-25 (Asia/Jakarta). Requirements: [PRD.md](PRD.md).

## Observed system

The root route renders `CTExperience`: one persistent React Three Fiber canvas behind DOM story panels and fixed navigation. `ExperienceContext` owns normalized scroll progress, scene identity, selection, and mutable motion values. Anime.js seeks the timeline from progress; Three.js refs update geometry and camera without per-frame React state.

`components/animation/ranges.ts` defines scene boundaries. `CTCamera` owns framing and explorer orbit controls; `CTScanner` composes exterior, internals, patient, and diagrams. `components/scanner/config.ts` normalizes imported assets. Native exterior geometry has provenance documented under `public/reference/`.

## Incumbent visual identity

Warm paper (`#f3f1eb`), dark ink (`#111514`), teal/cyan instrumentation, condensed uppercase display headings, sans-serif body copy, and small monospace annotations. Alternate desktop copy alignment; stack model above copy on mobile. Refinement preserves this visual identity and educational content.

## Constraints and verification

Keep one canvas and centralized timeline choreography. Scope responsive framing to the camera rather than duplicating scenes. Preserve reverse scrolling, reduced motion, and component selection. Validate lint, TypeScript, production build, and browser QA as described in [README.md](README.md).

No persistence or migrations are involved. No new asset downloads are added to the application by the placement refinement. Wider device/browser coverage remains unestablished.

## Placement refinement

The perspective camera reserves a left or right visual lane opposite the current story copy. Framing pulls back for exploded geometry and data displays, and the timeline recenters data displays through `lookX`. Reassembly completes the explorer pose before orbit controls take over; entering or resizing the explorer initializes its camera once. Camera, scanner, and CSS use the same inclusive 800px mobile breakpoint. The mobile explorer uses a compact canvas below the navigation so the model clears its heading and component details.

Scene notifications use `sceneAt` from the centralized ranges, matching the timeline rather than equal twelfths. The existing condensed display and sans-serif font stack is intentionally preserved; the mechanical design scan's two font-style warnings refer to this incumbent typography, outside the placement scope.
