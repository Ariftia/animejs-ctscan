# Inside a CT scanner — Design

Updated: 2026-10-26 (Asia/Jakarta). Requirements: [PRD.md](PRD.md).

## Observed system

The root route renders `CTExperience`: one persistent React Three Fiber canvas behind DOM story panels and fixed navigation. `ExperienceContext` owns normalized scroll progress, scene identity, selection, and mutable motion values. Anime.js seeks the timeline from progress; Three.js refs update geometry and camera without per-frame React state.

`components/animation/ranges.ts` defines scene boundaries. `CTCamera` owns framing and explorer orbit controls; `CTScanner` composes exterior, internals, patient, and diagrams. `components/scanner/config.ts` normalizes imported assets. Native exterior geometry has provenance documented under `public/reference/`.

## Incumbent visual identity

Warm paper (`#f3f1eb`), dark ink (`#111514`), teal/cyan instrumentation, condensed uppercase display headings, sans-serif body copy, and small monospace annotations. Keep desktop copy on the left and the scanner on the right; stack model above copy on mobile. Refinement preserves this visual identity and educational content.

## Constraints and verification

Keep one canvas and centralized timeline choreography. Scope responsive framing to the camera rather than duplicating scenes. Preserve reverse scrolling, reduced motion, and component selection. Validate lint, TypeScript, production build, and browser QA as described in [README.md](README.md).

No persistence or migrations are involved. No new asset downloads are added to the application by the placement refinement. Wider device/browser coverage remains unestablished.

## Placement refinement

The story camera uses one fixed position, target, scale, and machine angle throughout scrolling. All desktop copy stays on the left and the model remains on the right; camera pans, automatic zooms, and lane swaps are removed. Responsive framing still adapts to viewport size. Explorer orbit controls remain user-driven. Camera, scanner, and CSS use the same inclusive 800px mobile breakpoint. The mobile canvas shrinks continuously during reassembly into a compact explorer view below navigation. Explosion distance and scroll-driven rotation use a 0.55 multiplier (0.18 with reduced motion); live acquisition rotation is 0.2 radians per second.

Scene notifications use `sceneAt` from the centralized ranges, matching the timeline rather than equal twelfths. The existing condensed display and sans-serif font stack is intentionally preserved; the mechanical design scan's two font-style warnings refer to this incumbent typography, outside the placement scope.

## Bed alignment

The assembled table group sits at Y=-1.04. With the existing native table geometry, its pedestal floor nearly matches the gantry base (0.0075 model units difference), and the tabletop's lower outer corner clears the bore liner (radius 1.1870 versus 1.19). The existing exploded offset is applied from this assembled height; both the initial and animated transforms use it.

## Reconstruction presentation

Reconstruction crossfades scanner hardware into a stack of 15 synthetic 512px axial cross-sections. Stable shader uniforms, disabled depth writes for translucent surfaces, and hidden fully faded hardware keep the transition clear. Shell, ring, and bed visibility follows opacity; acquisition-beam shader materials retain ownership of their own opacity/depth state. Texture resources are disposed on unmount. The signal journey enhancement below describes the slice animation and reduced-motion treatment.

## Projection readouts

The projection chart shows attenuation profiles at fixed 0°, 45°, 90°, 135°, and 180° acquisition angles. Rows share a left edge and baseline; bar height encodes negative-log transmission across detector positions. Dark teal bars and angle/axis annotations replace the unlabeled, staggered moving marks. Profiles are calculated once and remain steady; only their visibility follows the scroll timeline. DOM annotations use the existing Drei Html component, local fonts, and the same visibility envelope as the bars.

## Signal journey and reconstruction enhancement

The chapter copy explains what changes between a beam, a detector measurement, a projection, a sinogram, and reconstructed anatomy. Reassembly now closes the narrative before the explorer. Acquisition chapters include a compact four-stage SVG signal path: its stroke follows the existing normalized scroll loop between the centralized X-ray and reconstruction ranges. The current stage follows the chapter; reduced motion uses discrete stage fills. No extra animation loop or dependency is introduced.

The current reconstruction implementation uses 15 synthetic 512px cross-sections. The slices progressively resolve and close their spacing into a compact volume; the unrelated capsule/block overlay is removed. Background pixels are excluded using scalar intensity so translucent black rectangles do not obscure the anatomy. Reduced motion fixes the stack orientation and spacing, removes the traveling slice sweep, and retains the fade. The synthetic texture generation and texture disposal remain local, with no new model or image assets. Explorer selection details use a polite live region.
