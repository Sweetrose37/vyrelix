/** Legacy character capability descriptor registered with the universal engine. */
export const characterStudio = Object.freeze({
  id: "character", name: "Universal Creative Engine", projectType: "Character", icon: "✦",
  description: "Shape original identities, concepts, and visual direction.", active: true, generator: true, route: "builder",
  visualCapabilities: Object.freeze(["color", "material", "texture", "pattern", "lighting", "mood", "composition", "camera", "artStyle", "quality", "effects", "face", "eyes", "hair", "skin", "speciesFeatures"])
});
