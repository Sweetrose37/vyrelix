/** Character Studio descriptor; the first active UCE studio and generator. */
export const characterStudio = Object.freeze({
  id: "character", name: "Character Studio", projectType: "Character", icon: "✦",
  description: "Shape original identities, concepts, and visual direction.", active: true, generator: true, route: "builder",
  visualCapabilities: Object.freeze(["color", "material", "texture", "pattern", "lighting", "mood", "composition", "camera", "artStyle", "quality", "effects", "face", "eyes", "hair", "skin", "speciesFeatures"])
});
