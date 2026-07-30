# Vyrelix Universal Visual Engine

## Purpose and phase boundary

The Universal Visual Engine (UVE) is the shared visual-attribute layer for every Vyrelix creative studio. It manages color, material, texture, pattern, lighting, mood, composition, camera, art style, render-quality metadata, visual effects, and studio-specific visual features.

The UVE does not generate images or prompts, call external APIs, create clothing, define personality or lore, or transmit device data. Its live preview is an abstract CSS visualization of selected metadata.

## Loading and composition

`js/visual/visualEngine.js` is the UVE composition root. The Universal Creation Engine registers it through `ModuleLoader`, and the application imports the Character Studio interface only when the `visual` route is opened. This keeps the 1,200-color generated catalog and other datasets out of the initial launch path.

The visual composition root exposes:

- normalized datasets through `getDataset()`;
- individual assets through `getAsset()`;
- searchable, filterable queries through `query()`;
- selection through a shared `VisualBuilder`;
- seeded compatible randomization;
- validation, templates, local presets, favorites, recents, palettes, and saved styles;
- specialized color, material, lighting, camera, style, composition, and mood engines.

## Visual state structure

Every visual state contains:

- `version` and `studioId`;
- eight color-role references: primary, secondary, accent, background, highlight, shadow, glow, and outline;
- material, texture, pattern, lighting, mood, composition, camera angle, camera lens, art style, and render quality references;
- an array of visual effect references;
- a `character` extension containing face, eyes, hair, hair texture, skin, facial hair, freckles, scars, birthmarks, makeup, species, fantasy features, horns, wings, tails, halo, and mechanical parts.

The UCE stores the complete UVE state inside `project.data.visual`. Universal project fields also receive the chosen art style, mood, and color-role references for dashboard compatibility.

## Dataset contract

All selectable entries follow the same shape:

```js
{
  id: "stable-id",
  name: "Human-readable name",
  category: "Filter category",
  tags: ["search", "terms"],
  studios: ["*"]
}
```

Optional fields include `value` for CSS colors or gradients, `finish`, `family`, `properties`, and other non-generative metadata. `studios: ["*"]` marks a universal asset. A restricted list such as `["character", "creature", "mascot"]` limits an asset to compatible studios.

`js/data/visual/colors.js` generates 1,200 deterministic named colors from hue families, tone names, and ten finish families. Curated colors are added with stable IDs. The catalog includes metallic, pearlescent, matte, gloss, transparent, neon, crystal, pastel, earth, fantasy, and alien families without storing thousands of repetitive literals.

All other datasets live in focused files under `js/data/visual/`. New entries must use the normalized contract and remain data-only.

## Engines

- `visualBuilder.js` updates nested visual state and emits safe clones.
- `visualPreview.js` and `assetPreview.js` create reusable accessible preview components.
- `visualRandomizer.js` provides seeded random color, material, lighting, camera, style, category, and complete-visual selection.
- `visualCompatibility.js` enforces studio access and material/texture rules.
- `visualSearch.js` caches bounded searches.
- `visualFilters.js` handles category, favorite, recent, studio, and alphabetical views.
- `visualStorage.js` owns versioned visual presets, favorites, recent items, palettes, and styles.
- `visualValidator.js` checks required state, asset references, studio access, and material/texture compatibility.
- `visualTemplates.js` provides reusable and custom visual presets.
- `colorEngine.js` defines roles, catalog lookup, saved palettes, and complementary, analogous, triadic, split-complementary, and monochromatic harmonies.
- `materialEngine.js` supports future material registration and texture checks.
- `lightingEngine.js` maps selections to lightweight preview settings.
- `cameraEngine.js` combines framing and lens metadata.
- `styleEngine.js` registers and saves styles.
- `compositionEngine.js` and `moodEngine.js` provide focused lookups.

## Compatibility rules

Compatibility is additive:

1. An asset is allowed when its `studios` list includes `*` or the active studio ID.
2. Surface-specific textures can require material categories. Rust requires metal; wood grain requires natural materials; scale, feather, and fur require natural materials; glowing textures require elemental or precious materials.
3. Search and randomization filter incompatible options before display or selection.
4. Validation repeats compatibility checks before a preset is applied or saved.

Rules return `{ compatible, reason }`, allowing future studios to explain conflicts accessibly.

## Character Studio

Character Studio is the fully implemented adapter. Its mobile workspace provides:

- searchable category selectors;
- All, Favorites, and Recent views;
- category filters and alphabetical results;
- incremental 60-item rendering for long catalogs;
- seeded current-category and complete-visual randomization;
- templates and device-local presets;
- live color, skin, face shape, hair, markings, facial hair, horns, wings, tails, halo, mechanical-part, effect, style, and lighting feedback;
- an assistive-technology description of active character features;
- Apply Visual integration with the existing Character Builder and universal Project model.

All controls have accessible names, visible focus, keyboard behavior, live result announcements, high-contrast support, and 48px minimum targets.

## Future studio extension

Each studio descriptor declares `visualCapabilities`. To activate a future studio:

1. Load `visual-engine` through the UCE module loader.
2. Reuse universal datasets for declared capabilities.
3. Add only domain-specific datasets, using the normalized entry contract.
4. Store domain selections in a studio extension under the shared visual state.
5. Reuse `VisualBuilder`, compatibility, search, filters, randomizer, storage, validator, and previews.
6. Add studio-specific compatibility rules without modifying existing datasets.

Creature Studio is ready for species features; World Studio for terrain color and atmosphere; Scene Studio for lighting and composition; Logo Studio for brand colors and shapes; Mascot Studio for character preview; Vehicle Studio for paint and materials; and Architecture Studio for exterior materials.
