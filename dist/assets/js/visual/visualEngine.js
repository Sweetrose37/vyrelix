/**
 * Universal Visual Engine composition root shared by every creative studio.
 * This module is loaded on demand so large catalogs do not affect initial application startup.
 */
import { COLORS } from "../data/visual/colors.js";
import { GRADIENTS } from "../data/visual/gradients.js";
import { MATERIALS } from "../data/visual/materials.js";
import { TEXTURES } from "../data/visual/textures.js";
import { PATTERNS } from "../data/visual/patterns.js";
import { LIGHTING } from "../data/visual/lighting.js";
import { CAMERA_ANGLES } from "../data/visual/cameraAngles.js";
import { CAMERA_LENSES } from "../data/visual/cameraLenses.js";
import { COMPOSITION_RULES } from "../data/visual/compositionRules.js";
import { MOODS } from "../data/visual/moods.js";
import { ART_STYLES } from "../data/visual/artStyles.js";
import { RENDER_QUALITIES } from "../data/visual/renderQualities.js";
import { VISUAL_EFFECTS } from "../data/visual/visualEffects.js";
import { FACE_SHAPES, FACIAL_HAIR, FACE_DETAILS } from "../data/visual/faceData.js";
import { HAIR_STYLES, HAIR_TEXTURES } from "../data/visual/hairData.js";
import { EYE_SHAPES } from "../data/visual/eyeData.js";
import { SKIN_TONES } from "../data/visual/skinData.js";
import { SPECIES_FEATURES } from "../data/visual/speciesFeatures.js";
import { VisualBuilder, DEFAULT_VISUAL } from "./visualBuilder.js";
import { VisualStorage } from "./visualStorage.js";
import { VisualSearch } from "./visualSearch.js";
import { VisualFilters } from "./visualFilters.js";
import { VisualCompatibility } from "./visualCompatibility.js";
import { VisualValidator } from "./visualValidator.js";
import { VisualRandomizer } from "./visualRandomizer.js";
import { VisualTemplates } from "./visualTemplates.js";
import { ColorEngine } from "./colorEngine.js";
import { MaterialEngine } from "./materialEngine.js";
import { LightingEngine } from "./lightingEngine.js";
import { CameraEngine } from "./cameraEngine.js";
import { StyleEngine } from "./styleEngine.js";
import { CompositionEngine } from "./compositionEngine.js";
import { MoodEngine } from "./moodEngine.js";

const byCategory = (items, category) => items.filter((item) => item.category === category);

export const VISUAL_SELECTOR_CONFIG = Object.freeze([
  { key: "primary", label: "Primary", group: "color", dataset: "color", path: "colors.primaryId" },
  { key: "secondary", label: "Secondary", group: "color", dataset: "color", path: "colors.secondaryId" },
  { key: "accent", label: "Accent", group: "color", dataset: "color", path: "colors.accentId" },
  { key: "background", label: "Background", group: "color", dataset: "color", path: "colors.backgroundId" },
  { key: "highlight", label: "Highlight", group: "color", dataset: "color", path: "colors.highlightId" },
  { key: "shadow", label: "Shadow", group: "color", dataset: "color", path: "colors.shadowId" },
  { key: "glow", label: "Glow", group: "color", dataset: "color", path: "colors.glowId" },
  { key: "outline", label: "Outline", group: "color", dataset: "color", path: "colors.outlineId" },
  { key: "material", label: "Material", group: "surface", dataset: "material", path: "materialId" },
  { key: "texture", label: "Texture", group: "surface", dataset: "texture", path: "textureId" },
  { key: "pattern", label: "Pattern", group: "surface", dataset: "pattern", path: "patternId" },
  { key: "lighting", label: "Lighting", group: "scene", dataset: "lighting", path: "lightingId" },
  { key: "mood", label: "Mood", group: "scene", dataset: "mood", path: "moodId" },
  { key: "composition", label: "Composition", group: "scene", dataset: "composition", path: "compositionId" },
  { key: "cameraAngle", label: "Camera", group: "scene", dataset: "cameraAngle", path: "cameraAngleId" },
  { key: "cameraLens", label: "Lens", group: "scene", dataset: "cameraLens", path: "cameraLensId" },
  { key: "artStyle", label: "Art Style", group: "scene", dataset: "artStyle", path: "artStyleId" },
  { key: "renderQuality", label: "Quality", group: "scene", dataset: "renderQuality", path: "renderQualityId" },
  { key: "effect", label: "Effects", group: "scene", dataset: "effect", path: "effects", multi: true },
  { key: "face", label: "Face", group: "character", dataset: "face", path: "character.faceId" },
  { key: "eyes", label: "Eyes", group: "character", dataset: "eyes", path: "character.eyesId" },
  { key: "hair", label: "Hair", group: "character", dataset: "hair", path: "character.hairId" },
  { key: "hairTexture", label: "Hair Texture", group: "character", dataset: "hairTexture", path: "character.hairTextureId" },
  { key: "skin", label: "Skin", group: "character", dataset: "skin", path: "character.skinId" },
  { key: "facialHair", label: "Facial Hair", group: "character", dataset: "facialHair", path: "character.facialHairId" },
  { key: "freckles", label: "Freckles", group: "character", dataset: "freckles", path: "character.frecklesId" },
  { key: "scars", label: "Scars", group: "character", dataset: "scars", path: "character.scarsId" },
  { key: "birthmarks", label: "Birthmarks", group: "character", dataset: "birthmarks", path: "character.birthmarksId" },
  { key: "makeup", label: "Makeup", group: "character", dataset: "makeup", path: "character.makeupId" },
  { key: "species", label: "Species", group: "features", dataset: "species", path: "character.speciesId" },
  { key: "fantasy", label: "Fantasy", group: "features", dataset: "fantasy", path: "character.fantasyId" },
  { key: "horns", label: "Horns", group: "features", dataset: "horns", path: "character.hornsId" },
  { key: "wings", label: "Wings", group: "features", dataset: "wings", path: "character.wingsId" },
  { key: "tails", label: "Tails", group: "features", dataset: "tails", path: "character.tailsId" },
  { key: "halo", label: "Halo", group: "features", dataset: "halo", path: "character.haloId" },
  { key: "mechanical", label: "Mechanical", group: "features", dataset: "mechanical", path: "character.mechanicalId" }
]);

