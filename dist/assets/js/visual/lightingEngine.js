/**
 * Lighting selection metadata for reusable preview interpretation.
 */
export class LightingEngine {
  constructor(lighting) {
    this.lighting = new Map(lighting.map((item) => [item.id, item]));
  }

  get(id) {
    return this.lighting.get(id) || null;
  }

  previewSettings(id) {
    const item = this.get(id);
    const category = item?.category;
    return {
      name: item?.name || "Soft Light",
      contrast: category === "Staged" ? 1.18 : category === "Atmospheric" ? 0.88 : 1,
      glow: category === "Atmospheric" || item?.name === "Neon",
      direction: item?.name?.includes("Back") ? "back" : item?.name?.includes("Under") ? "under" : "front"
    };
  }
}
