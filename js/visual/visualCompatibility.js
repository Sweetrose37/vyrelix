/**
 * Compatibility rules shared by every studio and respected by the visual randomizer.
 */
const TEXTURE_RULES = Object.freeze({
  Rusty: ["Metal"],
  "Wood Grain": ["Natural"],
  Scale: ["Natural"],
  Feather: ["Natural"],
  Fur: ["Natural"],
  Glowing: ["Elemental", "Precious"],
  Reflective: ["Metal", "Elemental", "Precious"]
});

export class VisualCompatibility {
  supportsStudio(item, studioId) {
    return !item?.studios || item.studios.includes("*") || item.studios.includes(studioId);
  }

  materialTexture(material, texture) {
    const allowed = TEXTURE_RULES[texture?.name];
    if (!allowed || !material) return { compatible: true, reason: "" };
    const compatible = allowed.includes(material.category);
    return { compatible, reason: compatible ? "" : `${texture.name} works best with ${allowed.join(" or ").toLocaleLowerCase()} materials.` };
  }

  selection(item, { studioId = "character", material = null, texture = null } = {}) {
    if (!this.supportsStudio(item, studioId)) return { compatible: false, reason: `${item.name} is not available in this studio.` };
    return this.materialTexture(material, texture);
  }

  filter(items, context) {
    return items.filter((item) => this.selection(item, context).compatible);
  }
}
