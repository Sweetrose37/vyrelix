# Vyrelix Universal Creation Engine

## Dual creation contract

Describe Mode and Build Mode operate on one shared Creative Specification. Natural-language analysis detects the likely output type and creative attributes, then selects relevant panels. Build Mode can open the same specification immediately, and every detected value remains editable.

`js/creation/creativeIntelligence.js` owns:

- the extensible Everything Library;
- the modular creative-panel registry;
- the artistic-style catalog;
- deterministic intent detection;
- prompt synthesis from the active specification;
- contextual and completion recommendations.

`js/creation/creationExperience.js` owns:

- workflow switching;
- reference and voice input;
- panel add, remove, reorder, collapse, lock, and favorite behavior;
- live creative-direction preview;
- undo and redo state;
- snapshots, comparisons, and version restoration;
- recommendation previews and application;
- custom presets and artistic-style browsing;
- Prompt Inspector;
- project creation and editing.

## Universal project model

The shared Project model remains the persistence boundary. Next-generation projects store `creativeSpec`, `creativeVersions`, `promptOverride`, reference metadata, and normalized `answers` inside `project.data`. Existing projects without a Creative Specification are upgraded into one when opened in Build Mode.

Project lifecycle, validation, dashboard rendering, search, favorites, templates, history, visual direction, prompt generation, import, and export remain independent services. Internal studio descriptors register compatible project types but are never exposed as user-facing workflows.

## Privacy and extensibility

Creative data remains in browser storage. Reference files are inspected locally and only approved metadata is persisted. The Creative Specification and prompt records are provider-independent, allowing a future secure intelligence adapter to improve recommendations without changing the user’s project format.

New outputs can use any label from the Everything Library or an original label. New panels are registered once in `CREATIVE_PANELS`; no new page, generator, project model, or storage system is required.
