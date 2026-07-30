/** Creature Studio registration scaffold. */
export const creatureStudio = Object.freeze({
  id: "creature", name: "Creature Studio", projectType: "Creature", icon: "◇",
  description: "Design original beings, species, and fantastical life.", active: false, generator: false,
  visualCapabilities: Object.freeze(["color", "material", "texture", "lighting", "speciesFeatures"])
});
