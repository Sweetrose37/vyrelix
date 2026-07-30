# Vyrelix

Vyrelix is a mobile-only original-character creation workspace and visual-prompt organizer. Phase 1A establishes the complete application shell, component system, navigation, settings, and device-local persistence. It intentionally contains no AI generation, prompt engine, backend, or external API.

## Technology

The app uses semantic HTML5, modular CSS3, and native JavaScript modules. It has no runtime dependencies and works from any static web server.

## Structure

- `index.html` contains the accessible application shell and seven screen states.
- `css/` separates tokens, typography, layout, components, motion, utilities, mobile refinements, and product-level styles.
- `js/` contains application orchestration, navigation, UI feedback, storage, clipboard, settings, and animation controllers.
- `utilities/` contains framework-free constants, helpers, validation, and controlled randomization utilities.
- `assets/` reserves organized locations for future logos, icons, imagery, backgrounds, and fonts.
- `worker/` contains the production static-site request handler and security headers.
- `scripts/` contains the dependency-free production build.
- `ai/`, `character/`, `prompt/`, and `data/` are reserved for later-phase feature modules and are not active in Phase 1A.

## Architecture

Vyrelix uses a small single-page architecture. `app.js` composes focused modules; `navigation.js` owns screen and browser-history state; `storage.js` is the only local-storage boundary; `ui.js` owns reusable overlays, feedback, and collection rendering. CSS design tokens keep the gold-on-charcoal visual system consistent.

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

## Future expansion

Later phases can add domain modules under `character/`, `prompt/`, and `ai/` without changing the shell. Suggested sequence: character schema and validation, prompt composition, optional persistence adapters, AI provider integration, authentication, synchronization, and image-generation workflows.

## Phase boundary

Buttons in the prompt workspace save or copy user-authored drafts only. They do not generate, transform, or send content anywhere.
