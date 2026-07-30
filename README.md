# Vyrelix

Vyrelix is a mobile-only original-character creation workspace and visual-prompt organizer. The current release establishes the complete application shell and reusable UI system, including navigation, settings, device-local persistence, accessible overlays, gestures, search, feedback, and loading states. It intentionally contains no AI generation, character engine, prompt engine, backend, or external API.

## Technology

The app uses semantic HTML5, modular CSS3, and native JavaScript modules. It has no runtime dependencies and works from any static web server.

## Structure

- `index.html` contains the accessible application shell and seven screen states.
- `css/` separates tokens, typography, layout, component foundations, focused component modules, motion, utilities, mobile refinements, and product-level styles.
- `js/` contains application orchestration, navigation, UI feedback, storage, clipboard, settings, animation controllers, and focused component controllers.
- `utilities/` contains framework-free constants, helpers, validation, and controlled randomization utilities.
- `docs/COMPONENTS.md` documents every reusable component, its markup contract, customization points, accessibility behavior, and dependencies.
- `assets/` reserves organized locations for future logos, icons, imagery, backgrounds, and fonts.
- `worker/` contains the production static-site request handler and security headers.
- `scripts/` contains the dependency-free production build.
- `ai/`, `character/`, `prompt/`, and `data/` are reserved for later-phase feature modules and are not active in Phase 1A.

## Architecture

Vyrelix uses a small single-page architecture. `app.js` composes focused modules; `navigation.js` owns screen and browser-history state; `storage.js` is the only local-storage boundary; and the files in `js/components/` own one interaction family each. CSS design tokens keep the gold-on-charcoal visual system consistent, while component styles layer on top of the original foundation without changing existing class contracts.

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

The application is ready for the Character Engine in Phase 2A. Later phases can add domain modules under `character/`, `prompt/`, and `ai/` without changing the shell. Suggested sequence: character schema and validation, prompt composition, optional persistence adapters, AI provider integration, authentication, synchronization, and image-generation workflows.

## Phase boundary

Buttons in the prompt workspace save or copy user-authored drafts only. They do not generate, transform, or send content anywhere.

The UI Library includes generate-button and generation-loader visuals because they are required reusable states. They are inert demonstrations and do not generate or transmit content.
