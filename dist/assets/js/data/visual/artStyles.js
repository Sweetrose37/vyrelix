/** Original art-style vocabulary available to all studios. */
import { createVisualOptions } from "./helpers.js";

export const ART_STYLES = Object.freeze([
  ...createVisualOptions(["Anime", "Semi Realistic", "Realistic", "Painterly", "Oil", "Watercolor"], "Illustration"),
  ...createVisualOptions(["Comic", "Graphic Novel", "Stylized", "Children's Book", "Ink", "Sketch"], "Drawn"),
  ...createVisualOptions(["Pixel Art", "Voxel", "Low Poly", "High Poly"], "Digital"),
  ...createVisualOptions(["3D Render", "Clay", "Fantasy Illustration", "Sci-Fi Illustration"], "Specialty")
]);
