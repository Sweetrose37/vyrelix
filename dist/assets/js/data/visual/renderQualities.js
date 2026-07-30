/** Non-generative render-quality labels saved as visual project metadata. */
import { createVisualOptions } from "./helpers.js";

export const RENDER_QUALITIES = createVisualOptions([
  "Ultra Detailed", "8K", "4K", "Sharp Focus", "Professional", "Award Winning",
  "Photorealistic", "Highly Detailed", "Cinematic", "Masterpiece", "Concept Art"
], "Quality");
