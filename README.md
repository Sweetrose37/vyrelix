# Vyrelix

Vyrelix is a premium mobile-only AI Creative Studio. Version 5 adds the Universal AI Provider Engine to the UCE, UVE, and Prompt Engine. Users can create Character projects, generate professional prompts, simulate complete image-generation requests, save clearly labeled demo artwork, browse history, manage collections, switch providers, and test failure or latency states without internet access or API keys.

## Technology

The app uses semantic HTML5, modular CSS3, and native JavaScript modules. It has no runtime dependencies and works from any static web server.

## Structure

- `index.html` contains the accessible application shell, project dashboard, Studio Selection screen, Character Builder, collection, settings, and UI library.
- `css/` separates tokens, typography, layout, component foundations, focused component modules, motion, utilities, mobile refinements, and product-level styles.
- `js/core/` contains the Universal Creation Engine and its focused managers.
- `js/project/` contains reusable project building, preview, templates, validation, statistics, import, and export modules.
- `js/visual/` contains the lazily loaded Universal Visual Engine and its focused color, material, lighting, camera, style, composition, mood, validation, compatibility, storage, search, filter, template, randomizer, and preview modules.
- `js/prompt/` contains the lazily loaded prompt composition, template, optimization, validation, negative prompt, history, search, storage, preview, and export facade modules.
- `js/generator/` coordinates the nine-step generation pipeline, smart defaults, summaries, live preview, compatible randomization, and accessible Generate button.
- `js/export/` provides copy, TXT, Markdown, and versioned JSON output.
- `js/ai/` contains the provider manager, queue, request/response pipelines, image metadata, storage, history, gallery, downloader, error handling, and lazy UI controller.
- `js/providers/` contains the universal adapter contract, registry, settings, validation, fully working Mock Provider, and inactive future-provider adapter.
- `js/mock/` contains cached placeholder artwork, fake latency, demo generation, and sample data.
- `js/studios/` contains registry descriptors for Character Studio and every scaffolded future studio.
- `js/data/core/` is the single shared dataset source available to all studios.
- `js/data/visual/` contains normalized visual datasets, including a deterministic catalog of more than 1,000 named colors.
- Existing `js/` modules continue to provide navigation, UI feedback, legacy storage compatibility, settings, animations, and focused component controllers.
- `utilities/` contains framework-free constants, helpers, validation, and controlled randomization utilities.
- `docs/COMPONENTS.md` documents the UI system; the engine documents cover UCE, UVE, prompts, and the Universal AI Provider Engine.
- `assets/` reserves organized locations for logos, icons, imagery, backgrounds, fonts, and documentation for cached demo artwork.
- `worker/` contains the production static-site request handler and security headers.
- `scripts/` contains the dependency-free production build.
- `ai/`, `character/`, `prompt/`, and the original `data/` directory remain reserved for later feature phases.

## Architecture

Vyrelix uses a small single-page architecture. `app.js` composes the shell with `creationEngine.js`; `navigation.js` owns screen and browser-history state; UCE persistence flows through `StorageEngine`; and the large UVE and prompt workspaces load only when their routes open. CSS design tokens keep the gold-on-charcoal visual system consistent while focused feature styles preserve existing class contracts.

All saved content remains on the current device. Mock Provider makes no network requests, and storage keys are versioned so future migrations can be introduced without collisions.

## Development

Serve the repository root with any static server. For example:

```sh
npx serve .
```

Then open the printed local address on a portrait mobile viewport between 320px and 430px wide. Directly opening `index.html` also works in modern browsers, although clipboard permissions may require a secure local server.

Create a production artifact with:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\build.ps1
```

## Accessibility and performance

Controls have accessible names, keyboard focus states, semantic roles, and touch targets sized for mobile use. Reduced-motion preferences are honored. The app uses no remote fonts, images, or render-blocking libraries. Demo artwork uses cached CSS descriptors and gallery cards render incrementally.

Dialogs, sheets, and drawers restore focus after closing and trap keyboard focus while open. Tabs and expandable selections support arrow-key navigation. Saved lists render in idle batches, search suggestions use a single live controller, and all interaction families use delegated listeners where practical.

## Future expansion

Character Studio is the first active studio. Creature, World, Scene, Environment, Object, Vehicle, Architecture, Logo, Mascot, Poster, Book Cover, and Icon project types are registered for future work. New studios plug into the registry, reuse the project model and shared data, and store domain values in `project.data` without architectural changes.

## Phase boundary

The Prompt Engine produces text deterministically from user-controlled project metadata. Mock Provider simulates image generation using cached CSS demo graphics that are explicitly labeled as demos. Real providers remain inactive, no credentials are accepted, and no project or prompt data is transmitted.
