# Inside a CT scanner — Requirements

Updated: 2026-10-26 (Asia/Jakarta).
Status: Content and animation enhancement requested by the user.

## Purpose and scope

The experience explains the scanner assembly, X-ray acquisition, detector measurements, and reconstruction through a scroll-driven 3D story. The final explorer allows rotation, zoom, and component selection.

Enhance the educational narrative and signal-to-image animation while preserving the paper/ink/teal identity, fixed story camera, scene order, and manual explorer.

## Acceptance

- Scanner and story text have distinct visual space on desktop and mobile.
- Long headings remain visible within the viewport.
- Keep the story camera and scanner position steady throughout scrolling; retain only restrained explanatory movement. Mobile canvas sizing remains continuous and manual orbit remains available in the explorer.
- Explain the beam → measurement → sinogram → volume sequence with a reversible scroll-linked diagram.
- Reconstruction resolves synthetic cross-sections into a compact stack, with a gentler reduced-motion alternative.
- Reassembly completes the story before the interactive explorer.
- Label sampled projection angles and detector position so attenuation profiles are understandable.
- The final explorer exposes the selected component and allows model interaction.
- One persistent WebGL canvas, normalized scroll progress, and reduced-motion support remain intact.
- Required verification follows [AGENTS.md](AGENTS.md).

Broader browser support and performance targets have not been established; neither blocks this scoped refinement.
