/**
 * Reusable negative prompt defaults and device-local preset support.
 */
export const DEFAULT_NEGATIVE_TERMS = Object.freeze([
  "low quality", "blurry", "unintended cropping", "duplicate",
  "watermark", "low resolution", "visual artifacts"
]);

/** Builds a negative prompt from defaults and optional terms. */
export function buildNegativePrompt({ enabled = true, value = "", extra = [] } = {}) {
  if (!enabled) return "";
  return [...DEFAULT_NEGATIVE_TERMS, ...String(value).split(","), ...extra]
    .map((term) => String(term).trim()).filter(Boolean)
    .filter((term, index, all) => all.findIndex((item) => item.toLocaleLowerCase() === term.toLocaleLowerCase()) === index)
    .join(", ");
}

/** Saves a reusable negative-prompt preset. */
export function saveNegativePreset(storage, name, value) {
  const preset = { id: `negative-${Date.now().toString(36)}`, name: String(name).trim(), value: String(value).trim() };
  if (!preset.name || !preset.value) throw new Error("Preset name and terms are required.");
  storage.saveNegativePreset(preset);
  return preset;
}
