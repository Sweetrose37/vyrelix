# Vyrelix Universal Creation Engine

## Purpose

The Universal Creation Engine (UCE) turns Vyrelix from a character-only workspace into a modular creative platform. Every creation is represented by the same Project model, managed by the same lifecycle services, stored through the same expandable adapter, and surfaced through reusable mobile components.

No AI provider or image generation is connected. Version 4 adds a separate, lazy prompt-generation module that consumes UCE projects without changing their lifecycle. Character Studio is the only active studio; other studios remain registered and ready for future modules.

## Architecture

`js/core/creationEngine.js` is the composition root. It connects independent managers rather than embedding studio-specific rules:

- `projectEngine.js` creates, updates, and duplicates the universal Project record.
- `projectManager.js` owns create, rename, duplicate, archive, delete, favorite, and restore operations.
- `validationEngine.js` enforces required fields, registered project types, unique names, numeric seeds, and valid references.
- `storageEngine.js` is the expandable, corruption-tolerant local persistence boundary.
- `studioManager.js` registers studios and exposes their supported project types.
- `moduleLoader.js` lazily loads optional studio implementations and caches their promises.
- `generatorEngine.js` registers seeded generators. Character is active; future generators return Coming Soon.
- `searchEngine.js` performs instant cached searches across name, tags, category, studio, date, favorite state, type, and status.
- `filterEngine.js` composes project filters and stable sort choices.
- `tagEngine.js` adds, edits, deletes, suggests, and favorites unlimited tags.
- `favoritesEngine.js`, `historyEngine.js`, and `recentEngine.js` provide focused collection behavior.
- `settingsEngine.js` manages UCE preferences independently from the existing appearance settings.

Every manager receives its dependencies through its constructor. That keeps it testable and prevents studio code from reaching directly into browser storage.

## Universal Project model

All project types use these required fields:

`id`, `name`, `type`, `category`, `description`, `tags`, `thumbnail`, `favorite`, `createdAt`, `modifiedAt`, `version`, `creator`, `theme`, `artStyle`, `colorPalette`, `visibility`, `status`, and `randomSeed`.

The model also includes `studio`, `data`, and `references`. `data` is the studio-owned extension point. A future World Studio can store world-specific values inside `data` while dashboard, search, storage, templates, import/export, and project lifecycle code continue to work unchanged.

## Project lifecycle

1. A studio or template supplies partial project values.
2. `ProjectEngine.create()` normalizes them into a complete Project.
3. `ValidationEngine` checks required fields, type registration, unique names, and value shapes.
4. `ProjectManager` writes the project, records history, and updates the recent index.
5. Updates preserve `id` and `createdAt`, advance `modifiedAt`, and pass validation again.
6. Archive moves a project from `projects` to `archive`. Restore validates it and moves it back.
7. Delete removes the record from active and archived collections while retaining a bounded history entry.

The existing Character Builder now creates a universal Character Project and also preserves its original Phase 1 character record for backward compatibility.

## Storage architecture

`StorageEngine` maps logical collection names to versioned browser keys:

- Projects
- Characters
- Creatures
- Worlds
- Scenes
- Objects
- Logos
- Favorites
- Templates
- Recent
- History
- Settings
- Favorite Tags
- Archive

Reads validate JSON and expected collection shape. Corrupted values fall back safely without breaking the application. Writes serialize and parse before committing. `registerCollection()` lets a future studio add a namespace without editing the storage engine.

All data remains on the current device. The Project JSON envelope includes a format and schema version so a cloud adapter can later replace or supplement local storage.

## Shared data

`js/data/core/index.js` is the single immutable source for identity, appearance, materials, colors, lighting, camera, environment, composition, mood, style, prompt-template placeholders, negative-prompt placeholders, and quality values.

Studios receive these datasets through the UCE. They must not copy lists into studio modules. Appearance and prompt-related collections intentionally remain empty where this phase does not implement those features.

## Reusable project layer

- `projectBuilder.js` provides fluent model assembly.
- `projectPreview.js` creates the accessible preview card used by dashboards and future studios.
- `projectExporter.js` serializes and downloads versioned Project JSON.
- `projectImporter.js` parses supported Project JSON without bypassing UCE validation.
- `projectValidator.js` combines schema and reference checks.
- `projectStatistics.js` derives dashboard totals.
- `projectTemplates.js` provides Blank, Fantasy, Sci-Fi, Modern, Anime, Realistic, and custom template support.

## Adding a future studio

1. Add a descriptor under `js/studios/` with a unique `id`, display name, project type, description, icon, and active state.
2. Export it from `js/studios/index.js`.
3. Add its optional implementation through `creationEngine.registerStudio(descriptor, moduleFactory)` or register a lazy factory on `ModuleLoader`.
4. Store studio-only fields inside `project.data`.
5. Reuse `CORE_DATASETS` and `createProjectPreview()` rather than copying data or UI.
6. Activate its generator only when an actual non-AI generator implementation exists.

No core manager, project schema, dashboard component, or storage mechanism needs to be rewritten.

## Performance and accessibility

Project rendering uses the existing idle-batch renderer, dashboard DOM updates use fragments and `replaceChildren`, search results are cached and bounded, and lazy module promises load once. Mobile lists use containment and horizontal scroll snapping where appropriate.

All new controls are semantic buttons, inputs, or selects with accessible names, visible focus, 48px minimum targets, keyboard behavior, live result regions, and reduced-motion compatibility. The application remains portrait-only from 320px to 430px.
