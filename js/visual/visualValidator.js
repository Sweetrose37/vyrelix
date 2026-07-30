/**
 * Validates UVE state, registered asset references, and studio compatibility.
 */
export class VisualValidator {
  constructor({ getAsset, compatibility }) {
    this.getAsset = getAsset;
    this.compatibility = compatibility;
  }

  validate(visual, studioId = "character") {
    const errors = [];
    if (!visual || typeof visual !== "object" || Array.isArray(visual)) return { valid: false, errors: ["Visual state must be an object."] };
    ["version", "studioId", "colors", "character"].forEach((field) => {
      if (!(field in visual)) errors.push(`Missing visual field: ${field}.`);
    });
    this.references(visual).forEach(({ category, id }) => {
      const item = this.getAsset(category, id);
      if (!item) errors.push(`Unknown ${category} asset: ${id}.`);
      else if (!this.compatibility.supportsStudio(item, studioId)) errors.push(`${item.name} is incompatible with ${studioId}.`);
    });
    const materialTexture = this.compatibility.materialTexture(
      this.getAsset("material", visual.materialId),
      this.getAsset("texture", visual.textureId)
    );
    if (!materialTexture.compatible) errors.push(materialTexture.reason);
    return { valid: errors.length === 0, errors };
  }

  references(visual) {
    const references = [];
    const visit = (value, key) => {
      if (typeof value === "string" && key.endsWith("Id") && key !== "studioId" && value) references.push({ category: key.slice(0, -2), id: value });
      else if (Array.isArray(value)) value.forEach((item) => typeof item === "string" && references.push({ category: key, id: item }));
      else if (value && typeof value === "object") Object.entries(value).forEach(([childKey, child]) => visit(child, childKey));
    };
    visit(visual, "");
    return references;
  }
}
