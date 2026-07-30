/**
 * Shared immutable datasets available to every studio without duplication.
 * Prompt-related datasets are placeholders only; no prompt generation exists in this phase.
 */
export const CORE_DATASETS = Object.freeze({
  identity: Object.freeze({
    givenNames: Object.freeze(["Aria", "Lyra", "Kael", "Mira", "Orin", "Sable"]),
    familyNames: Object.freeze(["Nocturne", "Voss", "Vale", "Aster", "Rook", "Sol"]),
    archetypes: Object.freeze(["Guardian", "Visionary", "Outlaw", "Scholar", "Trickster"])
  }),
  appearance: Object.freeze([]),
  materials: Object.freeze(["Glass", "Stone", "Metal", "Wood", "Fabric", "Ceramic"]),
  colors: Object.freeze(["Burnished gold", "Midnight blue", "Crimson", "Silver", "Ivory", "Obsidian"]),
  lighting: Object.freeze(["Soft daylight", "Blue hour", "Rim light", "Volumetric glow"]),
  camera: Object.freeze(["Eye level", "Low angle", "Wide establishing", "Close portrait"]),
  environment: Object.freeze(["Interior", "Wilderness", "Urban", "Cosmic", "Underwater"]),
  composition: Object.freeze(["Centered", "Rule of thirds", "Symmetrical", "Dynamic diagonal"]),
  mood: Object.freeze(["Dreamlike", "Tense", "Triumphant", "Quiet", "Mysterious"]),
  style: Object.freeze({
    themes: Object.freeze(["Fantasy", "Sci-Fi", "Modern", "Anime", "Realistic"]),
    artStyles: Object.freeze(["Cinematic", "Illustrative", "Graphic", "Photoreal", "Minimal"])
  }),
  promptTemplates: Object.freeze([]),
  negativePrompts: Object.freeze([]),
  quality: Object.freeze(["Draft", "Standard", "Premium"])
});
