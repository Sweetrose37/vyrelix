/** Character eye shapes and non-biometric visual treatments. */
import { createVisualOptions } from "./helpers.js";

export const EYE_SHAPES = Object.freeze([
  ...createVisualOptions(["Almond", "Round", "Hooded", "Upturned", "Downturned", "Deep Set", "Monolid"], "Natural"),
  ...createVisualOptions(["Luminous", "Star Pupil", "Slit Pupil", "Mechanical Iris", "Compound"], "Fantasy")
]);
