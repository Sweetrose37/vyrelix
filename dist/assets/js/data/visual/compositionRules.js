/** Composition rules available to every visual studio. */
import { createVisualOptions } from "./helpers.js";

export const COMPOSITION_RULES = Object.freeze([
  ...createVisualOptions(["Centered", "Symmetrical", "Rule of Thirds", "Golden Ratio"], "Balanced"),
  ...createVisualOptions(["Dynamic Diagonal", "Leading Lines", "Frame Within Frame"], "Directional"),
  ...createVisualOptions(["Negative Space", "Layered Depth", "Radial Focus"], "Spatial")
]);
