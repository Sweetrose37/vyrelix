/**
 * Seeded universal visual randomizer that filters every choice through compatibility rules.
 */
function createRandom(seed) {
  let value = Number(seed) || 1;
  return () => {
    value ^= value << 13; value ^= value >>> 17; value ^= value << 5;
    return (value >>> 0) / 4_294_967_296;
  };
}

export class VisualRandomizer {
  constructor({ engine, compatibility }) {
    this.engine = engine;
    this.compatibility = compatibility;
  }

  choose(category, random, context = {}) {
    const source = this.engine.getDataset(category);
    const items = category === "texture" && context.material
      ? source.filter((item) => this.compatibility.materialTexture(context.material, item).compatible)
      : this.compatibility.filter(source, context);
    return items[Math.floor(random() * items.length)] || null;
  }

  randomCategory(category, { seed = Date.now(), studioId = "character", context = {} } = {}) {
    return this.choose(category, createRandom(seed), { ...context, studioId });
  }

  randomAll({ seed = Date.now(), studioId = "character" } = {}) {
    const random = createRandom(seed);
    const pick = (category, context = {}) => this.choose(category, random, { studioId, ...context })?.id || "";
    const material = this.choose("material", random, { studioId });
    const compatibleTextures = this.engine.getDataset("texture").filter((item) => this.compatibility.materialTexture(material, item).compatible);
    const texture = compatibleTextures[Math.floor(random() * compatibleTextures.length)] || null;
    return {
      seed,
      materialId: material?.id || "",
      textureId: texture?.id || "",
      patternId: pick("pattern"),
      lightingId: pick("lighting"),
      moodId: pick("mood"),
      compositionId: pick("composition"),
      cameraAngleId: pick("cameraAngle"),
      cameraLensId: pick("cameraLens"),
      artStyleId: pick("artStyle"),
      renderQualityId: pick("renderQuality"),
      colors: {
        primaryId: pick("color"), secondaryId: pick("color"), accentId: pick("color"),
        backgroundId: pick("color"), highlightId: pick("color"), shadowId: pick("color"),
        glowId: pick("color"), outlineId: pick("color")
      },
      character: {
        faceId: pick("face"), eyesId: pick("eyes"), hairId: pick("hair"),
        hairTextureId: pick("hairTexture"), skinId: pick("skin"), facialHairId: pick("facialHair"),
        frecklesId: pick("freckles"), scarsId: pick("scars"), birthmarksId: pick("birthmarks"),
        makeupId: pick("makeup"), speciesId: pick("species"), fantasyId: pick("fantasy"),
        hornsId: pick("horns"), wingsId: pick("wings"), tailsId: pick("tails"),
        haloId: pick("halo"), mechanicalId: pick("mechanical")
      }
    };
  }
}
