# Vyrelix Prompt Generation Engine

## Purpose and phase boundary

Version 4 turns saved Vyrelix projects into professional, natural-language AI-ready prompts entirely on the current device. It does not call an AI model, backend, or external API. Version 5 can pass a saved prompt to the separate offline Mock Provider; the Prompt Engine itself remains provider-independent.

The system is additive: the Universal Creation Engine (UCE) remains the source of universal projects, and the Universal Visual Engine (UVE) remains the source of visual selections and compatibility rules.

## Generation pipeline

`js/generator/generatorManager.js` coordinates nine deterministic steps:

1. Collect the selected universal project.
2. Validate required project and prompt-type values.
3. Validate any attached UVE state and its material/texture compatibility.
4. Fill missing optional values with stable, readable defaults.
5. Build the reusable internal generation project.
6. Resolve a registered prompt template and compose semantic sections.
7. Optimize duplicate concepts, punctuation, and spacing.
8. Return a preview-ready prompt record and metrics.
9. Automatically save the final record and update recent history.

Live preview runs the same pipeline with persistence disabled. This prevents preview typing from flooding prompt history while ensuring the preview matches the generated output.

## Internal project object

The generation object is created in `js/prompt/promptBuilder.js` and contains:

- `projectId`, `projectType`, `studio`, and `title`;
- `identity` and studio-owned `appearance`;
- `visualStyle`, `colorPalette`, `lighting`, `mood`, `camera`, and `quality`;
- `negativePrompt`, `tags`, `seed`, `timestamp`, and `version`;
- the complete compatible `visual` extension when a project uses UVE.

It is derived from, but does not replace, the UCE Project. Studio-specific values stay inside the universal `project.data` extension point.

## Prompt construction

`positivePromptEngine.js` translates project and UVE metadata into semantic sections: subject, identity, appearance, visual details, materials, colors, environment, lighting, camera, composition, mood, art style, rendering quality, and additional direction.

`promptTemplates.js` registers Image, Portrait, Full Body, Concept Art, Character Sheet, Scene, and Description templates. Each template receives the same section object and returns readable prose rather than a keyword dump.

`promptOptimizer.js` removes duplicate concepts, normalizes spacing, repairs punctuation, and produces consistent professional formatting. `negativePromptEngine.js` provides editable defaults and device-local presets.

## Storage and history

`promptStorage.js` owns versioned device-local collections for generated prompts, drafts, recents, favorites, and negative-prompt presets. Reads tolerate malformed browser data. Generated records are saved automatically; form changes save one draft per project.

`promptHistory.js` and `promptSearch.js` provide bounded searchable history with open, favorite, duplicate, rename, and delete operations. Existing version 1 manual drafts remain readable in the universal Projects collection.

## Preview, copy, and export

The dedicated preview displays formatted and negative prompts, project and character summaries, estimated length, word count, and character count.

`copyManager.js` copies the prompt, negative prompt, JSON, or summary and uses the existing accessible toast system. Export modules produce TXT, Markdown, and versioned JSON downloads. The Markdown section structure leaves a clear path for future PDF rendering.

## Randomization and test mode

`randomGenerator.js` reuses the UCE seeded Character generator, UVE compatibility-aware randomizer, and shared core datasets. It supports random character metadata, compatible appearance, prompt settings, and complete project inputs.

Developer Test Mode can create sample characters, generate sample prompts, load demo projects, validate 250 prompts in a stress run, and reset prompt demo data. These actions remain local and deterministic.

## Future studio extension

To add a prompt-capable studio:

1. Register its UCE studio descriptor and store domain values in `project.data`.
2. Add visual capabilities through the existing UVE adapter when relevant.
3. Register a new template with `registerPromptTemplate()` only when the studio needs a distinct narrative structure.
4. Extend `positivePromptEngine.js` with a focused studio section adapter; do not change the generation record contract.
5. Reuse Generator Manager, validation, optimization, history, preview, copy, and export services.

Creatures, Worlds, Logos, Scenes, Vehicles, and Architecture can therefore use the same pipeline without rewriting project, storage, preview, or export architecture.

## Accessibility and performance

All controls use semantic form elements, accessible labels, live status regions, visible focus behavior inherited from the component system, and 48-pixel touch targets. Forced-colors and reduced-motion preferences are supported.

The prompt feature loads only when a prompt-related route opens. UVE datasets are resolved through the existing cached module loader. Templates are registered once, searches are cached and bounded, history DOM updates are batched into one string assignment, draft previews are debounced, and live preview never writes generated history.