export class VisualEngine {
  constructor({ adapter = globalThis.localStorage, initial = DEFAULT_VISUAL } = {}) {
    this.storage = new VisualStorage(adapter);
    this.search = new VisualSearch();
    this.filters = new VisualFilters();
    this.compatibility = new VisualCompatibility();
    this.builder = new VisualBuilder(initial);
    this.datasets = new Map(Object.entries({
      color: COLORS, gradient: GRADIENTS, material: MATERIALS, texture: TEXTURES, pattern: PATTERNS,
      lighting: LIGHTING, cameraAngle: CAMERA_ANGLES, cameraLens: CAMERA_LENSES,
      composition: COMPOSITION_RULES, mood: MOODS, artStyle: ART_STYLES,
      renderQuality: RENDER_QUALITIES, effect: VISUAL_EFFECTS, face: FACE_SHAPES,
      facialHair: FACIAL_HAIR, freckles: byCategory(FACE_DETAILS, "Freckles"),
      scars: byCategory(FACE_DETAILS, "Scars"), birthmarks: byCategory(FACE_DETAILS, "Birthmarks"),
      makeup: byCategory(FACE_DETAILS, "Makeup"), hair: HAIR_STYLES, hairTexture: HAIR_TEXTURES,
      eyes: EYE_SHAPES, skin: SKIN_TONES, ...SPECIES_FEATURES
    }));
    this.colors = new ColorEngine(COLORS, this.storage);
    this.materials = new MaterialEngine(MATERIALS, this.compatibility);
    this.lighting = new LightingEngine(LIGHTING);
    this.camera = new CameraEngine(CAMERA_ANGLES, CAMERA_LENSES);
    this.styles = new StyleEngine(ART_STYLES, this.storage);
    this.composition = new CompositionEngine(COMPOSITION_RULES);
    this.moods = new MoodEngine(MOODS);
    this.templates = new VisualTemplates(this.storage);
    this.validator = new VisualValidator({ getAsset: (category, id) => this.getAsset(category, id), compatibility: this.compatibility });
    this.randomizer = new VisualRandomizer({ engine: this, compatibility: this.compatibility });
  }

  getDataset(category) {
    const aliases = {
      primary: "color", secondary: "color", accent: "color", background: "color",
      highlight: "color", shadow: "color", glow: "color", outline: "color", effects: "effect"
    };
    return this.datasets.get(aliases[category] || category) || [];
  }

  getAsset(category, id) {
    return this.getDataset(category).find((item) => item.id === id) || null;
  }

  getValue(path, visual = this.builder.value) {
    return String(path).split(".").reduce((value, segment) => value?.[segment], visual);
  }

  select(config, assetId) {
    if (!this.getAsset(config.dataset, assetId)) throw new Error("Visual asset not found.");
    config.multi ? this.builder.toggleEffect(assetId) : this.builder.set(config.path, assetId);
    if (config.dataset === "material") {
      const material = this.getAsset("material", assetId);
      const texture = this.getAsset("texture", this.builder.value.textureId);
      if (!this.compatibility.materialTexture(material, texture).compatible) {
        const fallback = this.getDataset("texture").find((item) => this.compatibility.materialTexture(material, item).compatible);
        if (fallback) this.builder.set("textureId", fallback.id);
      }
    }
    this.storage.touch(assetId);
    return this.builder.build();
  }

  query(config, { query = "", category = "all", favorites = false, recent = false, studio = "character" } = {}) {
    const searched = this.search.search(this.getDataset(config.dataset), query);
    const compatible = config.dataset === "texture"
      ? searched.filter((item) => this.compatibility.materialTexture(this.getAsset("material", this.builder.value.materialId), item).compatible)
      : searched;
    return this.filters.apply(compatible, {
      category, favorites, recent, studio,
      favoriteIds: this.storage.read("favorites"),
      recentIds: this.storage.read("recent")
    });
  }

  randomAll(seed) {
    const random = this.randomizer.randomAll({ seed, studioId: this.builder.value.studioId });
    this.builder.merge(random);
    return this.builder.build();
  }

  savePreset(name) {
    const visual = this.builder.build();
    const validation = this.validator.validate(visual, visual.studioId);
    if (!validation.valid) throw new Error(validation.errors[0]);
    const preset = { id: `visual-${Date.now()}`, name: String(name || "Visual Preset").trim(), visual, updatedAt: new Date().toISOString() };
    this.storage.saveUnique("presets", preset);
    return preset;
  }
}
