/**
 * Mutable-internal, immutable-output builder for universal visual state.
 */
export const DEFAULT_VISUAL = Object.freeze({
  version: "1.0.0",
  studioId: "character",
  colors: Object.freeze({
    primaryId: "color-burnished-gold",
    secondaryId: "color-moon-silver",
    accentId: "color-starlight",
    backgroundId: "color-void-black",
    highlightId: "color-starlight",
    shadowId: "color-void-black",
    glowId: "color-starlight",
    outlineId: "color-moon-silver"
  }),
  materialId: "natural-1",
  textureId: "surface-1",
  patternId: "classic-1",
  lightingId: "natural-1",
  moodId: "calm-1",
  compositionId: "balanced-1",
  cameraAngleId: "framing-1",
  cameraLensId: "portrait-1",
  artStyleId: "illustration-1",
  renderQualityId: "quality-1",
  effects: Object.freeze([]),
  character: Object.freeze({
    faceId: "face-1", eyesId: "natural-1", hairId: "length-1", hairTextureId: "hair-texture-1",
    skinId: "natural-5", facialHairId: "facial-hair-1", frecklesId: "freckles-1",
    scarsId: "scars-1", birthmarksId: "birthmarks-1", makeupId: "makeup-1",
    speciesId: "species-1", fantasyId: "fantasy-feature-1", hornsId: "horns-1",
    wingsId: "wings-1", tailsId: "tails-1", haloId: "halo-1", mechanicalId: "mechanical-parts-1"
  })
});

export class VisualBuilder {
  constructor(initial = DEFAULT_VISUAL) {
    this.value = structuredClone(initial);
  }

  set(path, value) {
    const segments = String(path).split(".");
    const final = segments.pop();
    let target = this.value;
    segments.forEach((segment) => {
      if (!target[segment] || typeof target[segment] !== "object") target[segment] = {};
      target = target[segment];
    });
    target[final] = value;
    return this;
  }

  toggleEffect(id) {
    const effects = new Set(this.value.effects || []);
    effects.has(id) ? effects.delete(id) : effects.add(id);
    this.value.effects = [...effects];
    return this;
  }

  merge(value) {
    this.value = { ...this.value, ...structuredClone(value), colors: { ...this.value.colors, ...(value.colors || {}) }, character: { ...this.value.character, ...(value.character || {}) } };
    return this;
  }

  build() {
    return structuredClone(this.value);
  }
}
