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

The story camera uses one fixed position, target, scale, and machine angle throughout scrolling. All desktop copy stays on the left and the model remains on the right; camera pans, automatic zooms, and lane swaps are removed. Responsive framing still adapts to viewport size. Explorer orbit controls remain user-driven. Camera, scanner, and CSS use the same inclusive 800px mobile breakpoint. The canvas keeps its full viewport size through reassembly and explorer entry. A fixed mobile view offset reserves the upper part of the screen for the scanner throughout the story. Orbit distance limits scale with responsive camera framing, avoiding a zoom clamp when explorer interaction starts. Root scanner angle is constant; only internal explanatory motion remains. Explosion distance and scroll-driven rotation use a 0.55 multiplier (0.18 with reduced motion); live acquisition rotation is 0.2 radians per second.

Scene notifications use `sceneAt` from the centralized ranges, matching the timeline rather than equal twelfths. The existing condensed display and sans-serif font stack is intentionally preserved; the mechanical design scan's two font-style warnings refer to this incumbent typography, outside the placement scope.

## Bed alignment

The assembled table group sits at Y=-1.04. With the existing native table geometry, its pedestal floor nearly matches the gantry base (0.0075 model units difference), and the tabletop's lower outer corner clears the bore liner (radius 1.1870 versus 1.19). The existing exploded offset is applied from this assembled height; both the initial and animated transforms use it.

## Reconstruction presentation

Reconstruction crossfades scanner hardware into a stack of 15 synthetic 512px axial cross-sections. Stable shader uniforms, disabled depth writes for translucent surfaces, and hidden fully faded hardware keep the transition clear. Shell, ring, and bed visibility follows opacity; acquisition-beam shader materials retain ownership of their own opacity/depth state. Texture resources are disposed on unmount. The shared-object section below describes the slice animation and reduced-motion treatment.

## Projection readouts

The projection chart shows attenuation profiles at fixed 0°, 45°, 90°, 135°, and 180° acquisition angles. Rows share a left edge and baseline; bar height encodes negative-log transmission across detector positions. Dark teal bars and angle/axis annotations replace the unlabeled, staggered moving marks. Profiles are calculated once and remain steady; only their visibility follows the scroll timeline. DOM annotations use the existing Drei Html component, local fonts, and the same visibility envelope as the bars.

## Shared scanned object and reconstruction

The chapter copy explains the beam, detector measurement, projection, sinogram, and reconstructed anatomy. Reassembly closes the narrative before the explorer. The beam-to-volume progress track has been removed at the user's request.

`PHANTOM` defines the same body, two lung regions, and spine for attenuation calculations, the visible acquisition object, and reconstructed slices. `PHANTOM_VOLUME` owns their shared model-space center, depth, and raster/plane bounds. The acquisition object extrudes the axial ellipses along the scanner's Z axis. Fifteen synthetic cross-sections cover that same depth with identical geometry and fixed orientation; only subtle grayscale texture varies between slices. No extra heart/ribs, taper, enlarged planes, drifting position, or rotating stack are introduced by reconstruction.

Slice reveal and fades remain. Reduced motion displays resolved slices without the traveling sweep. Explicit alpha marks pixels outside the body, preserving transparent backgrounds and low-density lung regions. Textures are disposed on unmount.

Explorer surfaces and the WebGL background are transparent. Empty explorer overlay space passes pointer input to the canvas; component buttons and text retain their own input. Component explanation panels use labelled regions and expanded-state buttons. No new dependencies or external assets are added.

## Part 12 component focus

Each component row is an accessible single-open accordion, controlled by the existing selected-component context. Buttons expose expanded state and name their explanation region; native keyboard activation works. The summary and a longer explanation live directly beneath the selected row. Model picking uses the same selection, so it opens/closes that same row. The canvas event filter rejects hits beneath hidden ancestors, since Three.js raycasting otherwise includes hidden meshes. Collapsed descriptions are hidden.

Named scanner groups expose each part's actual world bounds to CTCamera. Explicit selection fits the camera to those bounds within the desktop model lane or mobile upper lane, preserving the current viewing direction. Other components and the floor shadow are hidden for close inspection. The rotation system includes its tube and detector. Closing the row restores the full scanner and its default camera pose. Story framing remains stationary; only explicit explorer selection/manual orbit changes it.

Camera and orbit target interpolate using Three.js refs; no React updates run per frame. Reduced motion applies the pose immediately, and direct orbit/zoom input interrupts the focus animation. Resize recomputes framing. The closer orbit minimum supports small-part inspection; the explorer still allows manual drag and wheel zoom. No added dependencies or assets.
