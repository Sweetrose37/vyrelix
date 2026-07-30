/** Pattern dataset usable on any UVE-compatible surface. */
import { createVisualOptions } from "./helpers.js";

export const PATTERNS = Object.freeze([
  ...createVisualOptions(["Solid", "Striped", "Plaid", "Floral", "Paisley", "Camouflage"], "Classic"),
  ...createVisualOptions(["Geometric", "Hexagonal", "Abstract", "Organic"], "Graphic"),
  ...createVisualOptions(["Runic", "Galaxy", "Fantasy"], "Fantasy"),
  ...createVisualOptions(["Circuit", "Sci-Fi"], "Sci-Fi")
]);
