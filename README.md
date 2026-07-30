# Vyrelix

Vyrelix is a premium mobile-only AI Creative Studio foundation. Version 3 adds the Universal Visual Engine (UVE) to the Universal Creation Engine (UCE): reusable visual datasets, compatibility-aware selection and randomization, live Character Studio customization, visual presets, and future-studio adapters. It intentionally contains no AI generation, prompt generation, backend, or external API.

## Technology

The app uses semantic HTML5, modular CSS3, and native JavaScript modules. It has no runtime dependencies and works from any static web server.

## Structure

- `index.html` contains the accessible application shell, project dashboard, Studio Selection screen, Character Builder, collection, settings, and UI library.
- `css/` separates tokens, typography, layout, component foundations, focused component modules, motion, utilities, mobile refinements, and product-level styles.
- `js/core/` contains the Universal Creation Engine and its focused managers.
- `js/project/` contains reusable project building, preview, templates, validation, statistics, import, and export modules.
- `js/visual/` contains the lazily loaded Universal Visual Engine and its focused color, material, lighting, camera, style, composition, mood, validation, compatibility, storage, search, filter, template, randomizer, and preview modules.
- `js/studios/` contains registry descriptors for Character Studio and every scaffolded future studio.
- `js/data/core/` is the single shared dataset source available to all studios.
- `js/data/visual/` contains normalized visual datasets, including a deterministic catalog of more than 1,000 named colors.
- Existing `js/` modules continue to provide navigation, UI feedback, legacy storage compatibility, settings, animations, and focused component controllers.
- `utilities/` contains framework-free constants, helpers, validation, and controlled randomization utilities.
- `docs/COMPONENTS.md` documents the UI system; `docs/UNIVERSAL_CREATION_ENGINE.md` documents the UCE; and `docs/UNIVERSAL_VISUAL_ENGINE.md` documents visual engines, datasets, compatibility, and extension.
- `assets/` reserves organized locations for future logos, icons, imagery, backgrounds, and fonts.
- `worker/` contains the production static-site request handler and security headers.
- `scripts/` contains the dependency-free production build.
- `ai/`, `character/`, `prompt/`, and the original `data/` directory remain reserved for later feature phases.

## Architecture

Vyrelix uses a small single-page architecture. `app.js` composes the original shell with `creationEngine.js`; `navigation.js` owns screen and browser-history state; UCE persistence flows through `StorageEngine`; and the UVE loads only when Character Studio opens its visual workspace. CSS design tokens keep the gold-on-charcoal visual system consistent, while core and visual styles layer on top without changing existing class contracts.

All saved content remains on the current device. Storage keys are versioned so future migrations can be introduced without collisions.

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

Controls have accessible names, keyboard focus states, semantic roles, and touch targets sized for mobile use. Reduced-motion preferences are honored. The app uses no remote fonts or render-blocking libraries, minimizes repeated DOM work, and contains no required imagery; future images should use `loading="lazy"` and explicit dimensions.

Dialogs, sheets, and drawers restore focus after closing and trap keyboard focus while open. Tabs and expandable selections support arrow-key navigation. Saved lists render in idle batches, search suggestions use a single live controller, and all interaction families use delegated listeners where practical.

## Future expansion

Character Studio is the first active studio. Creature, World, Scene, Environment, Object, Vehicle, Architecture, Logo, Mascot, Poster, Book Cover, and Icon project types are registered for future work. New studios plug into the registry, reuse the project model and shared data, and store domain values in `project.data` without architectural changes.

## Phase boundary

Buttons in the prompt workspace save or copy user-authored drafts only. The Universal Randomizer creates seeded local metadata and does not call AI, generate prompts, transform content, or send data anywhere.

The UI Library includes generate-button and generation-loader visuals because they are required reusable states. They are inert demonstrations and do not generate or transmit content.
