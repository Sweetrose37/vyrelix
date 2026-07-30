/** Inclusive skin-tone and surface-finish metadata for Character Studio previews. */
import { createVisualOptions } from "./helpers.js";

export const SKIN_TONES = Object.freeze([
  ...createVisualOptions(["Porcelain", "Ivory", "Sand", "Honey", "Amber", "Caramel", "Chestnut", "Umber", "Espresso", "Ebony"], "Natural"),
  ...createVisualOptions(["Moonlit Blue", "Verdant", "Lavender", "Crimson", "Obsidian", "Pearlescent"], "Fantasy")
].map((item, index) => Object.freeze({
  ...item,
  value: ["#F4DCCB", "#EBC9AE", "#D7AA82", "#C58C5C", "#B87645", "#9A5D3A", "#78452F", "#5A3327", "#3C241F", "#231A18", "#829FC2", "#6A9E76", "#9B83BA", "#A44853", "#24232A", "#D8C9DA"][index]
})));
