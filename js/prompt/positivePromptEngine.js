/**
 * Converts a universal project object into semantic positive-prompt sections.
 */
import { displayValue } from "./promptFormatter.js";

/** Resolves UVE references to display names when the visual engine is available. */
function visualName(visualEngine, type, id) {
  return visualEngine?.getAsset(type, id)?.name || "";
}

/** Creates ordered natural-language sections from project and generation settings. */
export function buildPositiveSections(project, settings = {}, visualEngine = null) {
  const data = project.data || {};
  const visual = data.visual || {};
  const character = visual.character || {};
  const identity = [
    data.archetype && `Their identity draws on the ${data.archetype} archetype`,
    data.traits && `with a ${data.traits} personality`
  ].filter(Boolean).join(", ");
  const appearanceNames = [
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
  return {
    subject: settings.subject || project.name || "an original subject",
    identity: identity || (project.description && `The concept is ${project.description}`),
    appearance: appearanceNames.length ? `Their appearance features ${displayValue(appearanceNames)}` : "",
    visualDetails: details.length ? `Distinctive visual details include ${displayValue(details)}` : "",
    materials: visual.materialId ? `Surfaces use ${visualName(visualEngine, "material", visual.materialId)} with ${visualName(visualEngine, "texture", visual.textureId)}` : "",
    colors: colors.length ? `The palette balances ${displayValue(colors)}` : displayValue(project.colorPalette) ? `The palette uses ${displayValue(project.colorPalette)}` : "",
    environment: settings.environment ? `Set the subject within ${settings.environment}` : "",
    lighting: `Use ${visualName(visualEngine, "lighting", visual.lightingId) || settings.lighting || "cinematic balanced lighting"}`,
    camera: `Frame it from ${visualName(visualEngine, "cameraAngle", visual.cameraAngleId) || settings.camera || "an intentional eye-level perspective"}${visual.cameraLensId ? ` through ${visualName(visualEngine, "cameraLens", visual.cameraLensId)}` : ""}`,
    composition: `Compose the image with ${visualName(visualEngine, "composition", visual.compositionId) || settings.composition || "clear visual hierarchy"}`,
    mood: `The mood feels ${visualName(visualEngine, "mood", visual.moodId) || project.theme || settings.mood || "evocative"}`,
    artStyle: `Render it in a ${visualName(visualEngine, "artStyle", visual.artStyleId) || project.artStyle || settings.artStyle || "cinematic"} visual style`,
    quality: `Finish with ${visualName(visualEngine, "renderQuality", visual.renderQualityId) || settings.quality || "premium detail and clean edges"}`,
    additional: settings.additional ? `Additional direction: ${settings.additional}` : ""
  };
}

