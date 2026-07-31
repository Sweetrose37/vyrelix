/**
 * Converts any universal project into semantic, output-aware creative sections.
 */
import { displayValue } from "./promptFormatter.js";

function visualName(visualEngine, type, id) {
  return visualEngine?.getAsset(type, id)?.name || "";
}

function readableLabel(key) {
  return String(key).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[-_]/g, " ").toLocaleLowerCase();
}

function answerDirection(answers = {}) {
  return Object.entries(answers)
    .filter(([, value]) => String(value ?? "").trim())
    .map(([key, value]) => `${readableLabel(key)}: ${String(value).trim()}`)
    .join("; ");
}

export function buildPositiveSections(project, settings = {}, visualEngine = null) {
  const data = project.data || {};
  const visual = data.visual || {};
  const character = visual.character || {};
  const characterType = ["Character", "Creature", "Mascot"].includes(project.type);
  const appearance = [
    visualName(visualEngine, "face", character.faceId),
    visualName(visualEngine, "eyes", character.eyesId),
    visualName(visualEngine, "hair", character.hairId),
    visualName(visualEngine, "skin", character.skinId),
    visualName(visualEngine, "species", character.speciesId)
  ].filter(Boolean);
  const details = [
    visualName(visualEngine, "freckles", character.frecklesId),
    visualName(visualEngine, "scars", character.scarsId),
    visualName(visualEngine, "makeup", character.makeupId),
    visualName(visualEngine, "horns", character.hornsId),
    visualName(visualEngine, "wings", character.wingsId),
    visualName(visualEngine, "halo", character.haloId),
    visualName(visualEngine, "mechanical", character.mechanicalId)
  ].filter(Boolean);
  const colors = Object.values(visual.colors || {}).map((id) => visualName(visualEngine, "color", id)).filter(Boolean);
  const answers = answerDirection(data.answers);
  return {
    subject: settings.subject || project.name || "an original creative concept",
    output: project.category || project.type || "creative asset",
    identity: project.description && project.description !== "No description yet." ? `Creative goal: ${project.description}` : "",
    brief: answers ? `Approved direction: ${answers}` : "",
    appearance: characterType && appearance.length ? `Subject appearance: ${displayValue(appearance)}` : "",
    visualDetails: characterType && details.length ? `Distinctive details: ${displayValue(details)}` : "",
    materials: visual.materialId ? `Materials: ${visualName(visualEngine, "material", visual.materialId)} with ${visualName(visualEngine, "texture", visual.textureId)}` : "",
    colors: colors.length ? `Palette: ${displayValue(colors)}` : displayValue(project.colorPalette) ? `Palette: ${displayValue(project.colorPalette)}` : "",
    environment: settings.environment ? `Environment: ${settings.environment}` : "",
    lighting: `Lighting: ${visualName(visualEngine, "lighting", visual.lightingId) || settings.lighting || "balanced and intentional"}`,
    camera: `Viewpoint: ${visualName(visualEngine, "cameraAngle", visual.cameraAngleId) || settings.camera || "appropriate to the format"}${visual.cameraLensId ? ` through ${visualName(visualEngine, "cameraLens", visual.cameraLensId)}` : ""}`,
    composition: `Composition: ${visualName(visualEngine, "composition", visual.compositionId) || settings.composition || "clear visual hierarchy"}`,
    mood: `Mood: ${visualName(visualEngine, "mood", visual.moodId) || project.theme || settings.mood || "purposeful"}`,
    artStyle: `Style: ${visualName(visualEngine, "artStyle", visual.artStyleId) || project.artStyle || settings.artStyle || "polished"}`,
    quality: `Finish: ${visualName(visualEngine, "renderQuality", visual.renderQualityId) || settings.quality || "production-ready detail and clean edges"}`,
    additional: settings.additional ? `Additional direction: ${settings.additional}` : ""
  };
}
