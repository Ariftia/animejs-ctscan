# Inside a CT scanner — Requirements

Updated: 2026-10-30 (UTC).
Status: Synchronized opening entrance and component explorer.

## Purpose and scope

The experience explains the scanner assembly, X-ray acquisition, detector measurements, and reconstruction through a scroll-driven 3D story. The final explorer allows rotation, zoom, and component selection.

Preserve the educational narrative, paper/ink/teal identity, and manual explorer. Remove the X-ray-beam-to-volume progress track, use a transparent explorer overlay, and keep scanner framing stable through explorer entry.

## Acceptance

- On opening, keep the loading screen until the scanner has rendered, then land the opening text and scanner together. Reduced motion skips the spatial entrance.
- Scanner and story text have distinct visual space on desktop and mobile.
- Long headings remain visible within the viewport.
- Keep the story camera and scanner position steady throughout scrolling; retain only restrained explanatory movement. Canvas size stays fixed through explorer entry and manual orbit remains available in the explorer.
- Remove the beam → measurement → sinogram → volume progress graphic.
- Keep explorer surfaces transparent and allow model interaction through their empty space.
- Acquisition and reconstruction share the same body/lung/spine geometry, dimensions, depth, position, and orientation. Slice reveal remains supported, with a gentler reduced-motion alternative.
- Reassembly completes the story before the interactive explorer.
- Label sampled projection angles and detector position so attenuation profiles are understandable.
- The final explorer zooms to and isolates the selected component, opens its explanation within its list row, and allows model interaction. Only one row expands at a time. Closing it restores the overview; keyboard activation and model selection share the same state. Reduced motion uses an immediate focus change.
- One persistent WebGL canvas, normalized scroll progress, and reduced-motion support remain intact.
- Required verification follows [AGENTS.md](AGENTS.md).

Broader browser support and performance targets have not been established; neither blocks this scoped refinement.
