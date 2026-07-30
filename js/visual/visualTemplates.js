/**
 * Built-in and custom visual preset framework.
 */
export const VISUAL_TEMPLATES = Object.freeze([
  Object.freeze({ id: "visual-blank", name: "Balanced Base", category: "Universal", values: {} }),
  Object.freeze({ id: "visual-fantasy", name: "Arcane Fantasy", category: "Fantasy", values: { lightingId: "atmospheric-5", artStyleId: "specialty-3", effects: ["luminous-4", "luminous-5"] } }),
  Object.freeze({ id: "visual-scifi", name: "Neon Future", category: "Sci-Fi", values: { materialId: "precious-3", lightingId: "staged-3", patternId: "sci-fi-1", effects: ["luminous-3"] } }),
  Object.freeze({ id: "visual-cinematic", name: "Cinematic Portrait", category: "Cinematic", values: { cameraAngleId: "framing-1", cameraLensId: "portrait-1", renderQualityId: "quality-9" } }),
  Object.freeze({ id: "visual-storybook", name: "Storybook", category: "Illustration", values: { artStyleId: "drawn-4", moodId: "calm-4", lightingId: "natural-1" } })
]);

export class VisualTemplates {
  constructor(storage) {
    this.storage = storage;
  }

  list() {
    return [...VISUAL_TEMPLATES, ...this.storage.read("presets").filter((item) => item.template)];
  }

  apply(id, builder) {
    const template = this.list().find((item) => item.id === id);
    if (!template) throw new Error("Visual template not found.");
    return builder.merge(template.values).build();
  }
}
