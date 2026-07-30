/** Reusable lighting setups with intensity and direction metadata. */
import { createVisualOptions } from "./helpers.js";

const NATURAL = ["Soft Light", "Hard Light", "Golden Hour", "Sunrise", "Sunset", "Moonlight", "Overcast"];
const STAGED = ["Studio", "Volumetric", "Neon", "Rim Light", "Back Light", "Spotlight", "Under Light"];
const ATMOSPHERIC = ["Firelight", "Torchlight", "Storm", "Fog", "Magic Aura"];

export const LIGHTING = Object.freeze([
  ...createVisualOptions(NATURAL, "Natural"),
  ...createVisualOptions(STAGED, "Staged"),
  ...createVisualOptions(ATMOSPHERIC, "Atmospheric")
]);
