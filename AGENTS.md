# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 15 App Router project written in TypeScript. Route entry points and global styles live in `app/`; `/lab` is a development route for inspecting the experience. The persistent React Three Fiber scene is organized under `components/experience/`. Scanner geometry and asset normalization belong in `components/scanner/`, while centralized scroll ranges and timeline utilities live in `components/animation/`. Educational graphics, story copy, and interface controls are separated into `components/diagrams/`, `components/scenes/`, and `components/ui/`.

Store production GLB files in `public/models/` using descriptive kebab-case names such as `ct-rotation-ring.glb`. Put visual references in `public/reference/`. Browser QA automation is in `scripts/qa.mjs`. There is currently no unit-test directory.

## Build, Test, and Development Commands

- `npm install` installs pinned dependencies from `package-lock.json`.
- `npm run dev` starts the local Next.js development server.
- `npm run lint` runs ESLint and fails on warnings.
- `npm run typecheck` validates TypeScript without emitting files.
- `npm run build` creates the production bundle.
- `npm run start` serves that production bundle.
- `node scripts/qa.mjs` runs Playwright browser checks against `http://localhost:3000`; set `QA_BASE_URL` to test another URL.

## Coding Style & Naming Conventions

Use two-space indentation, semicolons, and double quotes, matching the existing code. Name React components and component files in PascalCase (`CTCanvas.tsx`), hooks with a `use` prefix, ordinary functions and refs in camelCase, and static assets in kebab-case. Keep strict types; avoid `any`. Run ESLint and TypeScript checks before submitting changes.

## Architecture and Performance

Maintain one persistent WebGL canvas. Derive choreography from the normalized `0–1` progress source and centralized ranges; do not scatter scroll constants across components. Avoid React state updates per animation frame—mutate Three.js refs through the timeline or render loop. Normalize imported models through scanner configuration rather than embedding corrective transforms throughout the scene.

## Testing Guidelines

No unit-test framework or coverage threshold is configured. Every change should pass lint, typecheck, production build, and the Playwright QA script. For visual or animation changes, verify forward and reverse scrolling, resize behavior, mobile layout, reduced motion, and browser console output.

## Commit & Pull Request Guidelines

The repository has no existing commits, so use concise Conventional Commit messages, for example `feat: add detector acquisition sequence`. Pull requests should explain the user-visible change, list verification commands, link relevant issues, and include screenshots or recordings for visual changes. Call out new model sizes, performance impact, and asset provenance.
