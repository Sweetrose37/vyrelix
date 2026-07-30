/**
 * Extensible material registry and material/texture compatibility facade.
 */
export class MaterialEngine {
  constructor(materials, compatibility) {
    this.materials = new Map(materials.map((item) => [item.id, item]));
    this.compatibility = compatibility;
  }

  register(material) {
    if (!material?.id || this.materials.has(material.id)) throw new Error("Material requires a unique id.");
    this.materials.set(material.id, Object.freeze(material));
    return this;
  }

  get(id) {
    return this.materials.get(id) || null;
  }

  canUseTexture(materialId, texture) {
    return this.compatibility.materialTexture(this.get(materialId), texture);
  }
}
