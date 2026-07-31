# Vyrelix Universal Creation Engine

## Purpose

The Universal Creation Engine (UCE) makes Vyrelix one intelligent creative platform. Every creation is represented by the same Project model, managed by the same lifecycle services, stored through the same expandable adapter, and surfaced through reusable mobile components.

Users never choose a studio, generator, or separate workflow. The Universal Creation Experience asks what they want to create and how they want to create it, then adapts relevant controls around that goal. No real AI provider is connected. The offline Mock Provider consumes prompts without changing the UCE lifecycle.

## Universal Creation Experience

`js/creation/creationExperience.js` is the user-facing entry layer. It always begins with:

1. What would you like to create?
2. How would you like to create it?

The first answer accepts natural language or a suggested category. `creationSchemas.js` recognizes Person, Family, Baby, Toddler, Animal, Fantasy Character, Wedding Invitation, Birthday Invitation, Business Card, Poster, Logo, Product Mockup, Book Cover, Interior, Landscape, Vehicle, Social Media Graphic, Advertisement, and open-ended goals.

The second answer selects Quick Create, Guided Creator, Advanced Creator, AI Creative Director, Inspire Me, Templates, or Reference Mode. Each mode renders only its relevant interface. Every result is normalized into the same Project model and sent through the same validation, storage, history, search, recent, prompt, and provider systems.

## Architecture

`js/core/creationEngine.js` is the composition root. It connects independent managers rather than embedding studio-specific rules:

- `projectEngine.js` creates, updates, and duplicates the universal Project record.
- `projectManager.js` owns create, rename, duplicate, archive, delete, favorite, and restore operations.
- `validationEngine.js` enforces required fields, registered project types, unique names, numeric seeds, and valid references.
- `storageEngine.js` is the expandable, corruption-tolerant local persistence boundary.
- `studioManager.js` retains internal project-type registration for compatibility; it is not a user-facing selector.
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

The model also includes `studio`, `data`, and `references`. New adaptive creations identify `studio` as `Universal Creative Engine`; `data` stores the selected goal, category, creation mode, relevant answers, reference metadata, and creative direction. Existing records retain their original values for backward compatibility.

## Project lifecycle

1. A creative goal, template, reference, or legacy builder supplies partial project values.
2. `ProjectEngine.create()` normalizes them into a complete Project.
3. `ValidationEngine` checks required fields, type registration, unique names, and value shapes.
4. `ProjectManager` writes the project, records history, and updates the recent index.
5. Updates preserve `id` and `createdAt`, advance `modifiedAt`, and pass validation again.
6. Archive moves a project from `projects` to `archive`. Restore validates it and moves it back.
7. Delete removes the record from active and archived collections while retaining a bounded history entry.

The existing Character Builder continues to create a universal Character Project and preserves its original Phase 1 character record for backward compatibility. It remains an internal compatible tool rather than the primary creation entry.

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

## Adding a future creative goal

1. Add a category descriptor to `js/creation/creationSchemas.js`.
2. Map it to a registered UCE project type.
3. Define only the questions relevant to that goal.
4. Store goal-specific answers inside `project.data`.
5. Reuse `CORE_DATASETS`, templates, and `createProjectPreview()` rather than copying data or UI.
6. Keep generation behind the existing prompt and provider boundaries.

No separate page, studio selector, core manager, project schema, dashboard component, or storage mechanism needs to be rewritten.

## Performance and accessibility

Project rendering uses the existing idle-batch renderer, dashboard DOM updates use fragments and `replaceChildren`, search results are cached and bounded, and lazy module promises load once. Mobile lists use containment and horizontal scroll snapping where appropriate.

All new controls are semantic buttons, inputs, or selects with accessible names, visible focus, 48px minimum targets, keyboard behavior, live result regions, and reduced-motion compatibility. The application remains portrait-only from 320px to 430px.
