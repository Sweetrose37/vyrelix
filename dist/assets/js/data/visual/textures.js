/** Texture dataset describing surface character independently from material choice. */
import { createVisualOptions } from "./helpers.js";

export const TEXTURES = Object.freeze([
  ...createVisualOptions(["Smooth", "Rough", "Cracked", "Polished", "Weathered", "Burned", "Frozen", "Wet", "Dusty", "Dirty", "Rusty", "Glowing", "Reflective"], "Surface"),
  ...createVisualOptions(["Scale", "Feather", "Fur"], "Organic"),
  ...createVisualOptions(["Stone", "Wood Grain"], "Natural")
]);
