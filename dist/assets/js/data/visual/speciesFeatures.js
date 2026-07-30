/** Character and Creature Studio feature datasets with explicit studio compatibility. */
import { createVisualOptions, freezeVisualGroups } from "./helpers.js";

function characterCreature(names, category) {
  return createVisualOptions(names, category).map((item) => Object.freeze({ ...item, studios: Object.freeze(["character", "creature", "mascot"]) }));
}

export const SPECIES_FEATURES = freezeVisualGroups({
  species: characterCreature(["Human", "Elven", "Fae", "Avian", "Aquatic", "Draconic", "Feline", "Canine", "Insectoid", "Synthetic"], "Species"),
  fantasy: characterCreature(["None", "Arcane Markings", "Bioluminescence", "Extra Eyes", "Elemental Veins", "Living Shadow"], "Fantasy Feature"),
  horns: characterCreature(["None", "Ram Horns", "Antlers", "Crown Horns", "Spiral Horns", "Crystal Horns"], "Horns"),
  wings: characterCreature(["None", "Feather Wings", "Bat Wings", "Dragonfly Wings", "Energy Wings", "Mechanical Wings"], "Wings"),
  tails: characterCreature(["None", "Feline Tail", "Canine Tail", "Reptile Tail", "Aquatic Tail", "Mechanical Tail"], "Tails"),
  halo: characterCreature(["None", "Light Ring", "Runic Halo", "Solar Halo", "Broken Halo", "Mechanical Halo"], "Halo"),
  mechanical: characterCreature(["None", "Mechanical Arm", "Mechanical Eye", "Face Plates", "Spinal Interface", "Synthetic Limbs"], "Mechanical Parts")
});
