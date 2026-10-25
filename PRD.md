# Inside a CT scanner — Requirements

Updated: 2026-10-25 (Asia/Jakarta).
Status: Existing behavior documented from source; placement refinement requested by the user.

## Purpose and scope

The experience explains the scanner assembly, X-ray acquisition, detector measurements, and reconstruction through a scroll-driven 3D story. The final explorer allows rotation, zoom, and component selection.

This task refines scanner placement, text spacing, and responsive framing while preserving the existing paper/ink/teal identity, educational copy, geometry, and scene order.

## Acceptance

- Scanner and story text have distinct visual space on desktop and mobile.
- Long headings remain visible within the viewport.
- Keep the story camera and scanner position steady throughout scrolling; retain only restrained explanatory movement. Mobile canvas sizing remains continuous and manual orbit remains available in the explorer.
- Label sampled projection angles and detector position so attenuation profiles are understandable.
- The final explorer exposes the selected component and allows model interaction.
- One persistent WebGL canvas, normalized scroll progress, and reduced-motion support remain intact.
- Required verification follows [AGENTS.md](AGENTS.md).

Broader browser support and performance targets have not been established; neither blocks this scoped refinement.
